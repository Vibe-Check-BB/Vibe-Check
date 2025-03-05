/*
Fetching the user's playlist from Spotify.
Managing playlist-related metadata.
Returning playlist data to the frontend
*/

import { RequestHandler } from 'express';
import { getEmbedding } from '../services/openaiService.js';
import { Request, Response, NextFunction } from 'express';
import {
  storeSongEmbedding,
} from '../services/pineconeService.js';
import { EmbedSongRequest } from '../../types/embeddingTypes.js';

export const embedSongLyrics: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { artist, song, lyrics, genre }: EmbedSongRequest = req.body; 
    if (!song || !lyrics)
      throw new Error('Song title and lyrics are required');
    const embedding = await getEmbedding(lyrics);
    if (embedding.length === 0)
      throw new Error('Failed to generate embeddings');

    await storeSongEmbedding({song, lyrics, artist, genre}, embedding) ;
    next();
  } catch (err) {
    return next({
      log: `embedSongLyrics: ${
        err instanceof Error
          ? err.message
          : `Unexpected error of type ${typeof err}: ${JSON.stringify(err)}`
      }`,
      status: 500,
      message: { err: 'Failed to generate and store song embeddings.' },
    });
  }
};
