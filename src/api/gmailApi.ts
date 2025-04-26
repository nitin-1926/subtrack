import apiClient from './index';

// Gmail API constants
const GMAIL_API_BASE_URL = 'https://gmail.googleapis.com/gmail/v1';
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Types for Gmail API responses
export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload?: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<any>;
    body?: { data?: string };
  };
  internalDate?: string;
}

export interface GmailListResponse {
  messages: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

// Gmail API service
const gmailApi = {
  /**
   * Get OAuth URL for Gmail authorization
   */
  getAuthUrl: (): string => {
    // Hardcoded OAuth values
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID || '';
    const redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/email-sync';
    
    console.log('Using OAuth credentials:', { clientId, redirectUri });
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;
    console.log('Generated auth URL:', authUrl);
    return authUrl;
  },

  /**
   * Exchange authorization code for tokens
   */
  exchangeCodeForTokens: async (code: string): Promise<TokenResponse> => {
    console.log('Exchanging code for tokens...');
    
    // Hardcoded OAuth values
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.VITE_GOOGLE_CLIENT_SECRET || '';
    const redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/email-sync';

    console.log('Using OAuth credentials for token exchange:', { clientId, redirectUri });
    
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials are not configured');
    }

    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    // Retry mechanism
    const MAX_RETRIES = 3;
    let retries = 0;
    let lastError: Error | null = null;
    
    while (retries < MAX_RETRIES) {
      try {
        console.log(`Token exchange attempt ${retries + 1}/${MAX_RETRIES}`);
        console.log('Sending token exchange request to:', GOOGLE_TOKEN_URL);
        
        const response = await fetch(GOOGLE_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        if (!response.ok) {
          // Try to get more detailed error information
          const errorText = await response.text();
          console.error(`Attempt ${retries + 1}/${MAX_RETRIES} failed with status:`, response.status, response.statusText);
          console.error('Error details:', errorText);
          
          // Create error to throw if all retries fail
          lastError = new Error(`Failed to exchange code for tokens: ${response.status} ${response.statusText}
Details: ${errorText}`);
          
          // If we have retries left, continue to next attempt
          retries++;
          if (retries < MAX_RETRIES) {
            console.log(`Retrying in 1 second... (${retries}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          } else {
            // No more retries, throw the error
            throw lastError;
          }
        }

        // Success case
        const data = await response.json();
        console.log('Token exchange successful:', { ...data, access_token: '***REDACTED***' });
        return data;
      } catch (error) {
        // If this is a network error and we have retries left, try again
        if (error instanceof TypeError && retries < MAX_RETRIES) {
          console.error(`Network error on attempt ${retries + 1}/${MAX_RETRIES}:`, error);
          retries++;
          console.log(`Retrying in 1 second... (${retries}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        } else if (retries >= MAX_RETRIES) {
          // No more retries, rethrow the error
          console.error(`All ${MAX_RETRIES} attempts failed. Last error:`, error);
          throw lastError || error;
        } else {
          // Other errors, just rethrow
          throw error;
        }
      }
    }
    
    // This should never be reached due to the while loop conditions
    throw lastError || new Error('Failed to exchange code for tokens after maximum retries');
  },

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken: async (refreshToken: string): Promise<{ access_token: string; expires_in: number }> => {
    // Hardcoded OAuth values
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.VITE_GOOGLE_CLIENT_SECRET || '';
    
    console.log('Using hardcoded OAuth credentials for token refresh');

    const params = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get list of Gmail messages
   */
  getMessages: async (accessToken: string, query = '', maxResults = 50, pageToken?: string): Promise<GmailListResponse> => {
    const url = new URL(`${GMAIL_API_BASE_URL}/users/me/messages`);
    
    const params: Record<string, string> = {
      maxResults: maxResults.toString(),
    };
    
    if (query) {
      params.q = query;
    }
    
    if (pageToken) {
      params.pageToken = pageToken;
    }
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Gmail messages: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get a specific Gmail message by ID
   */
  getMessage: async (accessToken: string, messageId: string): Promise<GmailMessage> => {
    const url = `${GMAIL_API_BASE_URL}/users/me/messages/${messageId}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Gmail message: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Search for subscription emails
   */
  searchSubscriptionEmails: async (accessToken: string): Promise<GmailListResponse> => {
    // Search query to find potential subscription emails
    // This query looks for common terms in subscription emails
    const query = 'subject:(subscription OR receipt OR invoice OR payment OR billing OR renew OR confirm) newer_than:6m';
    
    return gmailApi.getMessages(accessToken, query);
  },

  /**
   * Get full message details for multiple message IDs (one at a time)
   */
  getFullMessages: async (accessToken: string, messageIds: string[]): Promise<GmailMessage[]> => {
    console.log(`Fetching ${messageIds.length} full messages one by one`);
    
    const allMessages: GmailMessage[] = [];
    const totalMessages = messageIds.length;
    
    // Process messages one by one with progress logging
    for (let i = 0; i < messageIds.length; i++) {
      const messageId = messageIds[i];
      
      // Log progress every 10 messages or at the beginning/end
      if (i === 0 || i === messageIds.length - 1 || i % 10 === 0) {
        console.log(`Fetching message ${i + 1}/${totalMessages} (${Math.round((i + 1) / totalMessages * 100)}%)`);
      }
      
      try {
        // Get individual message
        const message = await gmailApi.getMessage(accessToken, messageId);
        allMessages.push(message);
      } catch (error) {
        console.error(`Error fetching message ${messageId}:`, error);
        // Continue with other messages even if one fails
      }
    }
    
    console.log(`Successfully fetched ${allMessages.length}/${totalMessages} messages`);
    return allMessages;
  },

  /**
   * Get the last messages from Gmail (limited to avoid overloading)
   */
  getLastMessages: async (accessToken: string, maxResults = 50): Promise<GmailMessage[]> => {
    console.log(`Fetching last ${maxResults} messages from Gmail`);
    
    // First get the message IDs
    const response = await gmailApi.getMessages(accessToken, '', maxResults);
    
    if (!response.messages || response.messages.length === 0) {
      console.log('No messages found');
      return [];
    }
    
    const messageIds = response.messages.map(msg => msg.id);
    console.log(`Found ${messageIds.length} message IDs`);
    
    // Get full message details one by one
    return gmailApi.getFullMessages(accessToken, messageIds);
  },

  /**
   * Parse message content to extract subscription details
   */
  parseMessageForSubscriptionDetails: async (accessToken: string, messageId: string) => {
    const message = await gmailApi.getMessage(accessToken, messageId);
    
    // Extract email headers
    const headers = message.payload?.headers || [];
    const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
    const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
    const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
    
    // Extract email body (simplified - in a real app you'd need more robust parsing)
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
    
    // Simple regex patterns to look for potential subscription info
    // In a real app, you'd use more sophisticated NLP/extraction techniques
    const amountMatches = body.match(/\$(\d+\.\d{2})/g) || [];
    const dateMatches = body.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g) || [];
    
    // Extract potential service name from subject or sender
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
    
    return {
      messageId,
      subject,
      from,
      date,
      potentialServiceName: serviceName,
      potentialAmounts: amountMatches,
      potentialDates: dateMatches,
      snippet: message.snippet,
    };
  },
};

export default gmailApi;
