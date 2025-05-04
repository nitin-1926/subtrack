import { useState, useCallback, useEffect } from 'react';
import type { GmailMessage } from '../app/api/gmail-accounts/gmailApi';
import type { SubscriptionAnalysisResult } from '../app/api/openai/openaiApi';

interface UseGmailSyncOptions {
	onAuthSuccess?: (tokens: { accessToken: string; refreshToken?: string }) => void;
	onError?: (error: Error) => void;
}

interface SubscriptionCandidate {
	messageId: string;
	serviceName: string;
	amount: number;
	date: string;
	confidence: number;
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
		typeof window !== 'undefined' ? localStorage.getItem('gmail_access_token') : null,
	);
	const [refreshToken, setRefreshToken] = useState<string | null>(
		typeof window !== 'undefined' ? localStorage.getItem('gmail_refresh_token') : null,
	);
	const [tokenExpiry, setTokenExpiry] = useState<number>(
		typeof window !== 'undefined' ? Number(localStorage.getItem('gmail_token_expiry') || 0) : 0,
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
	}, [accessToken, refreshToken, isTokenExpired]);

	// Start OAuth flow
	const startAuthFlow = useCallback(async () => {
		try {
			const response = await fetch('/api/gmail-accounts/auth-url');
			if (!response.ok) {
				throw new Error('Failed to get auth URL');
			}
			const { authUrl } = await response.json();
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
	const handleAuthCallback = useCallback(
		async (code: string) => {
			if (processedCodes.has(code)) {
				console.log('Auth code has already been processed, ignoring duplicate callback');
				return;
			}

			processedCodes.add(code);
			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch('/api/gmail-accounts/exchange-code', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ code }),
				});

				if (!response.ok) {
					throw new Error('Failed to exchange code for tokens');
				}

				const tokens = await response.json();
				const expiryTime = Date.now() + tokens.expires_in * 1000;

				if (typeof window !== 'undefined') {
					localStorage.setItem('gmail_access_token', tokens.access_token);
					localStorage.setItem('gmail_token_expiry', expiryTime.toString());
					if (tokens.refresh_token) {
						localStorage.setItem('gmail_refresh_token', tokens.refresh_token);
					}
				}

				setAccessToken(tokens.access_token);
				setTokenExpiry(expiryTime);
				setRefreshToken(tokens.refresh_token);
				setIsAuthenticated(true);

				options.onAuthSuccess?.({
					accessToken: tokens.access_token,
					refreshToken: tokens.refresh_token,
				});
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				setError(error);
				options.onError?.(error);
				processedCodes.delete(code);
			} finally {
				setIsLoading(false);
			}
		},
		[options, processedCodes],
	);

	// Refresh access token
	const refreshAccessTokenFn = useCallback(async () => {
		if (!refreshToken) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/gmail-accounts/refresh-token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ refreshToken }),
			});

			if (!response.ok) {
				throw new Error('Failed to refresh token');
			}

			const result = await response.json();
			const expiryTime = Date.now() + result.expires_in * 1000;

			if (typeof window !== 'undefined') {
				localStorage.setItem('gmail_access_token', result.access_token);
				localStorage.setItem('gmail_token_expiry', expiryTime.toString());
			}

			setAccessToken(result.access_token);
			setTokenExpiry(expiryTime);
			setIsAuthenticated(true);
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err));
			setError(error);
			options.onError?.(error);

			if (typeof window !== 'undefined') {
				localStorage.removeItem('gmail_access_token');
				localStorage.removeItem('gmail_refresh_token');
				localStorage.removeItem('gmail_token_expiry');
			}

			setAccessToken(null);
			setRefreshToken(null);
			setIsAuthenticated(false);
		} finally {
			setIsLoading(false);
		}
	}, [refreshToken, options]);

	// Scan emails for subscription information
	const scanEmails = useCallback(
		async (fullMessages?: GmailMessage[]) => {
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
				let messages: GmailMessage[] = [];

				if (fullMessages && fullMessages.length > 0) {
					messages = fullMessages;
				} else {
					const response = await fetch('/api/gmail-accounts/subscription-emails', {
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					});

					if (!response.ok) {
						throw new Error('Failed to fetch subscription emails');
					}

					const data = await response.json();
					messages = data.messages || [];
				}

				// Process messages and analyze with OpenAI
				const emailBatch: EmailBatchItem[] = messages.map(message => ({
					messageId: message.id,
					content: message.snippet || '',
				}));

				const analysisResponse = await fetch('/api/openai/batch-analyze', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ emails: emailBatch }),
				});

				if (!analysisResponse.ok) {
					throw new Error('Failed to analyze emails');
				}

				const analysisResults = await analysisResponse.json();
				const candidates: SubscriptionCandidate[] = analysisResults
					.filter((result: SubscriptionAnalysisResult) => result.isSubscription && result.confidence >= 40)
					.map((result: SubscriptionAnalysisResult) => ({
						messageId: result.messageId || '',
						serviceName: result.name,
						amount: result.amount,
						date:
							result.nextBillingAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
						confidence: result.confidence,
					}));

				candidates.sort((a, b) => b.confidence - a.confidence);
				setSubscriptionCandidates(candidates);
				return candidates;
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				setError(error);
				options.onError?.(error);
				return [];
			} finally {
				setIsLoading(false);
			}
		},
		[accessToken, refreshToken, isTokenExpired, refreshAccessTokenFn, options],
	);

	// Logout/disconnect
	const disconnect = useCallback(() => {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('gmail_access_token');
			localStorage.removeItem('gmail_refresh_token');
			localStorage.removeItem('gmail_token_expiry');
		}
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
