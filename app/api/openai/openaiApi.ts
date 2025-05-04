import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Analysis result interfaces aligned with Prisma models
export interface ExpenseAnalysisResult {
	id?: string;
	gmailAccountId: string;
	amount: number;
	currency: string;
	merchant: string;
	category?: string;
	date: Date;
	description?: string;
	receiptId?: string;
	confidence: number;
	messageId?: string;
	isExpense: boolean;
}

export interface SubscriptionAnalysisResult {
	id?: string;
	gmailAccountId: string;
	name: string;
	amount: number;
	currency: string;
	frequency: string;
	category?: string;
	lastBilledAt?: Date;
	nextBillingAt?: Date;
	status: string;
	confidence: number;
	messageId?: string;
	isSubscription: boolean;
}

interface EmailBatchItem {
	messageId: string;
	content: string;
	gmailAccountId?: string;
}

interface OpenAiResponseItem {
	messageId: string;
	confidence: number;
	type: string;
	name?: string;
	amount?: number;
	currency?: string;
	frequency?: string;
	category?: string;
	lastBilledAt?: string;
	nextBillingAt?: string;
	status?: string;
	merchant?: string;
	date?: string;
	description?: string;
	receiptId?: string;
}

const openaiApi = {
	/**
	 * Analyze a single email content to detect subscription or expense information
	 */
	analyzeEmail: async (
		emailContent: string,
		gmailAccountId: string,
	): Promise<SubscriptionAnalysisResult | ExpenseAnalysisResult> => {
		try {
			const response = await openai.chat.completions.create({
				model: 'gpt-4.1-mini',
				messages: [
					{
						role: 'system',
						content: `You are an AI assistant that analyzes email content to identify subscription or one-time expense information.
            Extract the following details if present:
            
            For subscriptions:
            - Determine if this is a subscription-related email (recurring payment, membership, etc.)
            - Service/company name
            - Subscription amount
            - Currency (default to USD if not specified)
            - Billing frequency (MONTHLY, YEARLY, WEEKLY, etc.)
            - Last billed date (if mentioned)
            - Next billing date (if mentioned)
            - Status (ACTIVE, CANCELLED, etc.)
            - Category (if possible)
            
            For one-time expenses:
            - Determine if this is a one-time expense/receipt
            - Merchant name
            - Amount
            - Currency (default to USD if not specified)
            - Date of purchase
            - Description/purpose
            - Category (if possible)
            
            Provide a confidence score (0-100) for your analysis.
            
            Return ONLY a JSON object with the appropriate fields based on whether it's a subscription or expense. If you're not confident, return a low confidence score.`,
					},
					{
						role: 'user',
						content: emailContent,
					},
				],
				temperature: 0.3,
				max_tokens: 500,
				response_format: { type: 'json_object' },
			});

			const result = JSON.parse(response.choices[0].message.content || '{}');

			const isSubscription = result.isSubscription || false;
			const isExpense = result.isExpense || (!isSubscription && result.merchant);

			if (isSubscription) {
				return {
					gmailAccountId,
					name: result.serviceName || result.name || '',
					amount: result.amount ? parseFloat(String(result.amount)) : 0,
					currency: result.currency || 'USD',
					frequency: result.billingFrequency || result.frequency || 'MONTHLY',
					category: result.category,
					lastBilledAt: result.lastBilledAt ? new Date(result.lastBilledAt) : undefined,
					nextBillingAt:
						result.nextBillingDate || result.nextBillingAt
							? new Date(result.nextBillingDate || result.nextBillingAt)
							: undefined,
					status: result.status || 'ACTIVE',
					isSubscription: true,
					confidence: result.confidence || 0,
					messageId: result.messageId,
				};
			} else if (isExpense) {
				return {
					gmailAccountId,
					merchant: result.merchant || '',
					amount: result.amount ? parseFloat(String(result.amount)) : 0,
					currency: result.currency || 'USD',
					date: result.date ? new Date(result.date) : new Date(),
					category: result.category,
					description: result.description,
					receiptId: result.receiptId,
					isExpense: true,
					confidence: result.confidence || 0,
					messageId: result.messageId,
				};
			}

			return {
				gmailAccountId,
				isSubscription: false,
				name: '',
				amount: 0,
				currency: 'USD',
				frequency: 'MONTHLY',
				status: 'UNKNOWN',
				confidence: 0,
				messageId: result.messageId,
			};
		} catch (error) {
			console.error('Error analyzing email with OpenAI:', error);
			return {
				gmailAccountId,
				isSubscription: false,
				name: '',
				amount: 0,
				currency: 'USD',
				frequency: 'MONTHLY',
				status: 'UNKNOWN',
				confidence: 0,
			};
		}
	},

	/**
	 * Batch analyze multiple emails for subscription and expense information
	 */
	batchAnalyzeEmails: async (
		emails: EmailBatchItem[],
		gmailAccountId: string,
	): Promise<(SubscriptionAnalysisResult | ExpenseAnalysisResult)[]> => {
		try {
			console.log(`Batch analyzing ${emails.length} emails with OpenAI`);

			const response = await openai.chat.completions.create({
				model: 'gpt-4.1-mini',
				messages: [
					{
						role: 'system',
						content: `You are an AI assistant that analyzes email content to identify subscription and expense information.
            I will provide you with multiple emails in JSON format. For each email, analyze and determine if it's a subscription or a one-time expense.
            
            For each email, return an object in a JSON array with the following structure:
            
            Common fields for all items:
            - messageId: the ID of the email
            - confidence: a score from 0-100 indicating your confidence
            - type: either "SUBSCRIPTION" or "EXPENSE"
            
            For subscriptions (when type is "SUBSCRIPTION"):
            - name: the name of the service/company
            - amount: the subscription amount as a number
            - currency: the currency code (default to "USD" if not specified)
            - frequency: how often billing occurs ("MONTHLY", "YEARLY", "WEEKLY", etc.)
            - category: optional category of the subscription
            - lastBilledAt: date of the last billing if mentioned (ISO format)
            - nextBillingAt: date of the next billing if mentioned (ISO format)
            - status: status of the subscription ("ACTIVE", "CANCELLED", etc.)
            
            For expenses (when type is "EXPENSE"):
            - merchant: the name of the merchant/company
            - amount: the expense amount as a number
            - currency: the currency code (default to "USD" if not specified)
            - date: date of the expense (ISO format)
            - category: optional category of the expense
            - description: optional description of what was purchased
            
            If you're not confident about an email, set a low confidence score and choose the most likely type.
            Return ONLY a JSON array of objects, each representing the analysis of one email.`,
					},
					{
						role: 'user',
						content: JSON.stringify(emails),
					},
				],
				temperature: 0.3,
				max_tokens: 4000,
				response_format: { type: 'json_object' },
			});

			let result = JSON.parse(response.choices[0].message.content || '[]');
			let analysisResults: (SubscriptionAnalysisResult | ExpenseAnalysisResult)[] = [];
			if (result && !Array.isArray(result)) {
				result = [result];
			}

			if (Array.isArray(result)) {
				analysisResults = processAnalysisResults(result, gmailAccountId);
			} else if (result.results && Array.isArray(result.results)) {
				analysisResults = processAnalysisResults(result.results, gmailAccountId);
			}

			if (analysisResults.length === 0) {
				console.error('Unexpected response format from OpenAI:', result);
			}

			return analysisResults;
		} catch (error) {
			console.error('Error batch analyzing emails with OpenAI:', error);
			return [];
		}
	},
};

// Helper function to process analysis results
function processAnalysisResults(
	items: OpenAiResponseItem[],
	gmailAccountId: string,
): (SubscriptionAnalysisResult | ExpenseAnalysisResult)[] {
	return items.map(item => {
		const type = item.type?.toUpperCase() || '';

		if (type === 'SUBSCRIPTION') {
			return {
				gmailAccountId,
				name: item.name || '',
				amount: item.amount ? parseFloat(String(item.amount)) : 0,
				currency: item.currency || 'USD',
				frequency: item.frequency || 'MONTHLY',
				category: item.category,
				lastBilledAt: item.lastBilledAt ? new Date(item.lastBilledAt) : undefined,
				nextBillingAt: item.nextBillingAt ? new Date(item.nextBillingAt) : undefined,
				status: item.status || 'ACTIVE',
				isSubscription: true,
				confidence: item.confidence || 0,
				messageId: item.messageId,
			} as SubscriptionAnalysisResult;
		} else {
			return {
				gmailAccountId,
				merchant: item.merchant || '',
				amount: item.amount ? parseFloat(String(item.amount)) : 0,
				currency: item.currency || 'USD',
				date: item.date ? new Date(item.date) : new Date(),
				category: item.category,
				description: item.description,
				receiptId: item.receiptId,
				isExpense: true,
				confidence: item.confidence || 0,
				messageId: item.messageId,
			} as ExpenseAnalysisResult;
		}
	});
}

export default openaiApi;
