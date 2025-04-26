import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '@/lib/auth';

// Extend the Express Request type
interface AuthenticatedRequest extends Request {
  userId: string;
}

// Authentication middleware
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Add user ID to request object
    req.userId = payload.userId;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};
