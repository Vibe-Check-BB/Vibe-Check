import express from 'express';
import { searchSongs } from '../controllers/searchController.js';
import { getUserId, createPlaylist, addSongsToPlaylist } from '../middleware/createUserPlaylist.ts';
const router = express.Router();


router.post("/create-playlist", searchSongs, async(req, res) => {
    const { accessToken, } = req.body;
    const playlistName = "Vibe Check playlist"
    
    if (!accessToken) return res.status(400).json({ error: " Access token not found in req.body" });
  
    try {
        const userId = await getUserId(accessToken);
        console.log('Spotify User Id:', userId);
        
        
        const playlistId = await createPlaylist(accessToken, userId, playlistName);
        console.log('playlist created id:', playlistId)

        const similarSongs = res.locals.similarSongs;

        console.log('similarSongs:', similarSongs)

        const trackUris = similarSongs.map((song:any ) => `spotify:track:${song.spotifyId}`)

        if (trackUris && trackUris.length > 0) {
            await addSongsToPlaylist(accessToken, playlistId, trackUris);
            console.log('Songs added to Playlist');
        }

        res.json({message: `created playlist with Id:, ${playlistId}`})
        

    } catch (error: any) {
      console.error("Error creating playlist:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to create playlist" });
    }
  });
  
  export default router;
  