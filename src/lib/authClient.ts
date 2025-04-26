// Client-side authentication utilities that connect to the backend API
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  email: string;
  name?: string | null;
}

interface AuthResponse {
  user: User;
  token: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration extends UserCredentials {
  name?: string;
}

// API URL
const API_URL = 'http://localhost:5000/api';

// Store the token in localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem('token', token);
}

// Get the token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// Remove the token from localStorage
export function removeAuthToken(): void {
  localStorage.removeItem('token');
}

// Register user
export async function registerUser(userData: UserRegistration): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    setAuthToken(data.token);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Registration failed');
  }
}

// Login user
export async function loginUser(credentials: UserCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    setAuthToken(data.token);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Login failed');
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  try {
    const token = getAuthToken();
    if (!token) return;

    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } finally {
    removeAuthToken();
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeAuthToken();
      }
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
