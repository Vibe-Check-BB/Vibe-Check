/*
Authenticating with Spotify.
Fetching user playlists.
Parsing and formatting playlist data for further processing.
*/
import SpotifyWebApi from 'spotify-web-api-node';
// import dotenv from 'dotenv';
// dotenv.config();

const spotifyApi = new SpotifyWebApi({
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://localhost:5173',
});

export function authPopup() {
  const state = 'ElevatorBabyBoyMusicFunTimes5!';
  const scopes = ['playlist-modify-public'];
  const userAuthUrl = spotifyApi.createAuthorizeURL(scopes, state);

  const popup = window.open(
    userAuthUrl,
    'SpotifyAuth',
    'width=700, height=700'
  );

  if (!popup) {
    console.error('Popup window blocked!')
  }
  // Listen for auth popup
  const handleMessage = (event: MessageEvent) => {
    if (event.data.spotify_access_token) {
      localStorage.setItem(
        'spotify_access_token',
        event.data.spotify_access_token
      );
      // Ensure that app recognize the user is now logged in
      window.location.reload();
    }
  };
  window.addEventListener('message', handleMessage, false);
}

// ! replace as long as we get function in createUserPlaylist working
export async function generatePlaylist(
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch(
      'https://open.spotify.com/playlist/1PMR5lyQYswsc9MHU7dwm9',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ name: 'Playlist', public: true }),
      }
    );
    if (!response.ok) throw new Error('Failed to create playlist');
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating playlist:', error);
    return null;
  }
}
