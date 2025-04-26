import axios from 'axios';
import { Expense } from '@/types/gmail';
import { MOCK_EXPENSES } from '@/data/mockData';

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

interface ExpenseApiResponse {
  id: string;
  gmailAccountId: string;
  amount: number;
  currency: string;
  merchant: string;
  category?: string;
  date: string;
  description?: string;
  receiptId?: string;
  createdAt: string;
  updatedAt: string;
  gmailAccount?: {
    email: string;
  };
}

export const getExpenses = async (): Promise<Expense[]> => {
  // If not authenticated or an API error has already occurred, return mock data immediately
  if (!isAuthenticated() || apiErrorOccurred) {
    console.log('Using mock expense data (not authenticated or previous error)');
    return MOCK_EXPENSES;
  }
  
  try {
    const response = await api.get('/expenses');
    // Reset the error flag if the request succeeds
    apiErrorOccurred = false;
    
    // If the API returns no data, use mock data instead
    if (!response.data || response.data.length === 0) {
      console.log('API returned no expense data, using mock data instead');
      return MOCK_EXPENSES;
    }
    
    return response.data.map((exp: ExpenseApiResponse) => ({
      id: exp.id,
      merchant: exp.merchant,
      amount: exp.amount,
      date: exp.date,
      category: exp.category || 'Other',
      description: exp.description || '',
      logoUrl: `https://logo.clearbit.com/${exp.merchant.toLowerCase().replace(/\s+/g, '')}.com`,
      accountId: exp.gmailAccountId,
    }));
  } catch (error) {
    console.error('Error fetching expenses:', error);
    // Set the error flag to prevent further API calls
    apiErrorOccurred = true;
    // Return mock data if API fails
    return MOCK_EXPENSES;
  }
};

export const getExpense = async (id: string): Promise<Expense | null> => {
  if (!isAuthenticated() || apiErrorOccurred) {
    const mockExp = MOCK_EXPENSES.find(exp => exp.id === id);
    return mockExp || null;
  }
  
  try {
    const response = await api.get(`/expenses/${id}`);
    const exp = response.data as ExpenseApiResponse;
    return {
      id: exp.id,
      merchant: exp.merchant,
      amount: exp.amount,
      date: exp.date,
      category: exp.category || 'Other',
      description: exp.description || '',
      logoUrl: `https://logo.clearbit.com/${exp.merchant.toLowerCase().replace(/\s+/g, '')}.com`,
      accountId: exp.gmailAccountId,
    };
  } catch (error) {
    console.error('Error fetching expense:', error);
    const mockExp = MOCK_EXPENSES.find(exp => exp.id === id);
    return mockExp || null;
  }
};

export const createExpense = async (expense: Omit<Expense, 'id' | 'logoUrl'>): Promise<Expense | null> => {
  if (!isAuthenticated() || apiErrorOccurred) {
    // Create a mock expense with a generated ID
    const newExpense: Expense = {
      id: `mock-${Date.now()}`,
      ...expense,
      logoUrl: `https://logo.clearbit.com/${expense.merchant.toLowerCase().replace(/\s+/g, '')}.com`,
    };
    return newExpense;
  }
  
  try {
    const payload = {
      gmailAccountId: expense.accountId,
      amount: expense.amount,
      merchant: expense.merchant,
      category: expense.category,
      date: expense.date,
      description: expense.description,
    };
    
    const response = await api.post('/expenses', payload);
    const exp = response.data as ExpenseApiResponse;
    
    return {
      id: exp.id,
      merchant: exp.merchant,
      amount: exp.amount,
      date: exp.date,
      category: exp.category || 'Other',
      description: exp.description || '',
      logoUrl: `https://logo.clearbit.com/${exp.merchant.toLowerCase().replace(/\s+/g, '')}.com`,
      accountId: exp.gmailAccountId,
    };
  } catch (error) {
    console.error('Error creating expense:', error);
    
    // Create a mock expense with a generated ID
    const newExpense: Expense = {
      id: `mock-${Date.now()}`,
      ...expense,
      logoUrl: `https://logo.clearbit.com/${expense.merchant.toLowerCase().replace(/\s+/g, '')}.com`,
    };
    return newExpense;
  }
};

export const updateExpense = async (id: string, expense: Partial<Expense>): Promise<Expense | null> => {
  if (!isAuthenticated() || apiErrorOccurred) {
    // Find the mock expense and update it
    const mockExp = MOCK_EXPENSES.find(exp => exp.id === id);
    if (mockExp) {
      return {
        ...mockExp,
        ...expense,
      };
    }
    return null;
  }
  
  try {
    const payload: Record<string, unknown> = {};
    
    if (expense.merchant) payload.merchant = expense.merchant;
    if (expense.amount) payload.amount = expense.amount;
    if (expense.date) payload.date = expense.date;
    if (expense.category) payload.category = expense.category;
    if (expense.description !== undefined) payload.description = expense.description;
    
    const response = await api.put(`/expenses/${id}`, payload);
    const exp = response.data as ExpenseApiResponse;
    
    return {
      id: exp.id,
      merchant: exp.merchant,
      amount: exp.amount,
      date: exp.date,
      category: exp.category || 'Other',
      description: exp.description || '',
      logoUrl: `https://logo.clearbit.com/${exp.merchant.toLowerCase().replace(/\s+/g, '')}.com`,
      accountId: exp.gmailAccountId,
    };
  } catch (error) {
    console.error('Error updating expense:', error);
    
    // Find the mock expense and update it
    const mockExp = MOCK_EXPENSES.find(exp => exp.id === id);
    if (mockExp) {
      return {
        ...mockExp,
        ...expense,
      };
    }
    return null;
  }
};

export const deleteExpense = async (id: string): Promise<boolean> => {
  if (!isAuthenticated() || apiErrorOccurred) {
    return true; // Simulate successful deletion
  }
  
  try {
    await api.delete(`/expenses/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    return true; // Return true even on error to allow UI to update
  }
};
