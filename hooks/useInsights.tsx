"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GmailAccount,
  Expense,
  InsightSummary,
  CategoryBreakdown,
  TimelineData,
  AccountInsights,
} from "@/types/gmail";
import { Subscription } from "@/types/subscription";
import { toast } from "sonner";

// Mock data based on the original application
const MOCK_GMAIL_ACCOUNTS: GmailAccount[] = [
  {
    id: "1",
    email: "user@gmail.com",
    name: "Primary Account",
    connected: true,
    lastSynced: "2025-04-25T10:30:00Z",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Primary+Account&background=8B5CF6&color=fff",
  },
  {
    id: "2",
    email: "work@gmail.com",
    name: "Work Account",
    connected: true,
    lastSynced: "2025-04-24T15:45:00Z",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Work+Account&background=3B82F6&color=fff",
  },
  {
    id: "3",
    email: "personal@gmail.com",
    name: "Personal Account",
    connected: false,
    lastSynced: null,
    avatarUrl:
      "https://ui-avatars.com/api/?name=Personal+Account&background=10B981&color=fff",
  },
];

const MOCK_EXPENSES: Expense[] = [
  {
    id: "e1",
    merchant: "Amazon",
    amount: 79.99,
    date: "2025-04-23T14:30:00Z",
    category: "Shopping",
    description: "Books and electronics",
    logoUrl: "https://logo.clearbit.com/amazon.com",
    accountId: "1",
  },
  {
    id: "e2",
    merchant: "Uber",
    amount: 24.5,
    date: "2025-04-24T19:15:00Z",
    category: "Transportation",
    description: "Ride to airport",
    logoUrl: "https://logo.clearbit.com/uber.com",
    accountId: "1",
  },
  {
    id: "e3",
    merchant: "Starbucks",
    amount: 6.75,
    date: "2025-04-25T08:45:00Z",
    category: "Food & Drink",
    description: "Coffee and breakfast",
    logoUrl: "https://logo.clearbit.com/starbucks.com",
    accountId: "1",
  },
  {
    id: "e4",
    merchant: "Whole Foods",
    amount: 89.32,
    date: "2025-04-22T16:20:00Z",
    category: "Groceries",
    description: "Weekly grocery shopping",
    logoUrl: "https://logo.clearbit.com/wholefoods.com",
    accountId: "2",
  },
  {
    id: "e5",
    merchant: "Netflix",
    amount: 15.99,
    date: "2025-04-15T00:00:00Z",
    category: "Entertainment",
    description: "Monthly subscription",
    logoUrl: "https://logo.clearbit.com/netflix.com",
    accountId: "1",
  },
];

const MOCK_SUBSCRIPTIONS: Subscription[] = [
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
  },
];

// Helper functions to generate insight data
const generateInsightSummary = (
  subscriptions: Subscription[],
  expenses: Expense[],
  accounts: GmailAccount[]
): InsightSummary => {
  return {
    totalSubscriptions: subscriptions.length,
    totalSubscriptionAmount: subscriptions.reduce(
      (total, sub) => total + sub.amount,
      0
    ),
    totalExpenses: expenses.length,
    monthlyExpenseAmount: expenses.reduce(
      (total, exp) => total + exp.amount,
      0
    ),
    connectedAccounts: accounts.filter((acc) => acc.connected).length,
  };
};

const generateCategoryBreakdowns = (
  subscriptions: Subscription[],
  expenses: Expense[]
): { subscriptions: CategoryBreakdown[]; expenses: CategoryBreakdown[] } => {
  const subscriptionsByCategory = subscriptions.reduce((acc, sub) => {
    const category = sub.category || "Other";
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += sub.amount;
    return acc;
  }, {} as Record<string, number>);

  const expensesByCategory = expenses.reduce((acc, exp) => {
    const category = exp.category || "Other";
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const subscriptionBreakdown = Object.entries(subscriptionsByCategory).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const expenseBreakdown = Object.entries(expensesByCategory).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  return {
    subscriptions: subscriptionBreakdown,
    expenses: expenseBreakdown,
  };
};

const generateTimelineData = (
  subscriptions: Subscription[],
  expenses: Expense[]
): { expenses: TimelineData[]; subscriptions: TimelineData[] } => {
  // For simplicity, we'll create a basic timeline of the last 6 months
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const expenseData: TimelineData[] = [];
  const subscriptionData: TimelineData[] = [];

  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().substring(0, 7); // YYYY-MM format

    expenseData.unshift({
      date: monthStr,
      amount: Math.random() * 500 + 200, // Random amount for demo
    });

    subscriptionData.unshift({
      date: monthStr,
      amount: subscriptions.reduce((total, sub) => total + sub.amount, 0),
    });
  }

  return {
    expenses: expenseData,
    subscriptions: subscriptionData,
  };
};

const generateAccountInsights = (
  accounts: GmailAccount[],
  subscriptions: Subscription[],
  expenses: Expense[]
): AccountInsights[] => {
  return accounts.map((account) => {
    const accountExpenses = expenses.filter(
      (exp) => exp.accountId === account.id
    );
    const accountSubscriptions = subscriptions.filter(
      (sub) => sub.userId === account.id
    );
    const totalAmount = [
      ...accountExpenses,
      ...accountSubscriptions.map((sub) => ({ amount: sub.amount })),
    ].reduce((total, item) => total + item.amount, 0);

    return {
      accountId: account.id,
      accountName: account.name,
      subscriptionCount: accountSubscriptions.length,
      expenseCount: accountExpenses.length,
      totalAmount,
    };
  });
};

// Mock API endpoints
const fetchSubscriptions = async (): Promise<Subscription[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_SUBSCRIPTIONS), 500);
  });
};

const createSubscription = async (
  subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">
): Promise<Subscription> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSubscription = {
        ...subscription,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      resolve(newSubscription);
    }, 500);
  });
};

const updateSubscription = async (
  id: string,
  subscription: Partial<Subscription>
): Promise<Subscription> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const existingSubscription = MOCK_SUBSCRIPTIONS.find(
        (sub) => sub.id === id
      );
      if (!existingSubscription) {
        reject(new Error("Subscription not found"));
        return;
      }
      const updatedSubscription = {
        ...existingSubscription,
        ...subscription,
        updatedAt: new Date().toISOString(),
      };
      resolve(updatedSubscription);
    }, 500);
  });
};

const deleteSubscription = async (id: string): Promise<void> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const subscriptionIndex = MOCK_SUBSCRIPTIONS.findIndex(
        (sub) => sub.id === id
      );
      if (subscriptionIndex === -1) {
        reject(new Error("Subscription not found"));
        return;
      }
      resolve();
    }, 500);
  });
};

const fetchExpenses = async (): Promise<Expense[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_EXPENSES), 500);
  });
};

const createExpense = async (
  expense: Omit<Expense, "id" | "logoUrl">
): Promise<Expense> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newExpense = {
        ...expense,
        id: Math.random().toString(36).substring(2, 9),
        logoUrl: `https://logo.clearbit.com/${expense.merchant
          .toLowerCase()
          .replace(/\s+/g, "")}.com`,
      };
      resolve(newExpense);
    }, 500);
  });
};

const updateExpense = async (
  id: string,
  expense: Partial<Expense>
): Promise<Expense> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const existingExpense = MOCK_EXPENSES.find((exp) => exp.id === id);
      if (!existingExpense) {
        reject(new Error("Expense not found"));
        return;
      }
      const updatedExpense = {
        ...existingExpense,
        ...expense,
      };
      resolve(updatedExpense);
    }, 500);
  });
};

const deleteExpense = async (id: string): Promise<void> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const expenseIndex = MOCK_EXPENSES.findIndex((exp) => exp.id === id);
      if (expenseIndex === -1) {
        reject(new Error("Expense not found"));
        return;
      }
      resolve();
    }, 500);
  });
};

export function useInsights() {
  const [gmailAccounts, setGmailAccounts] = useState<GmailAccount[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate insights based on current data
  const insightSummary = generateInsightSummary(
    subscriptions,
    expenses,
    gmailAccounts
  );
  const categoryBreakdowns = generateCategoryBreakdowns(
    subscriptions,
    expenses
  );
  const timelineData = generateTimelineData(subscriptions, expenses);
  const accountInsights = generateAccountInsights(
    gmailAccounts,
    subscriptions,
    expenses
  );

  // Define getSubscriptions and getExpenses as memoized functions to prevent unnecessary API calls
  const getSubscriptions = useCallback(async () => {
    try {
      const fetchedSubscriptions = await fetchSubscriptions();
      return fetchedSubscriptions;
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      return [];
    }
  }, []);

  const getExpenses = useCallback(async () => {
    try {
      const fetchedExpenses = await fetchExpenses();
      return fetchedExpenses;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return [];
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedSubscriptions, fetchedExpenses] = await Promise.all([
          getSubscriptions(),
          getExpenses(),
        ]);

        setSubscriptions(fetchedSubscriptions);
        setExpenses(fetchedExpenses);
        setGmailAccounts(MOCK_GMAIL_ACCOUNTS);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getSubscriptions, getExpenses]);

  const syncAccount = async (accountId: string) => {
    setIsLoading(true);
    try {
      // Simulate account syncing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setGmailAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.id === accountId
            ? { ...account, lastSynced: new Date().toISOString() }
            : account
        )
      );

      toast.success("Account synced successfully!");
    } catch (error) {
      console.error("Error syncing account:", error);
      toast.error("Failed to sync account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const connectAccount = async (email: string, name: string) => {
    setIsLoading(true);
    try {
      // Simulate account connection
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newAccount: GmailAccount = {
        id: Math.random().toString(36).substring(2, 9),
        email,
        name,
        connected: true,
        lastSynced: new Date().toISOString(),
        avatarUrl: `https://ui-avatars.com/api/?name=${name.replace(
          /\s+/g,
          "+"
        )}&background=8B5CF6&color=fff`,
      };

      setGmailAccounts((prevAccounts) => [...prevAccounts, newAccount]);
      toast.success("Account connected successfully!");
    } catch (error) {
      console.error("Error connecting account:", error);
      toast.error("Failed to connect account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    setIsLoading(true);
    try {
      // Simulate account disconnection
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setGmailAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.id === accountId
            ? { ...account, connected: false, lastSynced: null }
            : account
        )
      );

      toast.success("Account disconnected successfully!");
    } catch (error) {
      console.error("Error disconnecting account:", error);
      toast.error("Failed to disconnect account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addSubscription = async (
    subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">
  ) => {
    setIsLoading(true);
    try {
      const newSubscription = await createSubscription(subscription);
      setSubscriptions((prev) => [...prev, newSubscription]);
      toast.success("Subscription added successfully!");
    } catch (error) {
      console.error("Error adding subscription:", error);
      toast.error("Failed to add subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscriptionData = async (
    id: string,
    subscription: Partial<Subscription>
  ) => {
    setIsLoading(true);
    try {
      const updatedSubscription = await updateSubscription(id, subscription);
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === id ? { ...sub, ...updatedSubscription } : sub
        )
      );
      toast.success("Subscription updated successfully!");
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubscriptionData = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteSubscription(id);
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
      toast.success("Subscription deleted successfully!");
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast.error("Failed to delete subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (expense: Omit<Expense, "id" | "logoUrl">) => {
    setIsLoading(true);
    try {
      const newExpense = await createExpense(expense);
      setExpenses((prev) => [...prev, newExpense]);
      toast.success("Expense added successfully!");
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateExpenseData = async (id: string, expense: Partial<Expense>) => {
    setIsLoading(true);
    try {
      const updatedExpense = await updateExpense(id, expense);
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === id ? { ...exp, ...updatedExpense } : exp))
      );
      toast.success("Expense updated successfully!");
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error("Failed to update expense. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpenseData = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
      toast.success("Expense deleted successfully!");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}
