import { Request, Response, NextFunction } from 'express';

// A custom error class so we can easily throw structured errors from anywhere
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
  }
}

// The centralized global error handler
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. If it's a known, operational error (like a 400 we threw manually)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || null,
      },
    });
    return;
  }

  // 2. Handle native Express/Multer payload size errors (413)
  if (err.type === 'entity.too.large' || err.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'The uploaded file is too large.',
        details: null,
      },
    });
    return;
  }

  // 3. Fallback for unhandled, fatal errors (500)
  console.error('🔥 [Unhandled Server Error]:', err);
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred while processing your request.',
      details: null,
    },
  });
};
