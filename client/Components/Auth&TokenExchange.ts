const openSpotifyLogin = () => {
    const authUrl = "http://localhost:3000/auth-url"; // Backend route that returns Spotify login URL
    const width = 600, height = 700;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
  
    const popup = window.open(authUrl, "SpotifyAuth", `width=${width},height=${height},top=${top},left=${left}`);
  
    if (!popup) {
      alert("Please allow popups for this site!");
      return;
    }
  
    // Listen for the auth code message from the popup
    window.addEventListener("message", (event) => {
      if (event.origin === window.location.origin && event.data.spotify_auth_code) {
        console.log("Received auth code:", event.data.spotify_auth_code);
  
        // Send code to backend to exchange for access token
        fetch("http://localhost:3000/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: event.data.spotify_auth_code }),
        })
          .then(res => res.json())
          .then(data => {
            console.log("Access Token:", data.accessToken);
            localStorage.setItem("spotify_access_token", data.accessToken);
          })
          .catch(error => console.error("Error exchanging token:", error));
      }
    });
  };
  