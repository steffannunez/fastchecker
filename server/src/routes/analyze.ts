import { Router } from 'express';
import multer from 'multer';
import { validateAnalysisRequest } from '../middleware/validateRequest.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { runAnalysis } from '../services/pipeline.js';
import { validateEnv } from '../config/env.js';
import type { AnalysisRequest } from '../../../shared/types.js';

const config = validateEnv();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.MAX_IMAGE_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen no soportado. Usa PNG, JPG o WebP.'));
    }
  },
});

export const analyzeRouter = Router();

analyzeRouter.post(
  '/analyze',
  createRateLimiter(),
  upload.single('image'),
  validateAnalysisRequest,
  async (req, res, next) => {
    try {
      const request: AnalysisRequest = req.body;
      const result = await runAnalysis(request);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);
