import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async Express controllers to automatically catch errors and pass them
 * to the global errorHandler middleware, eliminating the need for repetitive 
 * try/catch blocks in every single controller function.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
