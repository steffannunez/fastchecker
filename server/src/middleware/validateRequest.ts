import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { validateEnv } from '../config/env.js';

const analysisSchema = z.object({
  text: z.string().max(10000, 'El texto no puede superar los 10.000 caracteres.').optional(),
  imageBase64: z.string().max(7_000_000, 'La imagen es demasiado grande.').optional(),
  imageMimeType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/gif']).optional(),
}).refine(
  (data) => data.text?.trim() || data.imageBase64,
  { message: 'Debes proporcionar texto o una imagen para analizar.' }
);

export function validateAnalysisRequest(req: Request, res: Response, next: NextFunction): void {
  const config = validateEnv();

  // If multipart (multer processed), build the body
  if (req.file) {
    const imageBuffer = req.file.buffer;
    if (imageBuffer.length > config.MAX_IMAGE_SIZE) {
      res.status(400).json({
        error: {
          code: 'image_too_large',
          message: `La imagen debe pesar menos de ${Math.round(config.MAX_IMAGE_SIZE / 1024 / 1024)}MB.`,
        },
      });
      return;
    }

    req.body = {
      text: req.body?.text,
      imageBase64: imageBuffer.toString('base64'),
      imageMimeType: req.file.mimetype,
    };
  }

  const result = analysisSchema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join('. ');
    res.status(400).json({
      error: {
        code: 'validation_error',
        message,
      },
    });
    return;
  }

  req.body = result.data;
  next();
}
