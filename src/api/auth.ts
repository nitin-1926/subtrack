import { loginUser, registerUser, logoutUser, getUserFromToken, UserCredentials, UserRegistration } from '@/lib/auth';
import { Request, Response } from 'express';

// Type definitions for the Express request handlers
export type ExpressHandler = (req: Request, res: Response) => Promise<void>;

// Register handler
export const registerHandler: ExpressHandler = async (req, res) => {
  try {
    const userData: UserRegistration = req.body;
    const result = await registerUser(userData);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};

// Login handler
export const loginHandler: ExpressHandler = async (req, res) => {
  try {
    const credentials: UserCredentials = req.body;
    const result = await loginUser(credentials);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};

// Logout handler
export const logoutHandler: ExpressHandler = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    await logoutUser(token);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

// Get current user handler
export const getCurrentUserHandler: ExpressHandler = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};
