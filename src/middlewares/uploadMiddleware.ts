import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AppError } from './errorHandler.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'temp');

// Ensure directory exists automatically as requested
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Generate a strict UUID for the importId
    const importId = crypto.randomUUID();
    // Rename the file to <importId>.csv
    cb(null, `${importId}.csv`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new AppError(400, 'INVALID_FILE_TYPE', 'Only CSV files are allowed.'));
    }
  },
});
