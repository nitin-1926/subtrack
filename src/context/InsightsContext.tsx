import React, { createContext, useState, useEffect, ReactNode } from "react";
import { 
  GmailAccount, 
  Newsletter, 
  Expense, 
  InsightSummary,
  CategoryBreakdown,
  TimelineData,
  AccountInsights
} from "@/types/gmail";
import { Subscription } from "@/types/subscription";

// Mock data for Gmail accounts
const MOCK_GMAIL_ACCOUNTS: GmailAccount[] = [
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

// Mock data for newsletters
const MOCK_NEWSLETTERS: Newsletter[] = [
  {
    id: "n1",
    sender: "Medium Daily Digest",
    subject: "5 Stories to Read Today",
    receivedAt: "2025-04-26T08:30:00Z",
    category: "Technology",
    read: false,
    starred: true,
    snippet: "Discover the latest in tech innovation and software development trends...",
    logoUrl: "https://logo.clearbit.com/medium.com",
    accountId: "1"
  },
  {
    id: "n2",
    sender: "The New York Times",
    subject: "Breaking News: Latest Updates",
    receivedAt: "2025-04-25T19:15:00Z",
    category: "News",
    read: true,
    starred: false,
    snippet: "The latest developments in politics, economics, and global affairs...",
    logoUrl: "https://logo.clearbit.com/nytimes.com",
    accountId: "1"
  },
  {
    id: "n3",
    sender: "Product Hunt Daily",
    subject: "Today's Top Products",
    receivedAt: "2025-04-26T07:00:00Z",
    category: "Technology",
    read: false,
    starred: false,
    snippet: "Discover the latest products and tools that are trending today...",
    logoUrl: "https://logo.clearbit.com/producthunt.com",
    accountId: "1"
  },
  {
    id: "n4",
    sender: "Harvard Business Review",
    subject: "Leadership Insights",
    receivedAt: "2025-04-24T12:30:00Z",
    category: "Business",
    read: true,
    starred: true,
    snippet: "Strategies for effective leadership in today's dynamic business environment...",
    logoUrl: "https://logo.clearbit.com/hbr.org",
    accountId: "2"
  },
  {
    id: "n5",
    sender: "Smashing Magazine",
    subject: "Web Development Newsletter",
    receivedAt: "2025-04-25T09:45:00Z",
    category: "Technology",
    read: false,
    starred: false,
    snippet: "The latest trends and techniques in web development and design...",
    logoUrl: "https://logo.clearbit.com/smashingmagazine.com",
    accountId: "2"
  },
  {
    id: "n6",
    sender: "Morning Brew",
    subject: "Your Daily Digest",
    receivedAt: "2025-04-26T06:15:00Z",
    category: "Business",
    read: false,
    starred: false,
    snippet: "The latest business news and market updates delivered in a digestible format...",
    logoUrl: "https://logo.clearbit.com/morningbrew.com",
    accountId: "1"
  }
];

// Mock data for expenses
const MOCK_EXPENSES: Expense[] = [
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

// Chart colors
const COLORS = [
  "#8B5CF6", // Brand purple
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#14B8A6", // Teal
];

export interface InsightsContextType {
  gmailAccounts: GmailAccount[];
  newsletters: Newsletter[];
  expenses: Expense[];
  subscriptions: Subscription[];
  insightSummary: InsightSummary;
  categoryBreakdowns: {
    subscriptions: CategoryBreakdown[];
    expenses: CategoryBreakdown[];
    newsletters: CategoryBreakdown[];
  };
  timelineData: {
    expenses: TimelineData[];
    subscriptions: TimelineData[];
  };
  accountInsights: AccountInsights[];
  isLoading: boolean;
  syncAccount: (accountId: string) => Promise<void>;
  connectAccount: (email: string, name: string) => Promise<void>;
  disconnectAccount: (accountId: string) => Promise<void>;
}

const InsightsContext = createContext<InsightsContextType | undefined>(undefined);

export interface InsightsProviderProps {
  children: ReactNode;
  subscriptionsData?: Subscription[];
}

export const InsightsProvider: React.FC<InsightsProviderProps> = ({ 
  children,
  subscriptionsData = [] 
}) => {
  const [gmailAccounts, setGmailAccounts] = useState<GmailAccount[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(subscriptionsData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with delay
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setGmailAccounts(MOCK_GMAIL_ACCOUNTS);
      setNewsletters(MOCK_NEWSLETTERS);
      setExpenses(MOCK_EXPENSES);
      
      // Only set subscriptions if none were provided
      if (subscriptionsData.length === 0) {
        // We would fetch subscriptions here if not provided
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [subscriptionsData]);

  // Calculate insight summary
  const insightSummary: InsightSummary = {
    totalSubscriptions: subscriptions.length,
    totalSubscriptionAmount: subscriptions.reduce((total, sub) => total + sub.amount, 0),
    totalNewsletters: newsletters.length,
    unreadNewsletters: newsletters.filter(n => !n.read).length,
    totalExpenses: expenses.length,
    monthlyExpenseAmount: expenses.reduce((total, exp) => total + exp.amount, 0),
    connectedAccounts: gmailAccounts.filter(acc => acc.connected).length
  };

  // Prepare category breakdowns
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

  const newslettersByCategory = newsletters.reduce((acc, news) => {
    const category = news.category || 'Other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryBreakdowns = {
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
    ),
    newsletters: Object.entries(newslettersByCategory).map(
      ([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      })
    )
  };

  // Generate timeline data (last 6 months)
  const generateTimelineData = (): { expenses: TimelineData[], subscriptions: TimelineData[] } => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    // Generate random but consistent data for demo
    const expensesData = months.map((month, i) => ({
      date: month,
      value: 100 + Math.floor(Math.random() * 200 * (i + 1) / 6)
    }));
    
    const subscriptionsData = months.map((month) => ({
      date: month,
      value: insightSummary.totalSubscriptionAmount
    }));
    
    return {
      expenses: expensesData,
      subscriptions: subscriptionsData
    };
  };

  const timelineData = generateTimelineData();

  // Generate account-specific insights
  const accountInsights: AccountInsights[] = gmailAccounts.map(account => {
    return {
      email: account.email,
      subscriptionCount: subscriptions.filter(s => s.userId === account.id).length,
      newsletterCount: newsletters.filter(n => n.accountId === account.id).length,
      expenseCount: expenses.filter(e => e.accountId === account.id).length
    };
  });

  // Function to simulate syncing an account
  const syncAccount = async (accountId: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Update last synced time for the account
    setGmailAccounts(prev => 
      prev.map(acc => 
        acc.id === accountId 
          ? { ...acc, lastSynced: new Date().toISOString() } 
          : acc
      )
    );
    
    setIsLoading(false);
  };

  // Function to simulate connecting a new account
  const connectAccount = async (email: string, name: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const newAccount: GmailAccount = {
      id: `acc-${Date.now()}`,
      email,
      name,
      connected: true,
      lastSynced: new Date().toISOString(),
      avatarUrl: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=8B5CF6&color=fff`
    };
    
    setGmailAccounts(prev => [...prev, newAccount]);
    setIsLoading(false);
  };

  // Function to simulate disconnecting an account
  const disconnectAccount = async (accountId: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setGmailAccounts(prev => 
      prev.map(acc => 
        acc.id === accountId 
          ? { ...acc, connected: false, lastSynced: null } 
          : acc
      )
    );
    
    setIsLoading(false);
  };

  return (
    <InsightsContext.Provider
      value={{
        gmailAccounts,
        newsletters,
        expenses,
        subscriptions,
        insightSummary,
        categoryBreakdowns,
        timelineData,
        accountInsights,
        isLoading,
        syncAccount,
        connectAccount,
        disconnectAccount
      }}
    >
      {children}
    </InsightsContext.Provider>
  );
};

export default InsightsContext;
