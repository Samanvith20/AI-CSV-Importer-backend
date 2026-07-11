import fs from 'fs';
import csvParser from 'csv-parser';

export class CsvReaderService {
  /**
   * Fast pass to count total rows in the CSV file
   */
  public static async countRows(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let count = 0;
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', () => count++)
        .on('end', () => resolve(count))
        .on('error', reject);
    });
  }
  /**
   * Reads a CSV file using streams, batches rows, and calls the provided callback for each batch.
   * This is memory efficient and avoids loading the entire file at once.
   */
  public static async processInBatches(
    filePath: string,
    batchSize: number,
    onBatch: (batch: any[], batchIndex: number) => Promise<void>,
  ): Promise<{ totalRows: number; totalBatches: number }> {
    return new Promise((resolve, reject) => {
      let currentBatch: any[] = [];
      let totalRows = 0;
      let totalBatches = 0;
      let streamPaused = false;

      const stream = fs.createReadStream(filePath).pipe(csvParser());

      const processCurrentBatch = async () => {
        if (currentBatch.length === 0) return;

        totalBatches++;
        const batchToProcess = [...currentBatch];
        currentBatch = [];

        await onBatch(batchToProcess, totalBatches);
      };

      stream.on('data', async (data) => {
        totalRows++;
        currentBatch.push(data);

        if (currentBatch.length >= batchSize) {
          stream.pause();
          streamPaused = true;

          try {
            await processCurrentBatch();
            streamPaused = false;
            stream.resume();
          } catch (error) {
            stream.destroy(error as Error);
            reject(error);
          }
        }
      });

      stream.on('end', async () => {
        try {
          if (!streamPaused) {
            await processCurrentBatch();
            resolve({ totalRows, totalBatches });
          } else {
            // If paused, wait for it to resume and finish the last batch if any (though logic above handles it immediately)
            // It's safer to just process whatever is left directly here because end is called after data stream finishes emitting.
            await processCurrentBatch();
            resolve({ totalRows, totalBatches });
          }
        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }
}
