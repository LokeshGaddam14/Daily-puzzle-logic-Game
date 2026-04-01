import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ status: 'error', message: err.message });
    return;
  }

  // Prisma known errors
  if (err.message.includes('Unique constraint')) {
    res.status(409).json({ status: 'error', message: 'Resource already exists' });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
