import React, { useState } from 'react';
import './styles.css';

import { useAuth } from './Components/AuthContext';
import { authPopup, generatePlaylist } from '../server/services/spotifyService';

interface Song {
  id: string;
  song: string;
  spotifyId: string;
}
interface Response {
  similarSongs: Song[];
}

function App() {
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState<Song[]>([]);

  const { accessToken } = useAuth();
  const [playlistId, setPlaylistId] = useState<string | null>(null);

  // * Handling song search
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutput([]);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery }),
      });
      const responseData = await response.json();

      if (response.status !== 200) {
        const parsedError: { err: string } = responseData;
        setError(parsedError.err);
      } else {
        const parsedResponse: Response = responseData;
        // Make sure parsed response is array for mapping
        if (
          parsedResponse.similarSongs &&
          Array.isArray(parsedResponse.similarSongs)
        ) {
          setOutput(parsedResponse.similarSongs);
        } else {
          setError('similar songs are not found');
        }
      }
    } catch (err) {
      setError('Error fetching the song');
    } finally {
      setLoading(false);
    }
  };

  // * Handling playlist generated
  const handlePlaylist = async () => {
    if (!accessToken) {
      authPopup();
      return;
    }
    if (output.length === 0) {
      setError(
        'Please search for songs before generating your playlist. Try again.'
      );
      return;
    }
    setLoading(true);

    try {
      console.log(accessToken);
      const playlistId = await generatePlaylist(accessToken);
      if (playlistId) setPlaylistId(playlistId);
    } catch (err) {
      setError('Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="flex m-8 text-3xl justify-center">
        Hi! Welcome to VibeCheck
      </h1>
      <form
        className="flex flex-col text-[18px] content-center"
        onSubmit={handleSubmit}
      >
        <label className="flex flex-col">
          💚 Today, I want to listen the songs like:
          <input
            className="rounded-2xl border border-transparent my-3 py-5 p-3 text-base font-medium bg-[#1a1a1a] "
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder=" ... Enter song title or topic"
          />
        </label>

        <div className="grid grid-cols-2 gap-4 ">
          <button
            className="rounded-2xl border border-transparent px-4 py-2 text-base font-medium bg-[#1a1a1a] cursor-pointer transition hover:border-[#ffffff]"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Check Vibe'}
          </button>

          <button
            onClick={handlePlaylist}
            className="rounded-2xl border border-transparent px-4 py-2 text-base font-medium bg-[#1a1a1a] cursor-pointer transition hover:border-[#ffffff]"
          >
            {accessToken
              ? 'Generate Spotify Playlist'
              : 'Login for Playlist Generation'}
          </button>
        </div>
      </form>
      {error && <p>{error}</p>}

      {/* similarSongs */}
      <div className="flex text-[16px]">
        {output && (
          <div className="m-4">
            <h2 className='font-bold'>We have these songs for you:</h2>
            <ul className='list-disc pl-4'>
              {output.map((song) => (
                <li key={song.id} className='py-1'>
                  {/* {i + 1}. {' '} */}
                  {/* open songUrl in new tab */}
                  <a
                    href={`https://open.spotify.com/track/${song.spotifyId}`}
                    target="_blank"
                    className="hover:text-blue-500 hover:underline"
                  >
                    {song.song}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* embed playlist */}
      {playlistId && (
        <div>
          <h2>We have playlist generated for you:</h2>
          {/* <iframe>
            src={`https://open.spotify.com/embed/playlist/${playlistId}`}
            width="100%" height="380" allow="encrypted-media"
          </iframe> */}
          <iframe
            // style="border-radius:12px"
            src="https://open.spotify.com/embed/playlist/0UOhs79xM3Nv87XYUz9l4l?utm_source=generator"
            width="100%"
            height="352"
            frameBorder="0"
            allowfullscreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>
      )}
    </div>
  );
}

export default App;
