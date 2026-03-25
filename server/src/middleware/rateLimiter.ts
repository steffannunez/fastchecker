import rateLimit from 'express-rate-limit';
import { validateEnv } from '../config/env.js';

export function createRateLimiter() {
  const config = validateEnv();

  return rateLimit({
    windowMs: 60 * 1000,
    max: config.RATE_LIMIT_RPM,
    message: {
      error: {
        code: 'rate_limit',
        message: 'Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}
