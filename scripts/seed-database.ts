import { Pinecone } from '@pinecone-database/pinecone';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables from .env file
dotenv.config();

// Define interfaces for our data
interface LyricsObject {
  artist: string;
  song: string;
  genre: string;
  lyrics: string;
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
  };
}

/**
 * Helper function to break array into chunks of specified size
 * @param array - Array to chunk
 * @param batchSize - Size of each chunk
 * @returns Array of chunks
 */
const chunks = <T>(array: T[], batchSize = 200): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    chunks.push(array.slice(i, i + batchSize));
  }
  return chunks;
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
      id: uuidv4(), // Generate a UUID for each record
      values: item.embedding,
      metadata: {
        artist: item.artist,
        song: item.song,
        genre: item.genre || '',
        lyrics: item.lyrics || ''
      }
    }));

  // Log the number of records to upload
  console.log(`Preparing to upload ${records.length} records to Pinecone...`);

  // Split records into chunks for batch processing
  const recordChunks = chunks(records, 200);
  console.log(`Split into ${recordChunks.length} batches of up to 200 records each`);

  // Process each chunk
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
async function processAndUpload(filePath: string = './data/lyrics_dataset_w_embeddings'): Promise<void> {
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