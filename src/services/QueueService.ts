/**
 * Responsible for interacting with BullMQ and Redis.
 * Enqueues new processing jobs and fetches job statuses.
 */
export class QueueService {
  public static async enqueueImportJob(importId: string) {
    throw new Error('Not implemented: QueueService.enqueueImportJob');
  }

  public static async getJobStatus(jobId: string) {
    throw new Error('Not implemented: QueueService.getJobStatus');
  }
}
