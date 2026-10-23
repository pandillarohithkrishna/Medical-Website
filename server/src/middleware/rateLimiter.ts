import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export function createRateLimiter(options: { windowMs: number; max: number; message?: string }) {
  const store: RateLimitStore = {};

  // Periodically clean up expired records
  setInterval(() => {
    const now = Date.now();
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    }
  }, options.windowMs).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[ip] || store[ip].resetTime < now) {
      store[ip] = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      next();
      return;
    }

    store[ip].count += 1;

    if (store[ip].count > options.max) {
      res.status(429).json({
        error: options.message || 'Too many requests. Please slow down and try again later.',
        retryAfterSeconds: Math.ceil((store[ip].resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
}
