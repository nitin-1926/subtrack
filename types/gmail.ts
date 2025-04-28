export interface GmailAccount {
	id: string;
	email: string;
	name: string;
	connected: boolean;
	lastSynced: string | null;
	avatarUrl: string;
}

export interface Expense {
	id: string;
	merchant: string;
	amount: number;
	date: string;
	category: string;
	description: string;
	logoUrl: string;
	accountId: string;
}

export interface InsightSummary {
	totalSubscriptions: number;
	totalSubscriptionAmount: number;
	totalExpenses: number;
	monthlyExpenseAmount: number;
	connectedAccounts: number;
}

export interface CategoryBreakdown {
	name: string;
	value: number;
}

export interface TimelineData {
	date: string;
	amount: number;
}

export interface AccountInsights {
	accountId: string;
	accountName: string;
	subscriptionCount: number;
	expenseCount: number;
	totalAmount: number;
}
