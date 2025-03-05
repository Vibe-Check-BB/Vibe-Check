import { Pinecone } from '@pinecone-database/pinecone';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define interfaces for our data
interface LyricsObject {
  artist: string;
  song: string;
  genre: string;
  lyrics: string;
  spotifyId: string;
  embedding: number[];
  [key: string]: any;
}

interface PineconeRecord {
  id: string;
  values: number[];
  metadata: {
    artist: string;
    song: string;
    genre: string;
    lyrics: string;
    spotifyId: string;
  };
}

/**
 * Breaks an array into chunks of specified size
 * @param array - Array to be chunked
 * @param batchSize - Size of each chunk
 * @returns Array of chunks
 */
const chunks = <T>(array: T[], batchSize = 200): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    result.push(array.slice(i, i + batchSize));
  }
  return result;
};

/**
 * Creates an ASCII-only string for use as a Pinecone ID
 * @param input - Input string to sanitize
 * @returns ASCII-only string with non-ASCII chars removed
 */
const createAsciiId = (input: string): string => {
  // Replace spaces with underscores and convert to lowercase
  const baseString = input.replace(/\s+/g, '_').toLowerCase();
  
  // Remove non-ASCII characters
  return baseString.replace(/[^\x00-\x7F]/g, '');
};

/**
 * Uploads lyrics data with embeddings to Pinecone
 * @param lyricsData - Array of lyrics objects with embeddings
 * @returns Promise that resolves when upload is complete
 */
async function uploadToPinecone(lyricsData: LyricsObject[]): Promise<void> {
  // Initialize Pinecone client
  const pc = new Pinecone({ 
    apiKey: process.env.PINECONE_API_KEY || ''
  });

  // Get the index
  const index = pc.index('songs');
  
  // Convert lyrics objects to Pinecone records
  const records: PineconeRecord[] = lyricsData
    .filter(item => item.artist && item.song && Array.isArray(item.embedding)) // Filter out items missing required fields
    .map(item => ({
      id: createAsciiId(`${item.artist}-${item.song}`), // Create ASCII-only ID from artist and song
      values: item.embedding,
      metadata: {
        artist: item.artist,
        song: item.song,
        spotifyId: item.spotifyId,
        genre: item.genre || '',
        lyrics: item.lyrics || ''
      }
    }));

  // Log the number of records to upload
  console.log(`Preparing to upload ${records.length} records to Pinecone...`);

  // Break records into chunks of 200
  const recordChunks = chunks(records, 200);
  console.log(`Split into ${recordChunks.length} batches of up to 200 records each`);

  // Upload chunks sequentially
  for (let i = 0; i < recordChunks.length; i++) {
    const chunk = recordChunks[i];
    try {
      await index.upsert(chunk);
      console.log(`Uploaded batch ${i + 1}/${recordChunks.length} (${chunk.length} records)`);
    } catch (error) {
      console.error(`Error uploading batch ${i + 1}:`, error);
    }
    
    // Add a small delay between batches to avoid rate limiting
    if (i < recordChunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('Upload completed!');
}

// Function to process the lyrics file and upload to Pinecone
async function processAndUpload(filePath: string = './data/lyrics_dataset'): Promise<void> {
  try {
    // Check if Pinecone API key is available
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY environment variable is not set. Please set it in your .env file.');
    }

    // Read the file
    console.log(`Reading lyrics data from ${filePath}...`);
    const fileData = fs.readFileSync(filePath, 'utf8');
    
    // Parse the JSON content
    const lyricsData: LyricsObject[] = JSON.parse(fileData);
    
    // Check if embeddings exist
    const itemsWithEmbeddings = lyricsData.filter(item => Array.isArray(item.embedding)).length;
    console.log(`Found ${itemsWithEmbeddings} items with embeddings out of ${lyricsData.length} total items.`);
    
    if (itemsWithEmbeddings === 0) {
      throw new Error('No embeddings found in the data. Please run the embedding generation script first.');
    }
    
    // Upload to Pinecone
    await uploadToPinecone(lyricsData);
    
  } catch (error) {
    console.error('Error processing and uploading:', error);
  }
}

// Run the function
(async () => {
  await processAndUpload();
})();