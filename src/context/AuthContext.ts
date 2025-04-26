import { createContext } from 'react';
import { UserCredentials, UserRegistration } from '../lib/authClient';

export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: UserCredentials) => Promise<void>;
  register: (userData: UserRegistration) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});
