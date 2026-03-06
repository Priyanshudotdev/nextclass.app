// Load environment variables FIRST (side-effect import)
import './env';

import express from 'express';
import { errorHandler } from './middlewares/error-handler';
import config from './config/config';
import modulesRouter from './modules/routes';

const app = express();

// Middleware
app.use(express.json());

app.use('/api', modulesRouter);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
