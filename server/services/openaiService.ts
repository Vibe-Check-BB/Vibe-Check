/*
converting lyrics into embeddings
error handling
*/
import { RequestHandler } from 'express';
import OpenAI from 'openai';
import { OpenAIEmbeddingResponse } from '../../types/openaiTypes.ts';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const data: OpenAIEmbeddingResponse = await response.json();
    if (!response.ok) throw new Error('Failed to retrieve embeddings');
    return data.data[0]?.embedding || [];
  } catch (err) {
    console.error('Failed to generate embeddings', err);
    return [];
  }
};

export const getOpenAIResponse = async (
  query: string
): Promise<string | null> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'you are a spotify song recommendation assistant.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.error('Failed to generate embeddings', err);
    return null;
  }
};
