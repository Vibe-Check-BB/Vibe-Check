/*
converting lyrics into embeddings
error handling
*/
import { OpenAIEmbeddingResponse } from '../../types/openaiTypes.js';
import 'dotenv/config';

//create async function take in a string to embed using openai embedding model

export const getEmbedding = async (text: string): Promise<number[]> => {
  if (!text) throw new Error('Text must be provided to embed');
  if (typeof text !== 'string') throw new Error('Text must be string!');

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });
    const data = (await response.json()) as OpenAIEmbeddingResponse;
    if (!response.ok) throw new Error('Failed to retrieve embeddings');
    return data.data[0]?.embedding || [];
  } catch (err) {
    console.error('Failed to generate embeddings', err);
    return [];
  }
};
