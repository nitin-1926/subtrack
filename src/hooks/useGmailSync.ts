import { useState, useCallback, useEffect } from 'react';
import gmailApi from '@/api/gmailApi';

interface UseGmailSyncOptions {
  onAuthSuccess?: (tokens: { accessToken: string; refreshToken?: string }) => void;
  onError?: (error: Error) => void;
}

interface SubscriptionCandidate {
  messageId: string;
  serviceName: string;
  amount: number;
  date: string;
  confidence: number; // 0-100 score indicating confidence in the extraction
}

export function useGmailSync(options: UseGmailSyncOptions = {}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('gmail_access_token')
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem('gmail_refresh_token')
  );
  const [tokenExpiry, setTokenExpiry] = useState<number>(
    Number(localStorage.getItem('gmail_token_expiry') || 0)
  );
  const [subscriptionCandidates, setSubscriptionCandidates] = useState<SubscriptionCandidate[]>([]);

  // Check if token is expired
  const isTokenExpired = useCallback(() => {
    if (!tokenExpiry) return true;
    return Date.now() > tokenExpiry;
  }, [tokenExpiry]);

  // Initialize auth state
  useEffect(() => {
    if (accessToken && !isTokenExpired()) {
      setIsAuthenticated(true);
    } else if (refreshToken) {
      refreshAccessTokenFn();
    }
  }, []);

  // Start OAuth flow
  const startAuthFlow = useCallback(() => {
    try {
      const authUrl = gmailApi.getAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
    }
  }, [options]);

  // Handle OAuth callback
  const handleAuthCallback = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tokens = await gmailApi.exchangeCodeForTokens(code);
      
      // Save tokens
      const expiryTime = Date.now() + tokens.expires_in * 1000;
      localStorage.setItem('gmail_access_token', tokens.access_token);
      localStorage.setItem('gmail_token_expiry', expiryTime.toString());
      setAccessToken(tokens.access_token);
      setTokenExpiry(expiryTime);
      setIsAuthenticated(true);
      
      // Save refresh token if provided
      if (tokens.refresh_token) {
        localStorage.setItem('gmail_refresh_token', tokens.refresh_token);
        setRefreshToken(tokens.refresh_token);
      }
      
      options.onAuthSuccess?.({ 
        accessToken: tokens.access_token, 
        refreshToken: tokens.refresh_token 
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // Refresh access token
  const refreshAccessTokenFn = useCallback(async () => {
    if (!refreshToken) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await gmailApi.refreshAccessToken(refreshToken);
      
      // Update access token
      const expiryTime = Date.now() + result.expires_in * 1000;
      localStorage.setItem('gmail_access_token', result.access_token);
      localStorage.setItem('gmail_token_expiry', expiryTime.toString());
      setAccessToken(result.access_token);
      setTokenExpiry(expiryTime);
      setIsAuthenticated(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
      
      // If refresh token is invalid, clear auth state
      localStorage.removeItem('gmail_access_token');
      localStorage.removeItem('gmail_refresh_token');
      localStorage.removeItem('gmail_token_expiry');
      setAccessToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [refreshToken, options]);

  // Scan emails for subscriptions
  const scanEmails = useCallback(async () => {
    if (!accessToken) {
      setError(new Error('Not authenticated with Gmail'));
      return;
    }
    
    if (isTokenExpired() && refreshToken) {
      await refreshAccessTokenFn();
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting email scan for subscriptions...');
      
      // First approach: Search for subscription-related emails
      const response = await gmailApi.searchSubscriptionEmails(accessToken);
      console.log(`Found ${response.messages?.length || 0} potential subscription emails`);
      
      // Determine how many messages to process (max 100 for performance)
      const messagesToProcess = response.messages?.slice(0, 100) || [];
      
      if (messagesToProcess.length === 0) {
        console.log('No subscription-related emails found');
        return [];
      }
      
      // Get message IDs to process in batch
      const messageIds = messagesToProcess.map(msg => msg.id);
      
      // Process messages in batches
      console.log(`Processing ${messageIds.length} messages in batch`);
      const messages = await gmailApi.batchGetMessages(accessToken, messageIds);
      console.log(`Retrieved ${messages.length} full messages`);
      
      const candidates: SubscriptionCandidate[] = [];
      
      // Process each message
      for (const message of messages) {
        try {
          // Extract headers
          const headers = message.payload?.headers || [];
          const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
          const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
          const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
          
          // Extract email body (simplified)
          let body = '';
          if (message.payload?.body?.data) {
            // Base64 decode
            body = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          } else if (message.payload?.parts) {
            // Try to find text part
            const textPart = message.payload.parts.find(part => 
              part.mimeType === 'text/plain' || part.mimeType === 'text/html'
            );
            if (textPart?.body?.data) {
              body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            }
          }
          
          // Extract potential subscription info
          const amountMatches = body.match(/\$(\d+\.\d{2})/g) || [];
          const dateMatches = body.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g) || [];
          
          // Extract potential service name
          let serviceName = '';
          if (from) {
            // Try to extract company name from email address
            const fromMatch = from.match(/[^@<>]+@([^@.]+)\./i);
            if (fromMatch && fromMatch[1]) {
              serviceName = fromMatch[1].charAt(0).toUpperCase() + fromMatch[1].slice(1);
            }
          }
          
          // If we couldn't extract from email, try subject
          if (!serviceName && subject) {
            // Remove common prefixes like "Your receipt from" or "Invoice:"
            serviceName = subject
              .replace(/^(Your|Receipt|Invoice|Payment|Billing|from|:)\s+/i, '')
              .split(' ')
              .slice(0, 2)
              .join(' ');
          }
          
          // Skip if we couldn't extract a service name or amount
          if (!serviceName || amountMatches.length === 0) {
            continue;
          }
          
          // Extract the first amount found
          const amountStr = amountMatches[0];
          const amount = parseFloat(amountStr.replace('$', ''));
          
          // Use the first date found or current date
          let billingDate = new Date().toISOString().split('T')[0];
          if (dateMatches.length > 0) {
            billingDate = dateMatches[0];
          }
          
          // Calculate a confidence score
          let confidence = 50; // Base confidence
          
          // Increase confidence if subject contains subscription-related terms
          if (subject.match(/subscri|renew|billing|payment|receipt/i)) {
            confidence += 20;
          }
          
          // Increase confidence if we found both amount and date
          if (amountMatches.length > 0 && dateMatches.length > 0) {
            confidence += 20;
          }
          
          // Increase confidence if amount is a "round" number like 9.99
          if (amount.toFixed(2).match(/\.(99|95|00)$/)) {
            confidence += 10;
          }
          
          candidates.push({
            messageId: message.id,
            serviceName,
            amount,
            date: billingDate,
            confidence: Math.min(confidence, 100), // Cap at 100
          });
        } catch (err) {
          console.error('Error processing message:', err);
          // Continue with next message
        }
      }
      
      // Sort by confidence (highest first)
      candidates.sort((a, b) => b.confidence - a.confidence);
      console.log(`Found ${candidates.length} subscription candidates`);
      setSubscriptionCandidates(candidates);
      
      return candidates;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Error scanning emails:', error);
      setError(error);
      options.onError?.(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, refreshToken, isTokenExpired, refreshAccessTokenFn, options]);

  // Logout/disconnect
  const disconnect = useCallback(() => {
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_refresh_token');
    localStorage.removeItem('gmail_token_expiry');
    setAccessToken(null);
    setRefreshToken(null);
    setTokenExpiry(0);
    setIsAuthenticated(false);
    setSubscriptionCandidates([]);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    startAuthFlow,
    handleAuthCallback,
    refreshAccessToken: refreshAccessTokenFn,
    scanEmails,
    subscriptionCandidates,
    disconnect,
  };
}
