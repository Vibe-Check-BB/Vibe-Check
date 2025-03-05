import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";
import axios from 'axios';
import fs from "fs";

dotenv.config();


const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});




// *** Fetch top 50 artist and top 10 songs for each artist



// * Authenticate and get access token
async function authenticate() {
  // access token with client credential flow
  const tokenData = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(tokenData.body.access_token);
}



// * Get Top 50 Artists from Spotify using popular playlist
// can expand to fetch users playlist
async function topArtists() {
  await authenticate();
// https://open.spotify.com/playlist/2YRe7HRKNRvXdJBp9nXFza?si=dvpJpNVTRRmS1znUyHXwCw
const PlaylistId = '2YRe7HRKNRvXdJBp9nXFza'

// spotifyApi.getPlaylistTracks -> retrives the tracks of a specified playlist id
  const top50 = await spotifyApi.getPlaylistTracks(PlaylistId, {limit: 10})
  const artistMap = new Map(); 

// items = [big ah array{...},{...}, ...]
  top50.body.items.forEach(item => {
    // extracting artist for all tracks
    const artistTrackArray = item.track!.artists
    
  //  const artistTrackImagesArray = item.track.artists.images
// add to metadata
    // [... trackCover]

    artistTrackArray.forEach(artist => {

// ***** take a cover photo of the artist 
      if (!artistMap.has(artist.id)) {// artist, album or track -> artist
        artistMap.set(artist.id, {id: artist.id, name: artist.name, artist: artist.href})
      }
    })
  })

  // at this point we have each aritst for the 50 tracks
  // along with artist name, artist id, and a cover photo for the artist
  

  // return a single array with mapped artists
  //extract only the values from artistMap for better readibility
  return Array.from(artistMap.values())
}


//* Map over top artist array of objects by id



//* get top 10 tracks for every artist
async function ArtistTopTracks(artistId: string, country = 'US') {

  // Fetch top tracks
  const response = await spotifyApi.getArtistTopTracks(artistId, country)
  
  return response.body.tracks; // array of track objects
}


//* Get lyrics from Lyrics.ovh
// push result into lyricsData

const LYRICS_API = 'https://api.lyrics.ovh/v1';


//* Save lyrics data to file







// *** fetch lyrics from Lyrics.ovh for each track

async function getLyrics(artist: string, trackName: string): Promise<string | null> {
    try {
      // encodeURIComponent bypasses special chars to be used in an http request
        const encodedArtist = encodeURIComponent(artist);
        const encodedTrackName = encodeURIComponent(trackName)
        const response = await axios.get(`${LYRICS_API}/${encodedArtist}/${encodedTrackName}`)
        return response.data.lyrics; // raw lyrics string
    } catch( error) {
        console.warn(`Lyrics not found for "${trackName}" by ${artist}`)
        return 'Lyrics not availible';
    }
 }




 
 async function main() {
  try {

    // Fetch top tracks from Spotify
    const top50Artist = await topArtists(); // [ {id: artist.id, name: artist.name, artist: artist.href}... ]
  
    //* initializearr ay to hold lyricsData
    const lyricsData = [];

    for (const artist of top50Artist) {
      console.log(`Fetching top tracks for ${artist.name}...`);
      const top10Tracks = await ArtistTopTracks(artist.id);

      // now we loop through every track
      for (const track of top10Tracks ) {
        //  ** get Artist infomration for genre 
  
        // extract artist information
        const artistDataResponse = await spotifyApi.getArtists([artist.id]);

        const SingleArtist = artistDataResponse.body.artists[0];
        const genres = SingleArtist.genres;

        console.log(`Fetching lyrics for ${track.name} by ${artist.name}...`);
        const ArtistLyrics = await getLyrics(artist.name, track.name, )

        if (ArtistLyrics === 'Lyrics not availible') {
          console.log(`Skipping ${track.name} by ${artist.name} LYRICS NOT AVAILABLE`);
          continue;
        }

        const id = track.id;


        lyricsData.push({
          artist: artist.name,
          song: track.name,
          spotifyId: track.id,
          genre: genres.join(', '),
          lyrics: ArtistLyrics
        })
      }
    }

    // save lyrics data to a file
    fs.writeFileSync(`lyrics_dataset`, JSON.stringify(lyricsData, null, 2))

  }catch (error) {
  console.log(`an error has occured in the main function:`, error)
  console.log('HELL YEAHHHH')
  }

 } // end of main function

main();