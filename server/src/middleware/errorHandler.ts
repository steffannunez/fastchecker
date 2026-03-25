import type { Request, Response, NextFunction } from 'express';
import { PipelineError } from '../services/pipeline.js';

interface ApiError {
  status: number;
  code: string;
  message: string;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err.message, err.stack);

  let apiError: ApiError;

  if (err instanceof PipelineError) {
    apiError = {
      status: err.statusCode,
      code: err.code,
      message: err.message,
    };
  } else if (err.message?.includes('Could not process image')) {
    apiError = {
      status: 400,
      code: 'image_error',
      message: 'No se pudo procesar la imagen. Asegurate de que sea PNG, JPG o WebP.',
    };
  } else if (err.message?.includes('api_key')) {
    apiError = {
      status: 500,
      code: 'api_key_error',
      message: 'Error de configuracion del servidor. Revisa las variables de entorno.',
    };
  } else if (err.message?.includes('rate_limit') || err.message?.includes('429')) {
    apiError = {
      status: 429,
      code: 'rate_limit',
      message: 'Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.',
    };
  } else {
    apiError = {
      status: 500,
      code: 'internal_error',
      message: 'Error interno del servidor. Intenta nuevamente.',
    };
  }

  res.status(apiError.status).json({
    error: {
      code: apiError.code,
      message: apiError.message,
    },
  });
}
