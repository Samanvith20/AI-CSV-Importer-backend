import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { asyncHandler } from '../utils/asyncHandler.js';
import { UploadService } from '../services/UploadService.js';
import { QueueService } from '../services/QueueService.js';
import { AppError } from '../middlewares/errorHandler.js';

export class UploadController {
  /**
   * Handles the POST /api/imports/preview endpoint.
   * Receives the parsed file from Multer and passes it to the service.
   */
  public static generatePreview = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError(
        400,
        'MISSING_FILE',
        'No file was uploaded. Please attach a valid CSV file.',
      );
    }

    const result = await UploadService.generatePreview(
      req.file.path,
      req.file.originalname,
      req.file.size,
    );

    res.status(200).json({
      success: true,
      message: 'CSV uploaded successfully',
      data: result,
    });
  });

  /**
   * Handles the POST /api/imports/process endpoint.
   * Tells the backend to take the uploaded CSV and start the BullMQ worker.
   */
  public static startProcessing = asyncHandler(async (req: Request, res: Response) => {
    const { importId, totalRows } = req.body;
    console.log('totalRows', totalRows);

    if (!importId) {
      throw new AppError(400, 'MISSING_IMPORT_ID', 'importId is required in the request body.');
    }

    const filePath = path.join(process.cwd(), 'uploads', 'temp', `${importId}.csv`);
    if (!fs.existsSync(filePath)) {
      throw new AppError(404, 'FILE_NOT_FOUND', 'The uploaded file could not be found.');
    }

    const job = await QueueService.enqueueImportJob(importId, totalRows || 0);

    res.status(202).json({
      success: true,
      message: 'Import job created successfully.',
      data: {
        jobId: job.id,
        status: 'queued',
      },
    });
  });
}
