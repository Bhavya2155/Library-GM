import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const auth = (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.adminId = (decoded as any).id;
    req.role = (decoded as any).role || 'admin'; // default for older tokens
    next();
  } catch (err) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admins only.' });
  }
  next();
};
