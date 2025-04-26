import { useState, useCallback, useEffect } from 'react';
import gmailApi from '@/api/gmailApi';
import type { GmailMessage } from '@/api/gmailApi';
import openaiApi from '@/api/openaiApi';

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

interface EmailBatchItem {
  messageId: string;
  content: string;
  gmailAccountId?: string;
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

  // Track processed auth codes to prevent reuse
  const [processedCodes] = useState<Set<string>>(new Set());

  // Handle OAuth callback
  const handleAuthCallback = useCallback(async (code: string) => {
    // Prevent processing the same code multiple times
    if (processedCodes.has(code)) {
      console.log('Auth code has already been processed, ignoring duplicate callback');
      return;
    }

    // Mark this code as being processed
    processedCodes.add(code);
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Exchanging authorization code for tokens...');
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
      
      console.log('Authentication successful, tokens saved');
      options.onAuthSuccess?.({ 
        accessToken: tokens.access_token, 
        refreshToken: tokens.refresh_token 
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Authentication error:', error.message);
      setError(error);
      options.onError?.(error);
      
      // Remove this code from processed codes if there was an error
      // This allows retrying with a new code
      processedCodes.delete(code);
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

  // Scan emails for subscription information
  const scanEmails = useCallback(async (fullMessages?: GmailMessage[]) => {
    if (!accessToken || isTokenExpired()) {
      if (refreshToken) {
        await refreshAccessTokenFn();
      } else {
        setError(new Error('Not authenticated'));
        return [];
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Scanning emails for subscription information...');
      
      let messages: GmailMessage[] = [];
      
      // Use provided fullMessages if available, otherwise fetch them
      if (fullMessages && fullMessages.length > 0) {
        console.log(`Using ${fullMessages.length} provided messages`);
        messages = fullMessages;
      } else {
        // First, get list of potential subscription emails
        const response = await gmailApi.searchSubscriptionEmails(accessToken);
        
        if (!response.messages || response.messages.length === 0) {
          console.log('No potential subscription emails found');
          return [];
        }
        
        console.log(`Found ${response.messages.length} potential subscription emails`);
        
        // Limit the number of messages to process to avoid overloading
        const MAX_MESSAGES = 50;
        const messagesToProcess = response.messages.slice(0, MAX_MESSAGES);
        
        if (messagesToProcess.length < response.messages.length) {
          console.log(`Processing only ${messagesToProcess.length} out of ${response.messages.length} messages`);
        }
        
        // Get message IDs to process in batch
        const messageIds = messagesToProcess.map(msg => msg.id);
        
        // Process messages in batches
        console.log(`Processing ${messageIds.length} messages in batch`);
        messages = await gmailApi.getFullMessages(accessToken, messageIds);
        console.log(`Retrieved ${messages.length} full messages`);
      }
      
      const candidates: SubscriptionCandidate[] = [];
      
      // Import OpenAI API client
      const openaiApi = (await import('@/api/openaiApi')).default;
      
      // Prepare batch of emails for OpenAI analysis
      const emailBatch: { messageId: string; content: string }[] = [];
      const messageMap: Record<string, { body: string; from: string; subject: string; date: string }> = {};
      
      console.log('Preparing email batch for analysis...');
      
      // Process each message to extract content
      for (const message of messages) {
        try {
          // Extract headers
          const headers = message.payload?.headers || [];
          const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
          const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
          const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
          
          // Extract email body and clean it
          let body = '';
          let htmlBody = '';
          
          // Extract body content from the message
          if (message.payload?.body?.data) {
            // Base64 decode
            body = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          } else if (message.payload?.parts) {
            // Try to find text parts
            const textPart = message.payload.parts.find(part => part.mimeType === 'text/plain');
            const htmlPart = message.payload.parts.find(part => part.mimeType === 'text/html');
            
            // Prefer plain text over HTML for analysis
            if (textPart?.body?.data) {
              body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            } else if (htmlPart?.body?.data) {
              htmlBody = atob(htmlPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
              // Simple HTML to text conversion (remove tags)
              body = htmlBody.replace(/<[^>]*>/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim();
            }
          }
          
          // Skip empty messages
          if (!body && !htmlBody) {
            console.log(`Skipping message ${message.id} - no content found`);
            continue;
          }
          
          // Prepare email content for OpenAI analysis
          const emailContent = [
            `From: ${from}`,
            `Subject: ${subject}`,
            `Date: ${date}`,
            `\n\nBody:\n${body}`
          ].join('\n');
          
          // Limit content length to avoid token limits
          const MAX_CONTENT_LENGTH = 4000;
          const truncatedContent = emailContent.length > MAX_CONTENT_LENGTH 
            ? emailContent.substring(0, MAX_CONTENT_LENGTH) + '... [truncated]'
            : emailContent;
          
          // Add to batch
          emailBatch.push({
            messageId: message.id,
            content: truncatedContent
          });
          
          // Store message data for later use
          messageMap[message.id] = { body, from, subject, date };
          
        } catch (err) {
          console.error(`Error processing message ${message.id}:`, err);
          // Continue with next message
        }
      }
      
      // Skip if no emails to analyze
      if (emailBatch.length === 0) {
        console.log('No valid emails to analyze');
        return [];
      }
      
      console.log(`Sending batch of ${emailBatch.length} emails to OpenAI for analysis`);
      
      // Get the Gmail account ID (in a real app, you'd get this from user context)
      const gmailAccountId = 'default-account-id'; // Replace with actual account ID in production
      
      // Prepare batch with account ID
      const emailBatchWithAccount = emailBatch.map(item => ({
        ...item,
        gmailAccountId
      }));
      
      // Send batch to OpenAI for analysis
      const batchResults = await openaiApi.batchAnalyzeEmails(emailBatchWithAccount, gmailAccountId);
      console.log(`Received analysis for ${batchResults.length} emails`);
      
      // Process results
      for (const analysis of batchResults) {
        try {
          // Check if this is a subscription result by checking for isSubscription property
          const isSubscription = 'isSubscription' in analysis && analysis.isSubscription;
          
          // Skip if no messageId or not a subscription or low confidence
          if (!analysis.messageId || !isSubscription || analysis.confidence < 40) {
            if (analysis.messageId) {
              console.log(`Skipping message ${analysis.messageId} - not a subscription (confidence: ${analysis.confidence})`);
            }
            continue;
          }
          
          const messageData = messageMap[analysis.messageId];
          if (!messageData) {
            console.error(`Message data not found for ID: ${analysis.messageId}`);
            continue;
          }
          
          // Since we've confirmed this is a subscription result, we can safely cast it
          const subscriptionResult = analysis as any; // Type assertion for simplicity
          
          // Use OpenAI's extracted data or fallback to regex
          const serviceName = subscriptionResult.name || '';
          const amount = subscriptionResult.amount || 0;
          
          // Fallback date extraction if OpenAI didn't provide one
          let billingDate = new Date().toISOString().split('T')[0];
          if (subscriptionResult.nextBillingAt) {
            billingDate = subscriptionResult.nextBillingAt.toISOString().split('T')[0];
          } else {
            // Fallback to regex extraction
            const dateMatches = messageData.body.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g) || [];
            if (dateMatches.length > 0) {
              billingDate = dateMatches[0];
            }
          }
          
          console.log('Candidate:', { 
            messageId: analysis.messageId,
            serviceName, 
            amount, 
            date: billingDate, 
            confidence: analysis.confidence 
          });
          
          candidates.push({
            messageId: analysis.messageId,
            serviceName,
            amount,
            date: billingDate,
            confidence: analysis.confidence
          });
        } catch (err) {
          console.error('Error processing analysis result:', err);
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
