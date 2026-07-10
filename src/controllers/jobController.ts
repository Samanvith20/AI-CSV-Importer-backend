import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';

export class JobController {
  /**
   * Endpoint: GET /api/jobs/:jobId
   * Checks the progress of the BullMQ worker.
   */
  public static getJobStatus = asyncHandler(async (req: Request, res: Response) => {
    const jobId = req.params.jobId as string;
    const { importQueue } = await import('../queues/importQueue.js');

    const job = await importQueue.getJob(jobId);
    if (!job) {
      res.status(404).json({ status: 'failed', error: 'Job not found' });
      return;
    }

    const state = await job.getState();

    if (state === 'failed') {
      res.status(200).json({
        status: 'failed',
        error: job.failedReason,
      });
      return;
    }

    const progressData: any = job.progress || {};

    res.status(200).json({
      status: state,
      progress: progressData.percent || 0,
      processedRows: progressData.processedRows || 0,
      totalRows: progressData.totalRows || 'Calculating...',
    });
  });

  /**
   * Endpoint: GET /api/jobs/:jobId/result
   * Fetches the final standardized CRM records from Redis.
   */
  public static getJobResult = asyncHandler(async (req: Request, res: Response) => {
    const jobId = req.params.jobId as string;
    const { redisConnection } = await import('../config/redis.js');

    const resultString = await redisConnection.get(`job-result:${jobId}`);
    if (!resultString) {
      res.status(404).json({ status: 'failed', error: 'Result not found or expired' });
      return;
    }

    res.status(200).json(JSON.parse(resultString));
  });
}
