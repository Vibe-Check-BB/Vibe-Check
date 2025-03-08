/*
converting lyrics into embeddings
error handling
*/
import { OpenAIEmbeddingResponse } from '../../types/openaiTypes.js';
import { OpenAIMessage } from '../../types/openaiTypes.ts';
import { openai } from './openaiClient.js';  
import 'dotenv/config';
import { FinalSongResponse } from '../../types/songTypes.ts';


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

export const getOpenAIResponse = async (
  userQuery: string,
  pineconeResults: { id: string; song: string; artist: string }[]
): Promise<FinalSongResponse[]> => {
  try {
    const systemMessage: OpenAIMessage = {
      role: 'system',
      content: `
  You are an expert music recommendation assistant specializing in song selection and playlist curation. 
  Your job is to refine and rank a given list of songs based on the user's request.

  Consider the following when ranking songs:
  - **Lyrical themes** (Does the song’s lyrics align with the user’s intent?)
  - **Emotional tone** (Is the song’s mood appropriate for the request?)
  - **Musical style** (Does the genre and instrumentation match what the user might expect?)
  - **Cultural relevance** (Is this song a well-known example of what the user is looking for?)
  - **Artist association** (Is the artist known for songs in this style or theme?)
  - **Timeliness** (If the user wants “recent songs,” prioritize newer releases)

  **Instructions:**
  1. Select the **10 most relevant songs** from the provided list.
  2. Rank them from **most relevant to least relevant**.
  3. For each song, explain why it fits the request in **one or two sentences**.
  4. If none of the songs match well, return an **empty list**.

  **Response Format:**
  Return only JSON in the following format:
  {
    "songs": [
      {
        "id": "id",
        "song": "Song Title",
        "artist": "Artist Name",
        "reason": "Explanation of why this song fits the user's request."
      }
    ]

    If none of the songs fit the request, return an empty array.`,
    };

    const userMessage: OpenAIMessage = {
      role: 'user' as const,
      content: `
        User Query: "${userQuery}"

        Given the following list of songs, select and rank the 10 most relevant ones:

        ${pineconeResults.map((song) => `- ${song.song} by ${song.artist} with id of ${song.id}`).join('\n')}

        Return JSON output as per the system instructions.
      `,
    };
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [systemMessage, userMessage],
      response_format: { type: 'json_object' },
    });
    console.log('response', response)
    const parsedResponse = JSON.parse(
      response.choices[0].message.content || '{}'
    );
    console.log('parsedResponse', parsedResponse);
    if (!parsedResponse.songs || !Array.isArray(parsedResponse.songs)) {
      return [];
    }
    return parsedResponse.songs
  } catch (err) {
    console.error('Failed to get Openai response', err);
    throw new Error('Openai request failed');
  }
};
