import React, { use, useState } from 'react'
import './App.css'

interface Response {
  vibe: string;
}

function App() {
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutput('');

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery }), 
      })
      if (response.status !== 200) {
        const parsedError: { err: string } = await response.json();
        setError(parsedError.err);
      } else {
        const parsedResponse: Response = await response.json();
        setOutput(parsedResponse.vibe);
      }
    } catch(err) {
      setError('Error fetching the song');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>VIBE CHECK</h1>
      <form onSubmit={handleSubmit}>
        <label>
          I want to listen the songs like:
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Enter song title or topic"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Check Vibe'}
        </button>
      </form>
      {error && <p>{error}</p>}
      {output && (
        <div>
          <h2>Check your vibe:</h2>
          <p>{output}</p>
        </div>
      )}
    </div>
  );
}

export default App
