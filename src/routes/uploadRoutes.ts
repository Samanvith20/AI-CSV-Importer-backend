import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';

const router = Router();

// Route: POST /api/imports/preview
// 1. Multer intercepts and saves the file.
// 2. The controller passes it to the service.
router.post('/preview', uploadMiddleware.single('file'), UploadController.generatePreview);

// Route: POST /api/imports/process
// Starts the background worker for the given importId.
router.post('/process', UploadController.startProcessing);

export default router;
