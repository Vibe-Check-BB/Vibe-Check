import { Request, Response, NextFunction } from 'express';
import { getEmbedding } from '../services/openaiService.js';
import { findSimilarSongs } from '../services/pineconeService.js';

export const searchSongs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userQuery } = req.body;
    if (!userQuery) throw new Error('User query must be provided');
    const queryEmbedding = await getEmbedding(userQuery);
    if ((queryEmbedding.length === 0))
      throw new Error('Failed to generate embeddings on user query');
    const similarSongs = await findSimilarSongs(queryEmbedding);
    res.locals.similarSongs = similarSongs;
    // res.locals.similarSongs = [
    //   {
    //     title: 'Mock Song 1',
    //     artist: 'Mock Artist',
    //     genre: 'Rock',
    //     score: 0.95,
    //   },
    //   {
    //     title: 'Mock Song 2',
    //     artist: 'Mock Artist',
    //     genre: 'Jazz',
    //     score: 0.89,
    //   },
    // ];
    return next();
  } catch (err) {
    return next({
      log: `searchSongs: ${err instanceof Error 
          ? err.message 
          : `Unexpected error of type ${typeof err}: ${JSON.stringify(err)}`
      }`,
      status: 500,
      message: { err: 'Failed to retrieve similar songs.' },
    });
  }
};
