import { useState } from 'react';

interface Song {
  spotifyId: string;
  song: string;
}

interface CreatePlaylistButtonProps {
  songs: Song[];
  onPlaylistCreated: (playlistId: string) => void;
}

export const CreatePlaylistButton = ({
  songs,
  onPlaylistCreated,
}: CreatePlaylistButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePlaylist = async () => {
    setLoading(true);
    setError(null);

    try {
      const authUrlResponse = await fetch(
        'http://localhost:3000/auth/auth-url'
      );
      const { authUrl } = await authUrlResponse.json();
      console.log('authUrl', authUrl);

      // Spotify auth window
    //   const authWindow = window.open(authUrl, '_blank', 'width=600,height=800');

      // Listen for redirect with code
      window.addEventListener('message', async (event) => {
        if (event.data.type === 'SPOTIFY_CALLBACK') {
          const code = event.data.code;

          // Exchange code for token
          const tokenResponse = await fetch(
            'http://localhost:3000/auth/exchange-token',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code }),
            }
          );
          const { accessToken } = await tokenResponse.json();

          // Create playlist with songs
          const trackUris = songs.map(
            (song) => `spotify:track:${song.spotifyId}`
          );

          const playlistResponse = await fetch(
            'http://localhost:3000/playlist/create-playlist',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                accessToken,
                playlistName: 'My Vibe Check Playlist',
                trackUris, // Pass the track URIs to add to playlist
              }),
            }
          );

          const { playlistId } = await playlistResponse.json();

          if (playlistId) {
            onPlaylistCreated(playlistId);
            console.log(
              'Created playlist with songs:',
              songs.map((s) => s.song).join(', ')
            );
          } else {
            throw new Error('No playlist ID returned');
          }
        }
      });
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create playlist'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCreatePlaylist}
        disabled={loading}
        className="rounded-2xl border border-transparent px-4 py-2 text-base font-medium bg-[#1a1a1a] cursor-pointer transition hover:border-[#ffffff]"
      >
        {loading ? 'Creating Playlist...' : 'Create Spotify Playlist'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};
