import express from 'express';
import { Request, Response, NextFunction } from 'express';
import searchRoutes from './routes/searchRoutes.js';

import authRoutes from './routes/auth.ts';
import playlistRoutes from './routes/playlist.ts';


import cors from 'cors';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/checkStatus', (_req: Request, res: Response) =>
  res.status(200).send('Server is running!')
);

app.use('/api', searchRoutes);


app.use('/auth', authRoutes);
app.use('/playlist', playlistRoutes);



app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.log || err.message);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

export default app;
