/**
 * Responsible for aggregating the processed batches, compiling statistics,
 * and fetching the final JSON result structure from Redis.
 */
import { ProcessedCRMResponse } from './DuplicateDetectorService.js';

export class ResultBuilderService {
  /**
   * Builds the final output payload containing statistics.
   */
  public static build(response: ProcessedCRMResponse, totalRowsProcessedInBatch: number) {
    const duplicates = response.records.filter((r: any) => r.duplicate).length;

    return {
      records: response.records,
      skipped: response.skipped,
      statistics: {
        totalRows: totalRowsProcessedInBatch,
        processed: response.records.length,
        skipped: response.skipped.length,
        duplicates,
      },
    };
  }
}
