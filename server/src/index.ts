import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { analyzeRouter } from './routes/analyze.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateEnv } from './config/env.js';

const config = validateEnv();

const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  methods: ['GET', 'POST'],
}));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', analyzeRouter);

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`[FastChecker] Servidor corriendo en http://localhost:${config.PORT}`);
});

export default app;
