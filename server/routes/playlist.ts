import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { getUserId, createPlaylist, addSongsToPlaylist } from '../middleware/createUserPlaylist.ts';
const router = express.Router();


router.post("/create-playlist", async (req, res) => {
    const { accessToken, playlistName, trackUris } = req.body;
    
    if (!accessToken) return res.status(400).json({ error: " Access token not found in req.body" });
  
    try {
        const userId = await getUserId(accessToken);
        console.log('Spotify User Id:', userId);
        
        
        const playlistId = await createPlaylist(accessToken, userId, playlistName);
        console.log('playlist created id:', playlistId)

        if (trackUris && trackUris.length > 0) {
            await addSongsToPlaylist(accessToken, playlistId, trackUris);
            console.log('Songs added to Playlist');
        }

        res.json({message: `created playlist Id:, ${playlistId}`})
        

    } catch (error: any) {
      console.error("Error creating playlist:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to create playlist" });
    }
  });
  
  export default router;
  