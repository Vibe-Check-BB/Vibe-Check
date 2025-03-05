import express, {ErrorRequestHandler} from 'express';
import { Request, Response, NextFunction } from 'express';
import searchRoutes from './routes/searchRoutes.js';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/checkStatus', (_req: Request, res: Response) =>
  res.status(200).send('Server is running!')
);

app.use('/api', searchRoutes);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.log || err.message);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

export default app;
