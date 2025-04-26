import { GmailAccount, Expense, InsightSummary, CategoryBreakdown, TimelineData, AccountInsights } from "@/types/gmail";
import { Subscription } from "@/types/subscription";

// Mock data for Gmail accounts
export const MOCK_GMAIL_ACCOUNTS: GmailAccount[] = [
  {
    id: "1",
    email: "user@gmail.com",
    name: "Primary Account",
    connected: true,
    lastSynced: "2025-04-25T10:30:00Z",
    avatarUrl: "https://ui-avatars.com/api/?name=Primary+Account&background=8B5CF6&color=fff"
  },
  {
    id: "2",
    email: "work@gmail.com",
    name: "Work Account",
    connected: true,
    lastSynced: "2025-04-24T15:45:00Z",
    avatarUrl: "https://ui-avatars.com/api/?name=Work+Account&background=3B82F6&color=fff"
  },
  {
    id: "3",
    email: "personal@gmail.com",
    name: "Personal Account",
    connected: false,
    lastSynced: null,
    avatarUrl: "https://ui-avatars.com/api/?name=Personal+Account&background=10B981&color=fff"
  }
];

// Mock data for expenses
export const MOCK_EXPENSES: Expense[] = [
  {
    id: "e1",
    merchant: "Amazon",
    amount: 79.99,
    date: "2025-04-23T14:30:00Z",
    category: "Shopping",
    description: "Books and electronics",
    logoUrl: "https://logo.clearbit.com/amazon.com",
    accountId: "1"
  },
  {
    id: "e2",
    merchant: "Uber",
    amount: 24.50,
    date: "2025-04-24T19:15:00Z",
    category: "Transportation",
    description: "Ride to airport",
    logoUrl: "https://logo.clearbit.com/uber.com",
    accountId: "1"
  },
  {
    id: "e3",
    merchant: "Starbucks",
    amount: 6.75,
    date: "2025-04-25T08:45:00Z",
    category: "Food & Drink",
    description: "Coffee and breakfast",
    logoUrl: "https://logo.clearbit.com/starbucks.com",
    accountId: "1"
  },
  {
    id: "e4",
    merchant: "Whole Foods",
    amount: 89.32,
    date: "2025-04-22T16:20:00Z",
    category: "Groceries",
    description: "Weekly grocery shopping",
    logoUrl: "https://logo.clearbit.com/wholefoods.com",
    accountId: "2"
  },
  {
    id: "e5",
    merchant: "Netflix",
    amount: 15.99,
    date: "2025-04-15T00:00:00Z",
    category: "Entertainment",
    description: "Monthly subscription",
    logoUrl: "https://logo.clearbit.com/netflix.com",
    accountId: "1"
  },
  {
    id: "e6",
    merchant: "Apple",
    amount: 2.99,
    date: "2025-04-20T10:30:00Z",
    category: "Technology",
    description: "iCloud storage",
    logoUrl: "https://logo.clearbit.com/apple.com",
    accountId: "2"
  },
  {
    id: "e7",
    merchant: "Airbnb",
    amount: 245.00,
    date: "2025-04-18T12:00:00Z",
    category: "Travel",
    description: "Weekend getaway",
    logoUrl: "https://logo.clearbit.com/airbnb.com",
    accountId: "1"
  }
];

// Mock data for subscriptions
export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "1",
    serviceName: "Netflix",
    amount: 15.99,
    billingDate: "2025-05-15",
    status: "active",
    category: "Entertainment",
    logoUrl: "https://logo.clearbit.com/netflix.com",
    userId: "1",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    serviceName: "Spotify",
    amount: 9.99,
    billingDate: "2025-05-20",
    status: "active",
    category: "Music",
    logoUrl: "https://logo.clearbit.com/spotify.com",
    userId: "1",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "3",
    serviceName: "Adobe Creative Cloud",
    amount: 52.99,
    billingDate: "2025-05-05",
    status: "active",
    category: "Software",
    logoUrl: "https://logo.clearbit.com/adobe.com",
    userId: "1",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "4",
    serviceName: "Disney+",
    amount: 7.99,
    billingDate: "2025-05-10",
    status: "active",
    category: "Entertainment",
    logoUrl: "https://logo.clearbit.com/disneyplus.com",
    userId: "2",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "5",
    serviceName: "GitHub Pro",
    amount: 9.99,
    billingDate: "2025-05-27",
    status: "active",
    category: "Software",
    logoUrl: "https://logo.clearbit.com/github.com",
    userId: "2",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  }
];

// Chart colors
export const COLORS = [
  "#A78BFA", // Muted purple
  "#93C5FD", // Soft blue
  "#6EE7B7", // Pastel green
  "#FCD34D", // Soft yellow
  "#FDA4AF", // Pastel red
  "#F9A8D4", // Soft pink
  "#A5B4FC", // Pastel indigo
  "#C4B5FD", // Lavender
  "#5EEAD4", // Pastel teal
];

// Generate insight summary
export const generateInsightSummary = (subscriptions: Subscription[], expenses: Expense[], accounts: GmailAccount[]): InsightSummary => {
  return {
    totalSubscriptions: subscriptions.length,
    totalSubscriptionAmount: subscriptions.reduce((total, sub) => total + sub.amount, 0),
    totalExpenses: expenses.length,
    monthlyExpenseAmount: expenses.reduce((total, exp) => total + exp.amount, 0),
    connectedAccounts: accounts.filter(acc => acc.connected).length
  };
};

// Generate category breakdowns
export const generateCategoryBreakdowns = (subscriptions: Subscription[], expenses: Expense[]): { subscriptions: CategoryBreakdown[], expenses: CategoryBreakdown[] } => {
  const subscriptionsByCategory = subscriptions.reduce((acc, sub) => {
    const category = sub.category || 'Other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += sub.amount;
    return acc;
  }, {} as Record<string, number>);

  const expensesByCategory = expenses.reduce((acc, exp) => {
    const category = exp.category || 'Other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += exp.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    subscriptions: Object.entries(subscriptionsByCategory).map(
      ([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      })
    ),
    expenses: Object.entries(expensesByCategory).map(
      ([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      })
    )
  };
};

// Generate timeline data
export const generateTimelineData = (subscriptions: Subscription[], expenses: Expense[]): { expenses: TimelineData[], subscriptions: TimelineData[] } => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  // Generate random but consistent data for demo
  const expensesData = months.map((month, i) => ({
    date: month,
    value: 100 + Math.floor(Math.random() * 200 * (i + 1) / 6)
  }));
  
  const totalSubscriptionAmount = subscriptions.reduce((total, sub) => total + sub.amount, 0);
  
  const subscriptionsData = months.map((month) => ({
    date: month,
    value: totalSubscriptionAmount
  }));
  
  return {
    expenses: expensesData,
    subscriptions: subscriptionsData
  };
};

// Generate account insights
export const generateAccountInsights = (accounts: GmailAccount[], subscriptions: Subscription[], expenses: Expense[]): AccountInsights[] => {
  return accounts.map(account => {
    return {
      email: account.email,
      subscriptionCount: subscriptions.filter(s => s.userId === account.id).length,
      expenseCount: expenses.filter(e => e.accountId === account.id).length
    };
  });
};
