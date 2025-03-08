import { Request, Response, NextFunction } from 'express';
import express from "express";
import dotenv from "dotenv";
import { getuserAuthUrl, exchangeCodeForToken } from '../middleware/createUserPlaylist.ts';
dotenv.config();
const router = express.Router();


router.get('/auth-url', ( _req: Request, res: Response,)=> {
  try {
      const authUrl = getuserAuthUrl()

  res.json({authUrl})
  } catch( error) {
    res.status(500).json({error: 'Failed to generate auth URL'})
  }
})




router.post('/exchange-token', async (req: Request, res: Response) => {
  const { code } = req.body; // Get the authorization code from the request body
  
  if (!code) return res.status(400).json({ error: 'Authorization code is required' });

  try {
   const tokenExchange = await exchangeCodeForToken(code)
   res.json({"AccessToken: ":   tokenExchange.accessToken, "RefreshToken": tokenExchange.refreshToken, tokenExchange })
    
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).json({ error: 'Failed to exchange code for token' });
  }
});

export default router;