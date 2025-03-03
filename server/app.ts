import express, { ErrorRequestHandler } from 'express';
import { Request, Response, NextFunction } from 'express';
import { ServerError } from '../types/types.ts';
import searchRoutes from './routes/searchRoutes.ts';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', searchRoutes);

app.get('/checkStatus', (_req: Request, res: Response) =>
  res.status(200).send('Server is running!')
);

app.use((req, res) =>
  res
    .status(404)
    .send('This is not the page you\re looking for, please try another route')
);

const errorHandler: ErrorRequestHandler = (
  err: ServerError,
  _req,
  res,
  _next
) => {
  const defaultErr: ServerError = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj: ServerError = { ...defaultErr, ...err };
  console.log(errorObj.log);
  res.status(errorObj.status).json(errorObj.message);
};

app.use(errorHandler);
// app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
//   console.error('Error:', err.log || err.message);
//   res
//     .status(err.status || 500)
//     .json({ error: err.message || 'Internal Server Error' });
// });


export default app;
