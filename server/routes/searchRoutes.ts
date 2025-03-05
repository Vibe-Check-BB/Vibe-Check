import express from 'express';
import { Request, Response} from 'express';
import { searchSongs } from '../controllers/searchController.js';

const searchRouter = express.Router();

searchRouter.post(
  '/search',
  searchSongs,
  (_req: Request, res: Response) => {
    res.json({ similarSongs: res.locals.similarSongs });
  }
);

export default searchRouter;
 