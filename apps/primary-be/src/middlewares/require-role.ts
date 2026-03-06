import { NextFunction, Request, Response } from 'express';
import { UserRole } from 'db';

/**
 * Middleware to require a specific role for route access.
 * Must be used after authMiddleware.
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};
