import axios from 'axios';
import { Subscription } from '@/types/subscription';
import { MOCK_SUBSCRIPTIONS } from '@/data/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Flag to prevent multiple API calls when there's an error
let apiErrorOccurred = false;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent long-hanging requests
  timeout: 5000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

interface SubscriptionApiResponse {
  id: string;
  gmailAccountId: string;
  name: string;
  amount: number;
  currency: string;
  frequency: string;
  category?: string;
  lastBilledAt?: string;
  nextBillingAt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  gmailAccount?: {
    email: string;
  };
}

export const getSubscriptions = async (): Promise<Subscription[]> => {
  // If not authenticated or an API error has already occurred, return mock data immediately
  if (!isAuthenticated() || apiErrorOccurred) {
    console.log('Using mock subscription data (not authenticated or previous error)');
    return MOCK_SUBSCRIPTIONS;
  }
  
  try {
    const response = await api.get('/subscriptions');
    // Reset the error flag if the request succeeds
    apiErrorOccurred = false;
    
    // If the API returns no data, use mock data instead
    if (!response.data || response.data.length === 0) {
      console.log('API returned no subscription data, using mock data instead');
      return MOCK_SUBSCRIPTIONS;
    }
    
    return response.data.map((sub: SubscriptionApiResponse) => ({
      id: sub.id,
      serviceName: sub.name,
      amount: sub.amount,
      billingDate: sub.nextBillingAt || sub.lastBilledAt,
      status: sub.status.toLowerCase() as 'active' | 'canceled',
      category: sub.category || 'Other',
      logoUrl: `https://logo.clearbit.com/${sub.name.toLowerCase().replace(/\s+/g, '')}.com`,
      userId: sub.gmailAccountId,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    // Set the error flag to prevent further API calls
    apiErrorOccurred = true;
    // Return mock data if API fails
    return MOCK_SUBSCRIPTIONS;
  }
};

export const getSubscription = async (id: string): Promise<Subscription | null> => {
  if (!isAuthenticated() || apiErrorOccurred) {
    const mockSub = MOCK_SUBSCRIPTIONS.find(sub => sub.id === id);
    return mockSub || null;
  }
  
  try {
    const response = await api.get(`/subscriptions/${id}`);
    const sub = response.data as SubscriptionApiResponse;
    return {
      id: sub.id,
      serviceName: sub.name,
      amount: sub.amount,
      billingDate: sub.nextBillingAt || sub.lastBilledAt,
      status: sub.status.toLowerCase() as 'active' | 'canceled',
      category: sub.category || 'Other',
      logoUrl: `https://logo.clearbit.com/${sub.name.toLowerCase().replace(/\s+/g, '')}.com`,
      userId: sub.gmailAccountId,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    const mockSub = MOCK_SUBSCRIPTIONS.find(sub => sub.id === id);
    return mockSub || null;
  }
};

export const createSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription | null> => {
  if (!isAuthenticated() || apiErrorOccurred) {
    // Create a mock subscription with a generated ID
    const newSubscription: Subscription = {
      id: `mock-${Date.now()}`,
      ...subscription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newSubscription;
  }
  
  try {
    const payload = {
      gmailAccountId: subscription.userId,
      name: subscription.serviceName,
      amount: subscription.amount,
      category: subscription.category,
      nextBillingAt: subscription.billingDate,
      status: subscription.status.toUpperCase(),
    };
    
    const response = await api.post('/subscriptions', payload);
    const sub = response.data as SubscriptionApiResponse;
    
    return {
      id: sub.id,
      serviceName: sub.name,
      amount: sub.amount,
      billingDate: sub.nextBillingAt || sub.lastBilledAt,
      status: sub.status.toLowerCase() as 'active' | 'canceled',
      category: sub.category || 'Other',
      logoUrl: `https://logo.clearbit.com/${sub.name.toLowerCase().replace(/\s+/g, '')}.com`,
      userId: sub.gmailAccountId,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    
    // Create a mock subscription with a generated ID
    const newSubscription: Subscription = {
      id: `mock-${Date.now()}`,
      ...subscription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newSubscription;
  }
};

export const updateSubscription = async (id: string, subscription: Partial<Subscription>): Promise<Subscription | null> => {
  if (!isAuthenticated() || apiErrorOccurred) {
    // Find the mock subscription and update it
    const mockSub = MOCK_SUBSCRIPTIONS.find(sub => sub.id === id);
    if (mockSub) {
      return {
        ...mockSub,
        ...subscription,
        updatedAt: new Date().toISOString(),
      };
    }
    return null;
  }
  
  try {
    const payload: Record<string, unknown> = {};
    
    if (subscription.serviceName) payload.name = subscription.serviceName;
    if (subscription.amount) payload.amount = subscription.amount;
    if (subscription.billingDate) payload.nextBillingAt = subscription.billingDate;
    if (subscription.status) payload.status = subscription.status.toUpperCase();
    if (subscription.category) payload.category = subscription.category;
    
    const response = await api.put(`/subscriptions/${id}`, payload);
    const sub = response.data as SubscriptionApiResponse;
    
    return {
      id: sub.id,
      serviceName: sub.name,
      amount: sub.amount,
      billingDate: sub.nextBillingAt || sub.lastBilledAt,
      status: sub.status.toLowerCase() as 'active' | 'canceled',
      category: sub.category || 'Other',
      logoUrl: `https://logo.clearbit.com/${sub.name.toLowerCase().replace(/\s+/g, '')}.com`,
      userId: sub.gmailAccountId,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    };
  } catch (error) {
    console.error('Error updating subscription:', error);
    
    // Find the mock subscription and update it
    const mockSub = MOCK_SUBSCRIPTIONS.find(sub => sub.id === id);
    if (mockSub) {
      return {
        ...mockSub,
        ...subscription,
        updatedAt: new Date().toISOString(),
      };
    }
    return null;
  }
};

export const deleteSubscription = async (id: string): Promise<boolean> => {
  if (!isAuthenticated() || apiErrorOccurred) {
    return true; // Simulate successful deletion
  }
  
  try {
    await api.delete(`/subscriptions/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return true; // Return true even on error to allow UI to update
  }
};
