import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { UploadService } from '../services/UploadService';
import { AppError } from '../middlewares/errorHandler';

export class UploadController {
  /**
   * Handles the POST /api/imports/preview endpoint.
   * Receives the parsed file from Multer and passes it to the service.
   */
  public static generatePreview = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError(400, 'MISSING_FILE', 'No file was uploaded. Please attach a valid CSV file.');
    }

    const result = await UploadService.generatePreview(
      req.file.path,
      req.file.originalname,
      req.file.size
    );

    res.status(200).json({
      success: true,
      message: 'CSV uploaded successfully',
      data: result
    });
  });

  /**
   * Handles the POST /api/imports/process endpoint.
   * Tells the backend to take the uploaded CSV and start the BullMQ worker.
   */
  public static startProcessing = asyncHandler(async (req: Request, res: Response) => {
    const { importId } = req.body;

    if (!importId) {
      throw new AppError(400, 'MISSING_IMPORT_ID', 'importId is required in the request body.');
    }

    // TODO: Enqueue the job in BullMQ
    const mockJobId = `job-${Date.now()}`;

    res.status(202).json({
      success: true,
      message: 'Processing started.',
      data: {
        jobId: mockJobId
      }
    });
  });
}
