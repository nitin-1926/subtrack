export interface GmailAccount {
  id: string;
  email: string;
  name: string;
  connected: boolean;
  lastSynced: string | null;
  avatarUrl?: string;
}

export interface Newsletter {
  id: string;
  sender: string;
  subject: string;
  receivedAt: string;
  category: string;
  read: boolean;
  starred: boolean;
  snippet: string;
  logoUrl?: string;
  accountId: string;
}

export interface Expense {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
  logoUrl?: string;
  accountId: string;
}

export interface InsightSummary {
  totalSubscriptions: number;
  totalSubscriptionAmount: number;
  totalNewsletters: number;
  unreadNewsletters: number;
  totalExpenses: number;
  monthlyExpenseAmount: number;
  connectedAccounts: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface TimelineData {
  date: string;
  value: number;
}

export interface AccountInsights {
  email: string;
  subscriptionCount: number;
  newsletterCount: number;
  expenseCount: number;
}
