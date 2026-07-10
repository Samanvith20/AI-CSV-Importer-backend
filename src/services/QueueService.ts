import { importQueue } from '../queues/importQueue.js';

/**
 * Responsible for interacting with BullMQ and Redis.
 * Enqueues new processing jobs and fetches job statuses.
 */
export class QueueService {
  public static async enqueueImportJob(importId: string) {
    const job = await importQueue.add('process-csv', { importId });
    return job;
  }
}
