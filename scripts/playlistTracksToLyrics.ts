import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";
import axios from 'axios';
import fs from "fs";

dotenv.config();

const LYRICS_API = 'https://api.lyrics.ovh/v1';

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

// Define a type for track data
type TrackData = {
    artist: string;
    trackName: string;
    artistId: string;
    trackId: string;
    imageUrl: string;
};

async function authenticate() {
  const tokenData = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(tokenData.body.access_token);
}

async function getTrackIds(): Promise<Map<string, TrackData>> {
  await authenticate();
  const playlistId = '2OX1wqEoaL6pzZHHWE6yAH';
  let playlistTracks
  try{
    playlistTracks = await spotifyApi.getPlaylistTracks(playlistId);
  } catch (error) {
    console.log("issue with getting playlist tracks: ", error)
  }
  

  // Use a proper Map to store track data
  const tracks = new Map<string, TrackData>();
  
  playlistTracks.body.items.forEach((item, i) => {
    if (item.track !== null) {
      tracks.set(i.toString(), {
        artist: item.track.artists[0].name,
        trackName: item.track.name,
        artistId: item.track.artists[0].id,
        trackId: item.track.id,
        imageUrl: item.track.album.images[0].url
      });
    }
  });
  
  return tracks;
}

async function getLyrics(artist: string, trackName: string): Promise<string> {
    try {
        const encodedArtist = encodeURIComponent(artist);
        const encodedTrackName = encodeURIComponent(trackName);
        const response = await axios.get(`${LYRICS_API}/${encodedArtist}/${encodedTrackName}`);
        return response.data.lyrics; // raw lyrics string
    } catch (error) {
        console.warn(`Lyrics not found for "${trackName}" by ${artist}`);
        return 'Lyrics not available';
    }
}

type LyricsData = {
    artist: string;
    song: string;
    spotifyId: string;
    imageURL: string;
    genre: string;
    lyrics: string;
};

async function main() {
  try {
    const tracks = await getTrackIds();
    const lyricsData: LyricsData[] = [];
    console.log(`Found ${tracks.size} tracks in playlist`);

    // Use for..of loop for async operations instead of forEach
    for (const [key, track] of tracks.entries()) {
      console.log(`Processing track ${key}: ${track.trackName} by ${track.artist}`);
      
      try {
        const artistDataResponse = await spotifyApi.getArtist(track.artistId);
        const genres = artistDataResponse.body.genres || [];
        const artistLyrics = await getLyrics(track.artist, track.trackName);
        
        if (artistLyrics === 'Lyrics not available') {
            console.log(`Skipping ${track.trackName} by ${track.artist} - LYRICS NOT AVAILABLE`);
            continue;
        }

        lyricsData.push({
            "artist": track.artist,
            "song": track.trackName,
            "spotifyId": track.trackId,
            "imageURL": track.imageUrl,
            "genre": genres.join(', '),
            "lyrics": artistLyrics
        });
        
        console.log(`Successfully processed: ${track.trackName} by ${track.artist}`);
      } catch (error) {
        console.error(`Error processing track ${track.trackName} by ${track.artist}:`, error);
      }
    }
    
    console.log(`Successfully processed ${lyricsData.length} tracks with lyrics`);
    fs.writeFileSync('./data/lyrics_dataset', JSON.stringify(lyricsData, null, 2));
    console.log('Data written to lyrics_dataset');

  } catch (error) {
    console.error(`An error has occurred in the main function:`, error);
  }
}

main();