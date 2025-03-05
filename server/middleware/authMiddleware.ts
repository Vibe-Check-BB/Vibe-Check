import { Request, Response, NextFunction } from 'express';

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['authorization'];
  if (apiKey !== `Bearer ${process.env.APP_SECRET}`) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};
