import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Security Middleware
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors());

// Response Compression
app.use(compression());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import uploadRoutes from './routes/uploadRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'LeadFlow AI Backend Running' });
});

// API Routes
app.use('/api/imports', uploadRoutes);
app.use('/api/jobs', jobRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'LeadFlow AI Backend is healthy' });
});

// 404 Handler (Catch-all for undefined routes - MUST be at the bottom)
app.use((_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global Error Handler (MUST be the absolute last middleware)
app.use(errorHandler);

export default app;
