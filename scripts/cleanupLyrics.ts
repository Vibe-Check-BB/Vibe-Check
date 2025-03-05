// Define a type for the lyrics objects
interface LyricsObject {
    [key: string]: any;
    lyrics?: string;
  }
  
  /**
   * Removes all '\r' and '\n' characters from the lyrics field in each object
   * @param lyricsData - Array of lyrics objects
   * @returns The modified array with cleaned lyrics fields
   */
  function cleanLyricsLineBreaks(lyricsData: LyricsObject[]): LyricsObject[] {
    return lyricsData.map(item => {
      // Check if the item has a lyrics key and it's a string
      if (item.lyrics && typeof item.lyrics === 'string') {
        // Remove all '\r' and '\n' characters from the lyrics
        const cleanedLyrics = item.lyrics.replace(/[\r\n]/g, ' ');
        
        // Return the item with cleaned lyrics
        return {
          ...item,
          lyrics: cleanedLyrics
        };
      }
      // If it doesn't have lyrics or lyrics is not a string, return the item unchanged
      return item;
    });
  }
  
  // Example usage with a file
  import * as fs from 'fs';
  
  // Function to process the lyrics.json file
  function processLyricsFile(filePath: string = './data/lyrics_dataset'): void {
    try {
      // Read the file
      const fileData = fs.readFileSync(filePath, 'utf8');
      
      // Parse the JSON content
      const lyricsData: LyricsObject[] = JSON.parse(fileData);
      
      // Count how many objects have lyrics fields that need cleaning
      const objectsWithLineBreaks = lyricsData.filter(
        item => item.lyrics && typeof item.lyrics === 'string' && /[\r\n]/.test(item.lyrics)
      ).length;
      
      // Clean lyrics line breaks
      const updatedLyricsData = cleanLyricsLineBreaks(lyricsData);
      
      // Write the updated data back to the file
      fs.writeFileSync(filePath, JSON.stringify(updatedLyricsData, null, 2));
      
      console.log(`Successfully processed ${lyricsData.length} items. Removed line breaks from ${objectsWithLineBreaks} lyrics fields.`);
    } catch (error) {
      console.error('Error processing lyrics file:', error);
    }
  }
  
  // Call the function to process the file
  processLyricsFile();