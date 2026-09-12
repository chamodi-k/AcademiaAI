import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { db } from '../models/dbAdapter.js';
import { Role } from '../types/index.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  studentId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. No Bearer token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: Role };
    const user = db.getUserById(decoded.id);

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid token. User no longer exists.' });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({ success: false, message: 'Account is suspended or deactivated.' });
      return;
    }

    const student = db.getStudentByUserId(user.id);

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      studentId: student?.id
    };

    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired JWT token.' });
    return;
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Access forbidden. Administrator privileges required.' });
    return;
  }
  next();
};
