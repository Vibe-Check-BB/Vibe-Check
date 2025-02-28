import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";
import axios from 'axios';
dotenv.config();


const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});


const LYRICS_URL = 'https://api.lyrics.ovh/v1';


// ** Fetch top tracks of a single artist using artist ID
// e.g('Taylor Swift' is '06HL4z0CvFAxyc27GXpf02')
const ARTIST_ID = '06HL4z0CvFAxyc27GXpf02';




// fetch top tracks 
async function getArtistTopTracks(artistId: string, country = 'US') {
    // access token with client credential flow
    const tokenData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(tokenData.body.access_token)

    // Fetch top tracks
    const response = await spotifyApi.getArtistTopTracks(artistId, country)
    return response.body.tracks; // array of track objects
}




// *** fetch lyrics from Lyrics.ovh for each track

async function getLyrics(artist: string, title: string): Promise<string | null> {
    try {
      // encodeURIComponent bypasses special chars to be used in an http request
        const encodedArtist = encodeURIComponent(artist);
        const encodedTitle = encodeURIComponent(title)
        const response = await axios.get(`${LYRICS_URL}/${encodedArtist}/${encodedTitle}`)
        return response.data.lyrics; // raw lyrics string
    } catch( error) {
        console.warn(`Lyrics not found for "${title}" by ${artist}`)
        return null
    }
 }




 
 async function main() {
  try {
    // Fetch top tracks from Spotify
    const tracks = await getArtistTopTracks(ARTIST_ID); // top 10 tracks for artist

    // Build an array of { artist, title, lyrics }
    const dataset = [];

    for (const track of tracks) {
      // take the first artist for simplicity (could have multiple artist)
      const mainArtistName = track.artists[0].name;
      const trackTitle = track.name;

      // Fetch lyrics from Lyrics.ovh
      const lyrics = await getLyrics(mainArtistName, trackTitle);

      // If we got lyrics, push to the dataset
      if (lyrics) {
        dataset.push({
          artist: mainArtistName,
          title: trackTitle,
          lyrics
        });
        console.log(`Fetched lyrics for: "${trackTitle}" by ${mainArtistName}`);
      }
    }

    console.log('Final dataset:', dataset);

    // Here we should have
    // [ { artist: ..., title: ..., lyrics: ...}, ... ]
    // Next step: embed each lyrics text and store in Pinecone

  } catch (error) {
    console.error('Error in main()', error);
  }
}

main();