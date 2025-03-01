/*
Checking if a song’s lyrics are already embedded.
Invoking services to extract lyrics (if needed) using the Genius API.
Generating embeddings using OpenAI.
Triggering storage of embeddings in Pinecone.
*/
import { getEmbedding } from '../services/openaiService';
import { Request, Response, NextFunction } from 'express';

export const queryOpenAIEmbedding = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userQuery } = res.locals;
    if (!userQuery) {
      throw new Error('queryOpenAIEmbedding did not receive a user query');
    }

    res.locals.embedding = await getEmbedding(userQuery);
    return next();
  } catch (err) {
    return next({
      log: `queryOpenAIEmbedding: ${err.message}`,
      status: 500,
      message: { err: 'Failed to generate embeddings' },
    });
  }
};
