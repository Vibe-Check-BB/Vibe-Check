import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { searchSongs } from '../controllers/searchController';

const router = express.Router();

router.post('/search', searchSongs, (_req: Request, res: Response) => {
  res.json({ similarSongs: res.locals.similarSongs });
});

export default router;
 