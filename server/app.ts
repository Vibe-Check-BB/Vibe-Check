import express, { ErrorRequestHandler } from 'express';
import { Request, Response, NextFunction } from 'express';
import searchRoutes from './routes/searchRoutes';
import cors from 'cors';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', searchRoutes);
app.get('/checkStatus', (_req: Request, res: Response) =>
  res.status(200).send('Server is running!')
);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.log || err.message);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

export default app;
