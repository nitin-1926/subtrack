import React, { createContext, useState, useEffect, useCallback, ReactNode } from "react";
import { 
  GmailAccount, 
  Expense, 
  InsightSummary,
  CategoryBreakdown,
  TimelineData,
  AccountInsights
} from "@/types/gmail";
import { Subscription } from "@/types/subscription";
import { 
  MOCK_GMAIL_ACCOUNTS, 
  MOCK_EXPENSES, 
  MOCK_SUBSCRIPTIONS,
  COLORS,
  generateInsightSummary,
  generateCategoryBreakdowns,
  generateTimelineData,
  generateAccountInsights
} from "@/data/mockData";
import { getSubscriptions as fetchSubscriptions, createSubscription, updateSubscription, deleteSubscription } from "@/api/subscriptions";
import { getExpenses as fetchExpenses, createExpense, updateExpense, deleteExpense } from "@/api/expenses";

// Mock data for Gmail accounts
// const MOCK_GMAIL_ACCOUNTS: GmailAccount[] = [
//   {
//     id: "1",
//     email: "user@gmail.com",
//     name: "Primary Account",
//     connected: true,
//     lastSynced: "2025-04-25T10:30:00Z",
//     avatarUrl: "https://ui-avatars.com/api/?name=Primary+Account&background=8B5CF6&color=fff"
//   },
//   {
//     id: "2",
//     email: "work@gmail.com",
//     name: "Work Account",
//     connected: true,
//     lastSynced: "2025-04-24T15:45:00Z",
//     avatarUrl: "https://ui-avatars.com/api/?name=Work+Account&background=3B82F6&color=fff"
//   },
//   {
//     id: "3",
//     email: "personal@gmail.com",
//     name: "Personal Account",
//     connected: false,
//     lastSynced: null,
//     avatarUrl: "https://ui-avatars.com/api/?name=Personal+Account&background=10B981&color=fff"
//   }
// ];

// Mock data for expenses
// const MOCK_EXPENSES: Expense[] = [
//   {
//     id: "e1",
//     merchant: "Amazon",
//     amount: 79.99,
//     date: "2025-04-23T14:30:00Z",
//     category: "Shopping",
//     description: "Books and electronics",
//     logoUrl: "https://logo.clearbit.com/amazon.com",
//     accountId: "1"
//   },
//   {
//     id: "e2",
//     merchant: "Uber",
//     amount: 24.50,
//     date: "2025-04-24T19:15:00Z",
//     category: "Transportation",
//     description: "Ride to airport",
//     logoUrl: "https://logo.clearbit.com/uber.com",
//     accountId: "1"
//   },
//   {
//     id: "e3",
//     merchant: "Starbucks",
//     amount: 6.75,
//     date: "2025-04-25T08:45:00Z",
//     category: "Food & Drink",
//     description: "Coffee and breakfast",
//     logoUrl: "https://logo.clearbit.com/starbucks.com",
//     accountId: "1"
//   },
//   {
//     id: "e4",
//     merchant: "Whole Foods",
//     amount: 89.32,
//     date: "2025-04-22T16:20:00Z",
//     category: "Groceries",
//     description: "Weekly grocery shopping",
//     logoUrl: "https://logo.clearbit.com/wholefoods.com",
//     accountId: "2"
//   },
//   {
//     id: "e5",
//     merchant: "Netflix",
//     amount: 15.99,
//     date: "2025-04-15T00:00:00Z",
//     category: "Entertainment",
//     description: "Monthly subscription",
//     logoUrl: "https://logo.clearbit.com/netflix.com",
//     accountId: "1"
//   },
//   {
//     id: "e6",
//     merchant: "Apple",
//     amount: 2.99,
//     date: "2025-04-20T10:30:00Z",
//     category: "Technology",
//     description: "iCloud storage",
//     logoUrl: "https://logo.clearbit.com/apple.com",
//     accountId: "2"
//   },
//   {
//     id: "e7",
//     merchant: "Airbnb",
//     amount: 245.00,
//     date: "2025-04-18T12:00:00Z",
//     category: "Travel",
//     description: "Weekend getaway",
//     logoUrl: "https://logo.clearbit.com/airbnb.com",
//     accountId: "1"
//   }
// ];

// Mock data for subscriptions
// const MOCK_SUBSCRIPTIONS: Subscription[] = [
//   {
//     id: "1",
//     serviceName: "Netflix",
//     amount: 15.99,
//     billingDate: "2025-05-15",
//     status: "active",
//     category: "Entertainment",
//     logoUrl: "https://logo.clearbit.com/netflix.com",
//     userId: "1",
//     createdAt: "2025-01-01T00:00:00Z",
//     updatedAt: "2025-01-01T00:00:00Z",
//   },
//   {
//     id: "2",
//     serviceName: "Spotify",
//     amount: 9.99,
//     billingDate: "2025-05-20",
//     status: "active",
//     category: "Music",
//     logoUrl: "https://logo.clearbit.com/spotify.com",
//     userId: "1",
//     createdAt: "2025-01-01T00:00:00Z",
//     updatedAt: "2025-01-01T00:00:00Z",
//   },
//   {
//     id: "3",
//     serviceName: "Adobe Creative Cloud",
//     amount: 52.99,
//     billingDate: "2025-05-05",
//     status: "active",
//     category: "Software",
//     logoUrl: "https://logo.clearbit.com/adobe.com",
//     userId: "1",
//     createdAt: "2025-01-01T00:00:00Z",
//     updatedAt: "2025-01-01T00:00:00Z",
//   },
//   {
//     id: "4",
//     serviceName: "Disney+",
//     amount: 7.99,
//     billingDate: "2025-05-10",
//     status: "active",
//     category: "Entertainment",
//     logoUrl: "https://logo.clearbit.com/disneyplus.com",
//     userId: "2",
//     createdAt: "2025-01-01T00:00:00Z",
//     updatedAt: "2025-01-01T00:00:00Z",
//   },
//   {
//     id: "5",
//     serviceName: "GitHub Pro",
//     amount: 9.99,
//     billingDate: "2025-05-27",
//     status: "active",
//     category: "Software",
//     logoUrl: "https://logo.clearbit.com/github.com",
//     userId: "2",
//     createdAt: "2025-01-01T00:00:00Z",
//     updatedAt: "2025-01-01T00:00:00Z",
//   }
// ];

// Chart colors
// const COLORS = [
//   "#8B5CF6", // Brand purple
//   "#3B82F6", // Blue
//   "#10B981", // Green
//   "#F59E0B", // Yellow
//   "#EF4444", // Red
//   "#EC4899", // Pink
//   "#6366F1", // Indigo
//   "#8B5CF6", // Purple
//   "#14B8A6", // Teal
// ];

export interface InsightsContextType {
  gmailAccounts: GmailAccount[];
  expenses: Expense[];
  subscriptions: Subscription[];
  insightSummary: InsightSummary;
  categoryBreakdowns: {
    subscriptions: CategoryBreakdown[];
    expenses: CategoryBreakdown[];
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
  addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'logoUrl'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(subscriptionsData);
  const [isLoading, setIsLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);

  // Define getSubscriptions and getExpenses as memoized functions to prevent unnecessary API calls
  const getSubscriptions = useCallback(async () => {
    try {
      const fetchedSubscriptions = await fetchSubscriptions();
      return fetchedSubscriptions;
    } catch (error) {
      console.error('Error in getSubscriptions:', error);
      return MOCK_SUBSCRIPTIONS;
    }
  }, []);

  const getExpenses = useCallback(async () => {
    try {
      const fetchedExpenses = await fetchExpenses();
      return fetchedExpenses;
    } catch (error) {
      console.error('Error in getExpenses:', error);
      return MOCK_EXPENSES;
    }
  }, []);

  // Fetch data only once on component mount
  useEffect(() => {
    // Skip if data has already been fetched or if we have subscription data provided
    if (dataFetched || subscriptionsData.length > 0) {
      if (subscriptionsData.length > 0) {
        setSubscriptions(subscriptionsData);
      }
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch data in parallel
        const [fetchedSubscriptions, fetchedExpenses] = await Promise.all([
          getSubscriptions(),
          getExpenses()
        ]);
        
        setSubscriptions(fetchedSubscriptions);
        setExpenses(fetchedExpenses);
        setGmailAccounts(MOCK_GMAIL_ACCOUNTS);
      } catch (error) {
        console.error('Error fetching data:', error);
        
        // Fall back to mock data
        setSubscriptions(MOCK_SUBSCRIPTIONS);
        setExpenses(MOCK_EXPENSES);
        setGmailAccounts(MOCK_GMAIL_ACCOUNTS);
      } finally {
        setIsLoading(false);
        setDataFetched(true);
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      // This empty cleanup function ensures we don't update state after unmount
    };
  }, [dataFetched, getExpenses, getSubscriptions, subscriptionsData]);

  // Calculate insight summary
  const insightSummary: InsightSummary = generateInsightSummary(subscriptions, expenses, gmailAccounts);

  // Prepare category breakdowns
  const categoryBreakdowns = generateCategoryBreakdowns(subscriptions, expenses);

  // Generate timeline data (last 6 months)
  const timelineData = generateTimelineData(subscriptions, expenses);

  // Generate account-specific insights
  const accountInsights: AccountInsights[] = generateAccountInsights(gmailAccounts, subscriptions, expenses);

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
    
    // Update account status
    setGmailAccounts(prev => 
      prev.map(acc => 
        acc.id === accountId 
          ? { ...acc, connected: false } 
          : acc
      )
    );
    
    setIsLoading(false);
  };

  // Function to add a new subscription
  const addSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    
    try {
      const newSubscription = await createSubscription(subscription);
      
      if (newSubscription) {
        setSubscriptions(prev => [...prev, newSubscription]);
      }
    } catch (error) {
      console.error('Error adding subscription:', error);
      
      // Fallback to local handling if API fails
      const newSubscription: Subscription = {
        id: `sub-${Date.now()}`,
        ...subscription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setSubscriptions(prev => [...prev, newSubscription]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update a subscription
  const updateSubscriptionData = async (id: string, subscription: Partial<Subscription>) => {
    setIsLoading(true);
    
    try {
      const updatedSubscription = await updateSubscription(id, subscription);
      
      if (updatedSubscription) {
        setSubscriptions(prev => 
          prev.map(sub => sub.id === id ? updatedSubscription : sub)
        );
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      
      // Fallback to local handling if API fails
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id 
            ? { ...sub, ...subscription, updatedAt: new Date().toISOString() } 
            : sub
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a subscription
  const deleteSubscriptionData = async (id: string) => {
    setIsLoading(true);
    
    try {
      const success = await deleteSubscription(id);
      
      if (success) {
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      
      // Fallback to local handling if API fails
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a new expense
  const addExpense = async (expense: Omit<Expense, 'id' | 'logoUrl'>) => {
    setIsLoading(true);
    
    try {
      const newExpense = await createExpense(expense);
      
      if (newExpense) {
        setExpenses(prev => [...prev, newExpense]);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      
      // Fallback to local handling if API fails
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        ...expense,
        logoUrl: `https://logo.clearbit.com/${expense.merchant.toLowerCase().replace(/\s+/g, '')}.com`,
      };
      
      setExpenses(prev => [...prev, newExpense]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update an expense
  const updateExpenseData = async (id: string, expense: Partial<Expense>) => {
    setIsLoading(true);
    
    try {
      const updatedExpense = await updateExpense(id, expense);
      
      if (updatedExpense) {
        setExpenses(prev => 
          prev.map(exp => exp.id === id ? updatedExpense : exp)
        );
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      
      // Fallback to local handling if API fails
      setExpenses(prev => 
        prev.map(exp => 
          exp.id === id 
            ? { ...exp, ...expense } 
            : exp
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete an expense
  const deleteExpenseData = async (id: string) => {
    setIsLoading(true);
    
    try {
      const success = await deleteExpense(id);
      
      if (success) {
        setExpenses(prev => prev.filter(exp => exp.id !== id));
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      
      // Fallback to local handling if API fails
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InsightsContext.Provider
      value={{
        gmailAccounts,
        expenses,
        subscriptions,
        insightSummary,
        categoryBreakdowns,
        timelineData,
        accountInsights,
        isLoading,
        syncAccount,
        connectAccount,
        disconnectAccount,
        addSubscription,
        updateSubscription: updateSubscriptionData,
        deleteSubscription: deleteSubscriptionData,
        addExpense,
        updateExpense: updateExpenseData,
        deleteExpense: deleteExpenseData,
      }}
    >
      {children}
    </InsightsContext.Provider>
  );
};

export default InsightsContext;
