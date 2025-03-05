import React, { use, useState } from 'react';
import './styles.css';

interface Song {
  id: string;
  song: string;
}
interface Response {
  similarSongs: Song[];
}

function App() {
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState<Song[]>([]);

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

  return (
    <div>
      <h1 className="flex m-8 text-3xl justify-center">
        Hi! This is VibeCheck
      </h1>
      <form
        className="flex flex-col text-[18px] content-center"
        onSubmit={handleSubmit}
      >
        <label className="flex flex-col">
          ☀ Today, I want to listen the songs like:
          <input
            className="rounded-2xl border border-transparent my-3 py-5 p-3 text-base font-medium bg-[#1a1a1a] "
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder=" ... Enter song title or topic"
          />
        </label>

        <button
          className="rounded-2xl border border-transparent px-4 py-2 text-base font-medium bg-[#1a1a1a] cursor-pointer transition hover:border-[#ffffff]"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Check Vibe'}
        </button>
      </form>
      {error && <p>{error}</p>}
      <div className="flex text-[16px]">
        {output && (
          <div className="m-4">
            <h2 className="text-[18px]">This is our recommendation:</h2>
            {output.map((song) => (
              <div key={song.id}>
                <p>Id: {song.id}</p>
                <p>score: {song.score}</p>
                <p>artist: {song.artist}</p>
                <p>genre: {song.genre}</p>
                <p>song: {song.song}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
