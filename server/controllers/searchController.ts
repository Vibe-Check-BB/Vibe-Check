import { Request, Response, NextFunction } from 'express';
import { getEmbedding, getOpenAIResponse } from '../services/openaiService.js';
import { findSimilarSongs } from '../services/pineconeService.js';
import { FinalSongResponse } from '../../types/songTypes.js';

export const searchSongs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userQuery } = req.body;
    if (!userQuery) throw new Error('User query must be provided');

    const queryEmbedding = await getEmbedding(userQuery);
    if (queryEmbedding.length === 0) {
      throw new Error('Failed to generate embeddings on user query');
    }

    const pineconeResults = await findSimilarSongs(queryEmbedding);
    if (!pineconeResults.length) {
      res.locals.songs = [];
      return next();
    }

    console.log('pineconeResults', pineconeResults);

    const openAIRecommendations = await getOpenAIResponse(
      userQuery,
      pineconeResults.map(({ id, song, artist }) => ({
        id: typeof id === 'string' ? id : String(id),
        song: typeof song === 'string' ? song : String(song),
        artist: typeof artist === 'string' ? artist : String(artist),
      }))
    );

    console.log('openAIRecommmendations', openAIRecommendations);

    const finalResults: FinalSongResponse[] = (openAIRecommendations ?? []).map(
      (openAISong) => {
        const pineconeData = pineconeResults.find(
          (pineconeSong) => pineconeSong.id === openAISong.id
        );

        return {
          id: pineconeData?.id || openAISong?.id,
          song: openAISong.song,
          artist: openAISong.artist,
          reason: openAISong.reason,
          genre:
            typeof pineconeData?.genre === 'string'
              ? pineconeData.genre
              : 'Unknown',
          score: pineconeData?.score || 0,
        };
      }
    );
    console.log('finalResults', finalResults);

    res.locals.similarSongs = finalResults;
    return next();

    // Debugging mock data (uncomment if needed)
    /*
    res.locals.similarSongs = [
      {
        title: 'Mock Song 1',
        artist: 'Mock Artist',
        genre: 'Rock',
        score: 0.95,
      },
      {
        title: 'Mock Song 2',
        artist: 'Mock Artist',
        genre: 'Jazz',
        score: 0.89,
      },
    ];
    */
  } catch (err) {
    return next({
      log: `searchSongs: ${
        err instanceof Error
          ? err.message
          : `Unexpected error of type ${typeof err}: ${JSON.stringify(err)}`
      }`,
      status: 500,
      message: { err: 'Failed to retrieve similar songs.' },
    });
  }
};
