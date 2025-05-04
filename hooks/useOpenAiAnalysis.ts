import { useState, useCallback } from 'react';
import type { SubscriptionAnalysisResult, ExpenseAnalysisResult } from '../app/api/openai/openaiApi';

interface UseOpenAiAnalysisOptions {
	onError?: (error: Error) => void;
}

interface EmailBatchItem {
	messageId: string;
	content: string;
	gmailAccountId?: string;
}

export function useOpenAiAnalysis(options: UseOpenAiAnalysisOptions = {}) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [analysisResults, setAnalysisResults] = useState<(SubscriptionAnalysisResult | ExpenseAnalysisResult)[]>([]);

	// Analyze a single email
	const analyzeEmail = useCallback(
		async (emailContent: string, gmailAccountId: string) => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch('/api/openai/analyze-email', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ emailContent, gmailAccountId }),
				});

				if (!response.ok) {
					throw new Error('Failed to analyze email');
				}

				const result = await response.json();
				setAnalysisResults([result]);
				return result;
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				setError(error);
				options.onError?.(error);
				return null;
			} finally {
				setIsLoading(false);
			}
		},
		[options],
	);

	// Batch analyze multiple emails
	const batchAnalyzeEmails = useCallback(
		async (emails: EmailBatchItem[], gmailAccountId: string) => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch('/api/openai/batch-analyze', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ emails, gmailAccountId }),
				});

				if (!response.ok) {
					throw new Error('Failed to batch analyze emails');
				}

				const results = await response.json();
				setAnalysisResults(results);
				return results;
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				setError(error);
				options.onError?.(error);
				return [];
			} finally {
				setIsLoading(false);
			}
		},
		[options],
	);

	return {
		isLoading,
		error,
		analysisResults,
		analyzeEmail,
		batchAnalyzeEmails,
	};
}
