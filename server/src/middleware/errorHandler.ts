import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle explicit business logic errors
  if (err.message && (
    err.message.includes('not found') ||
    err.message.includes('Cannot approve') ||
    err.message.includes('Cannot reject') ||
    err.message.includes('conflict') ||
    err.message.includes('outside doctor') ||
    err.message.includes('break') ||
    err.message.includes('scheduled')
  )) {
    res.status(400).json({ error: err.message });
    return;
  }

  // Unexpected errors: Log safely and respond with generic error
  console.error('[Internal Server Error]', err);
  res.status(500).json({
    error: 'An unexpected internal server error occurred. Please try again later.',
  });
}
