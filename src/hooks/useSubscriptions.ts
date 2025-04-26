
import { useState, useEffect } from "react";
import { Subscription, ChartData } from "@/types/subscription";

// Mock data for the frontend prototype
const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "1",
    serviceName: "Netflix",
    amount: 15.99,
    billingDate: "2023-12-15",
    status: "active",
    category: "Entertainment",
    logoUrl: "https://logo.clearbit.com/netflix.com",
    userId: "user1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    serviceName: "Spotify",
    amount: 9.99,
    billingDate: "2023-12-20",
    status: "active",
    category: "Music",
    logoUrl: "https://logo.clearbit.com/spotify.com",
    userId: "user1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "3",
    serviceName: "Adobe Creative Cloud",
    amount: 52.99,
    billingDate: "2023-12-05",
    status: "active",
    category: "Software",
    logoUrl: "https://logo.clearbit.com/adobe.com",
    userId: "user1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "4",
    serviceName: "Disney+",
    amount: 7.99,
    billingDate: "2023-12-10",
    status: "active",
    category: "Entertainment",
    logoUrl: "https://logo.clearbit.com/disneyplus.com",
    userId: "user1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "5",
    serviceName: "GitHub Pro",
    amount: 9.99,
    billingDate: "2023-12-27",
    status: "active",
    category: "Software",
    logoUrl: "https://logo.clearbit.com/github.com",
    userId: "user1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "6",
    serviceName: "New York Times",
    amount: 12.99,
    billingDate: "2024-01-03",
    status: "active",
    category: "News",
    logoUrl: "https://logo.clearbit.com/nytimes.com",
    userId: "user1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "7",
    serviceName: "Google Drive",
    amount: 11.99,
    billingDate: "2023-12-18",
    status: "active",
    category: "Cloud Storage",
    logoUrl: "https://logo.clearbit.com/google.com",
    userId: "user1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "8",
    serviceName: "HBO Max",
    amount: 14.99,
    billingDate: "2023-12-22",
    status: "active",
    category: "Entertainment",
    logoUrl: "https://logo.clearbit.com/hbomax.com",
    userId: "user1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "9",
    serviceName: "Microsoft 365",
    amount: 9.99,
    billingDate: "2023-12-12",
    status: "active",
    category: "Software",
    logoUrl: "https://logo.clearbit.com/microsoft.com",
    userId: "user1",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

// Chart colors
const COLORS = [
  "#8B5CF6", // Brand purple
  "#A78BFA",
  "#C4B5FD",
  "#DDD6FE",
  "#F3F4F6",
  "#E5E7EB",
  "#D1D5DB",
  "#9CA3AF",
  "#6B7280",
];

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with delay
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubscriptions(MOCK_SUBSCRIPTIONS);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Calculate total monthly cost
  const totalMonthly = subscriptions.reduce((total, sub) => total + sub.amount, 0);

  // Count upcoming renewals (within 7 days)
  const upcomingCount = subscriptions.filter((sub) => {
    const today = new Date();
    const billingDate = new Date(sub.billingDate);
    const diffTime = billingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  // Prepare chart data by category
  const categoryTotals = subscriptions.reduce((acc, sub) => {
    const category = sub.category || 'Other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += sub.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData: ChartData[] = Object.entries(categoryTotals).map(
    ([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    })
  );

  return {
    subscriptions,
    isLoading,
    totalMonthly,
    upcomingCount,
    chartData,
  };
}
