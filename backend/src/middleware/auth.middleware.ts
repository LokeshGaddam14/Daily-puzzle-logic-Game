import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface User extends AuthUser {}
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface AuthRequest extends Request {
  user: AuthUser;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { id: string };
    prisma.user.findUnique({ where: { id: payload.id } }).then(user => {
      if (!user) {
        res.status(401).json({ status: 'error', message: 'User not found' });
        return;
      }
      req.user = { id: user.id, email: user.email, name: user.name };
      next();
    }).catch(err => {
      console.error('Auth middleware database error:', err);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    });
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { id: string };
    prisma.user.findUnique({ where: { id: payload.id } }).then(user => {
      if (user) {
        req.user = { id: user.id, email: user.email, name: user.name };
      }
      next();
    }).catch(() => next());
  } catch (err) {
    next();
  }
}
