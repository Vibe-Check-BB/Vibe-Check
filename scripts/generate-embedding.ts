import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define a type for the lyrics objects
interface LyricsObject {
  [key: string]: any;
  lyrics?: string;
  embedding?: number[];
}

/**
 * Generates embeddings for lyrics and adds them to each object
 * @param lyricsData - Array of lyrics objects
 * @returns Promise resolving to the modified array with embeddings added
 */
async function addLyricsEmbeddings(lyricsData: LyricsObject[]): Promise<LyricsObject[]> {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Process objects in batches to avoid rate limiting
  const batchSize = 10;
  const results: LyricsObject[] = [];
  
  console.log(`Processing ${lyricsData.length} items in batches of ${batchSize}...`);

  for (let i = 0; i < lyricsData.length; i += batchSize) {
    const batch = lyricsData.slice(i, i + batchSize);
    
    // Process each item in the batch
    const batchPromises = batch.map(async (item) => {
      try {
        // Skip if no lyrics or empty lyrics
        if (!item.lyrics || typeof item.lyrics !== 'string' || item.lyrics.trim() === '') {
          console.log(`Skipping item (no lyrics or empty lyrics): ${item.title || 'unknown'}`);
          return item;
        }
        
        // Generate embedding for the lyrics
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: item.lyrics,
          encoding_format: "float",
        });
        
        // Add the embedding to the item
        return {
          ...item,
          embedding: embeddingResponse.data[0].embedding,
        };
      } catch (error) {
        console.error(`Error generating embedding for item: ${item.title || 'unknown'}`, error);
        // Return the item without embedding in case of error
        return item;
      }
    });
    
    // Wait for all items in the batch to be processed
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(lyricsData.length/batchSize)}`);
    
    // Add a small delay between batches to avoid rate limiting
    if (i + batchSize < lyricsData.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

// Function to process the lyrics.json file
async function processLyricsFile(filePath: string = './data/lyrics_dataset'): Promise<void> {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set. Please set it in your .env file.');
    }

    // Read the file
    const fileData = fs.readFileSync(filePath, 'utf8');
    
    // Parse the JSON content
    const lyricsData: LyricsObject[] = JSON.parse(fileData);
    
    console.log(`Starting embedding generation for ${lyricsData.length} items...`);
    
    // Add embeddings to lyrics objects
    const updatedLyricsData = await addLyricsEmbeddings(lyricsData);
    
    // Count items that received embeddings
    const itemsWithEmbeddings = updatedLyricsData.filter(item => Array.isArray(item.embedding)).length;
    
    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(updatedLyricsData, null, 2));
    
    console.log(`Successfully processed ${lyricsData.length} items. Added embeddings to ${itemsWithEmbeddings} items.`);
  } catch (error) {
    console.error('Error processing lyrics file:', error);
  }
}

// Run the function
(async () => {
  await processLyricsFile();
})();