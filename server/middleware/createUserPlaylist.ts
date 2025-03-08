import SpotifyWebApi from 'spotify-web-api-node';
import dotenv from 'dotenv';
import axios from 'axios'

dotenv.config();

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.VITE_SPOTIFY_CLIENT_ID,
  clientSecret: process.env.VITE_SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.VITE_SPOTIFY_REDIRECT_URI,
});

// method to get the user authorization URL
export function getuserAuthUrl(): string {
  const state = 'ElevatorBabyBoyMusicFunTimes5!';
  const scopes = ['playlist-modify-public'];

  const redirectUri = process.env.VITE_SPOTIFY_REDIRECT_URI;
 //  console.log("Redirect URI: ", redirectUri); 


  if (!redirectUri) {
    throw new Error("Redirect URI is not defined.");
  }

  spotifyApi.setRedirectURI(redirectUri);
  return spotifyApi.createAuthorizeURL(scopes, state);
}


// exchange the authorization code for an access token
export const exchangeCodeForToken = async (code:string) => {
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body.access_token;
    const refreshToken = data.body.refresh_token;

   // maybe use session
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw new Error('Failed to exchange code for token');
  }
};




// get user data
export const getUserId = async (accessToken: string): Promise<string> => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data.id;
  } catch (error) {
    console.error('Error fetching Spotify data:', error);
    throw new Error('Failed to fetch user data');
  }
};









// const refreshToken = localStorage.getItem('spotifyRefreshToken');

// if (refreshToken) {
//   axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
//     grant_type: 'refresh_token',
//     refresh_token: refreshToken,
//   }), {
//     headers: {
//       'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
//     },
//   })
//     .then((response) => {
//       const { access_token, refresh_token } = response.data;
//       localStorage.setItem('spotifyAccessToken', access_token);
//       localStorage.setItem('spotifyRefreshToken', refresh_token);
//       console.log('Token refreshed!');
//     })
//     .catch((error) => {
//       console.error('Error refreshing access token:', error);
//     });
// } else {
//   console.log('No refresh token found.');
// }





export const createPlaylist = async (accessToken: string, userId: string, playlistName: string): Promise<string> => {
  try {
    const response = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      { name: playlistName, public: true,},
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },}
    );
    return response.data.id;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw new Error('Failed to create playlist');
  }
};


export const addSongsToPlaylist = async (accessToken: string, playlistId: string, trackUris: string[]) => {
  try {
    
    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      { uris: trackUris },
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );
   
  } catch (error) {
    console.error('Error adding songs to playlist:', error);
    throw new Error('Failed to add songs to playlist');
  }
}






// let cachedAccessToken: string | null = null;

// async function authenticateUser(authCode: string, returnedState: string, expectedState: string): Promise<string> {
//   if (returnedState !== expectedState) {
//     throw new Error('STATE MISMATCH');
//   }

//   const data = await spotifyApi.authorizationCodeGrant(authCode);
//   cachedAccessToken = data.body.access_token;
//   spotifyApi.setAccessToken(data.body.access_token);
//   spotifyApi.setRefreshToken(data.body.refresh_token);

//   return cachedAccessToken;
// }

// async function createUserPlaylist(trackIds: string[]): Promise<string> {
//   if (!cachedAccessToken) {
//     throw new Error('User not authenticated.');
//   }

//   spotifyApi.setAccessToken(cachedAccessToken);
//   const userData = await spotifyApi.getMe();
//   const userId = userData.body.id;

//   // Correct usage of PlaylistDetailsOptions
//   const playlistOptions = {
//     name: 'Vibe check playlist',
//     public: true,                // playlist visibility (can be `true` or `false`)
//     description: 'A playlist for good vibes.' // optional description
//   };

//   const playlist = await spotifyApi.createPlaylist(userId, playlistOptions);
//   const playlistId = playlist.body.id;
//   await spotifyApi.addTracksToPlaylist(playlistId, trackIds);

//   return playlistId;
// }
