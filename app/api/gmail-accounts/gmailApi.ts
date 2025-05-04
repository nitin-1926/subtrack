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
		parts?: Array<{
			partId: string;
			mimeType: string;
			filename?: string;
			headers?: Array<{ name: string; value: string }>;
			body?: { data?: string };
			parts?: Array<{
				partId: string;
				mimeType: string;
				filename?: string;
				headers?: Array<{ name: string; value: string }>;
				body?: { data?: string };
			}>;
		}>;
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
		const clientId = process.env.GOOGLE_CLIENT_ID;
		const redirectUri = process.env.GOOGLE_REDIRECT_URI;

		if (!clientId || !redirectUri) {
			throw new Error('Google OAuth credentials are not configured');
		}

		const params = new URLSearchParams({
			client_id: clientId,
			redirect_uri: redirectUri,
			response_type: 'code',
			scope: 'https://www.googleapis.com/auth/gmail.readonly',
			access_type: 'offline',
			prompt: 'consent',
		});

		return `${GOOGLE_AUTH_URL}?${params.toString()}`;
	},

	/**
	 * Exchange authorization code for tokens
	 */
	exchangeCodeForTokens: async (code: string): Promise<TokenResponse> => {
		const clientId = process.env.GOOGLE_CLIENT_ID;
		const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
		const redirectUri = process.env.GOOGLE_REDIRECT_URI;

		if (!clientId || !clientSecret || !redirectUri) {
			throw new Error('Google OAuth credentials are not configured');
		}

		const params = new URLSearchParams({
			code,
			client_id: clientId,
			client_secret: clientSecret,
			redirect_uri: redirectUri,
			grant_type: 'authorization_code',
		});

		const MAX_RETRIES = 3;
		let retries = 0;
		let lastError: Error | null = null;

		while (retries < MAX_RETRIES) {
			try {
				const response = await fetch(GOOGLE_TOKEN_URL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: params.toString(),
				});

				if (!response.ok) {
					const errorText = await response.text();
					lastError = new Error(`Failed to exchange code for tokens: ${response.status} ${response.statusText}
Details: ${errorText}`);

					retries++;
					if (retries < MAX_RETRIES) {
						await new Promise(resolve => setTimeout(resolve, 1000));
						continue;
					} else {
						throw lastError;
					}
				}

				return response.json();
			} catch (error) {
				if (error instanceof TypeError && retries < MAX_RETRIES) {
					retries++;
					await new Promise(resolve => setTimeout(resolve, 1000));
				} else if (retries >= MAX_RETRIES) {
					throw lastError || error;
				} else {
					throw error;
				}
			}
		}

		throw lastError || new Error('Failed to exchange code for tokens after maximum retries');
	},

	/**
	 * Refresh access token using refresh token
	 */
	refreshAccessToken: async (refreshToken: string): Promise<{ access_token: string; expires_in: number }> => {
		const clientId = process.env.GOOGLE_CLIENT_ID;
		const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

		if (!clientId || !clientSecret) {
			throw new Error('Google OAuth credentials are not configured');
		}

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
	getMessages: async (
		accessToken: string,
		query = '',
		maxResults = 50,
		pageToken?: string,
	): Promise<GmailListResponse> => {
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
		const query =
			'subject:(subscription OR receipt OR invoice OR payment OR billing OR renew OR confirm) newer_than:6m';
		return gmailApi.getMessages(accessToken, query);
	},

	/**
	 * Get full message details for multiple message IDs
	 */
	getFullMessages: async (accessToken: string, messageIds: string[]): Promise<GmailMessage[]> => {
		const allMessages: GmailMessage[] = [];

		for (let i = 0; i < messageIds.length; i++) {
			const messageId = messageIds[i];

			try {
				const message = await gmailApi.getMessage(accessToken, messageId);
				allMessages.push(message);
			} catch (error) {
				console.error(`Error fetching message ${messageId}:`, error);
			}
		}

		return allMessages;
	},

	/**
	 * Get the last messages from Gmail
	 */
	getLastMessages: async (accessToken: string, maxResults = 50): Promise<GmailMessage[]> => {
		const response = await gmailApi.getMessages(accessToken, '', maxResults);

		if (!response.messages || response.messages.length === 0) {
			return [];
		}

		const messageIds = response.messages.map(msg => msg.id);
		return gmailApi.getFullMessages(accessToken, messageIds);
	},

	/**
	 * Parse message content to extract subscription details
	 */
	parseMessageForSubscriptionDetails: async (accessToken: string, messageId: string) => {
		const message = await gmailApi.getMessage(accessToken, messageId);

		const headers = message.payload?.headers || [];
		const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
		const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
		const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';

		let body = '';
		if (message.payload?.body?.data) {
			body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
		} else if (message.payload?.parts) {
			const textPart = message.payload.parts.find(
				part => part.mimeType === 'text/plain' || part.mimeType === 'text/html',
			);
			if (textPart?.body?.data) {
				body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
			}
		}
		const amountMatches = body.match(/\$(\d+\.\d{2})/g) || [];
		const dateMatches = body.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/g) || [];

		let serviceName = '';
		if (from) {
			const fromMatch = from.match(/[^@<>]+@([^@.]+)\./i);
			if (fromMatch && fromMatch[1]) {
				serviceName = fromMatch[1].charAt(0).toUpperCase() + fromMatch[1].slice(1);
			}
		}

		if (!serviceName && subject) {
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
