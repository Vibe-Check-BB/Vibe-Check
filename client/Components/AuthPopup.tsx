import { useEffect } from 'react';

function SpotifyAuthPopup() {
  useEffect(() => {
    // Extract the access token from the URL hash
    const hash = window.location.hash.substring(1); // Remove the '#' from the hash
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    // Send the access token to the parent window
    if (accessToken) {
      window.opener.postMessage(
        { spotify_access_token: accessToken },
        window.location.origin
      );
      window.close(); // Close the popup after sending the message
    } else {
      console.error('Access token not found in URL hash');
    }
  }, []);

  return (
    <div>
      <p>Please wait while we authenticate you with Spotify...</p>
    </div>
  );
}

export default SpotifyAuthPopup;
