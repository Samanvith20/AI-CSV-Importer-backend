/**
 * Responsible for chunking large arrays of CSV rows into optimal batch sizes
 * (e.g., 25 rows per batch) before sending them to the AI Service.
 */
export class BatchBuilderService {
  public static createBatches(rows: any[], _batchSize: number = 25) {
    throw new Error('Not implemented: BatchBuilderService.createBatches');
  }
}
