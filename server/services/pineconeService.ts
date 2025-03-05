/*
Store embeddings (if not already stored)
Query the database for similar embeddings
*/

import { Pinecone } from '@pinecone-database/pinecone';
import { EmbedSongRequest } from '../../types/embeddingTypes.js';
import 'dotenv/config';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

const index = pc.Index('songs');

export const storeSongEmbedding = async (
  songData: EmbedSongRequest,
  embedding: number[]
): Promise<void> => {
  try {
    await index.upsert([
      {
        id: songData.id,
        values: embedding,
        metadata: {
          song: songData.song || 'Unknown',
          artist: songData.artist || 'Unknown',
          genre: songData.genre || 'Unknown',
        },
      },
    ]);
    console.log(`Stored embedding for song: ${songData.song}`);
  } catch (err) {
    console.error('Error storing song embedding:', err);
    throw new Error('Failed to store song embedding in Pinecone.');
  }
};

export const findSimilarSongs = async (queryEmbedding: number[]) => {
  // To verify that the index is populated
  // const stats = await index.describeIndexStats();
  // console.log(stats);
  try {
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 10,
      includeMetadata: true,
    });

    return queryResponse.matches.map((match) => ({
      id: match.id,
      score: match.score,
      artist: match.metadata?.artist || 'Unknown',
      genre: match.metadata?.genre || 'Unknown',
      song: match.metadata?.song || 'Unknown',
    }));
  } catch (err) {
    console.error('Error querying Pinecone:', err);
    throw new Error('Failed to query Pinecone for similar songs.');
  }
};
