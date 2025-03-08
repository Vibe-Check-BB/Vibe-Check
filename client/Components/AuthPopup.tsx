import { useEffect } from 'react';
import axios from 'axios';

function SpotifyAuthPopup() {
  useEffect(() => {

    const exchangeToken = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    // ?code=AQB_eDPfptdMiwTk4I9rBm-_3NXVdjJsYIKcOvihvOHHr6yjFBUfAdzMVz_-w-4b7_v2kjnnKcp39AIt-ACLOQdoIDRGP_gWyssbpvVdxs_h3T8TchGsSwUb_dBTE6n-JIL9lCbHqAsUizwFz-q7IIIyoLpnGmzGhC-EB4ghwEsbXfrHXA3SP03cIKgdTC_Fxg&state=ElevatorBabyBoyMusicFunTimes5%21#_=_

    const code = urlParams.get('code');
    // ?code=AQB_eDPfptdMiwTk4I9rBm-_3NXVdjJsYIKcOvihvOHHr6yjFBUfAdzMVz_-w-4b7_v2kjnnKcp39AIt-ACLOQdoIDRGP_gWyssbpvVdxs_h3T8TchGsSwUb_dBTE6n-JIL9lCbHqAsUizwFz-q7IIIyoLpnGmzGhC-EB4ghwEsbXfrHXA3SP03cIKgdTC_Fxg


    // // Extract the access token from the URL hash
    // const hash = window.location.hash.substring(1); // Remove the '#' from the hash
    // const params = new URLSearchParams(hash);
    // const accessToken = params.get('access_token');

    if (code){
      console.log("WE ARE CODESMITH:\n code:", code)
    
    try {
      // Send the authorization code to the backend
      const response = await axios.post('http://localhost:3000/auth/exchange-token', {code})
      const {accessToken} = response.data;

      if (accessToken) {
        console.log('Received Access Token:', accessToken);
      localStorage.setItem('spotify_access_token', accessToken)
        window.close();
      } else {
        console.error('Access token not received');
      }
} catch (error) {
  console.error('Error exchanging token')
}
    } else {
      console.error('Authorization code is missing from the URL');

    }
  }
  exchangeToken();
}, []);

  



    // save token 

  //   // Send the access token to the parent window
  //   if (code) {
  //     window.opener.postMessage(
  //       { spotify_access_token: accessToken },
  //       window.location.origin
  //     );
  //     window.close(); // Close the popup after sending the message
  //   } else {
  //     console.error('Access token not found in URL hash');
  //   }
  // });

  return (
    <div>
      <p>Please wait while we authenticate you with Spotify...</p>
    </div>
  );
}

export default SpotifyAuthPopup;
