import { Worker, Job } from 'bullmq';
import fs from 'fs';
import path from 'path';
import { IMPORT_QUEUE_NAME } from '../queues/importQueue.js';
import { redisConnection } from '../config/redis.js';
import { CsvReaderService } from '../services/CsvReaderService.js';
import { AiService } from '../services/AiService.js';
import { ResponseParserService } from '../services/ResponseParserService.js';
import { ResponseValidatorService } from '../services/ResponseValidatorService.js';
import { NormalizerService } from '../services/NormalizerService.js';
import { DuplicateDetectorService } from '../services/DuplicateDetectorService.js';
import { ResultBuilderService } from '../services/ResultBuilderService.js';

const worker = new Worker(
  IMPORT_QUEUE_NAME,
  async (job: Job) => {
    const { importId } = job.data;
    console.log(`Processing importId: ${importId}`);

    const filePath = path.join(process.cwd(), 'uploads', 'temp', `${importId}.csv`);

    // Explicitly count total rows to guarantee precise progress tracking
    const totalRows = job.data.totalRows || (await CsvReaderService.countRows(filePath));
    console.log(`Total Rows for importId ${importId}: ${totalRows}`);
    const batchSize = 25;

    let totalImportProcessed = 0;
    let totalImportSkipped = 0;
    let totalImportDuplicates = 0;

    let processedRows = 0;

    const finalRecords: any[] = [];
    const finalSkipped: any[] = [];

    const { totalBatches } = await CsvReaderService.processInBatches(
      filePath,
      batchSize,
      async (batch, batchIndex) => {
        console.log('--------------------------------');
        console.log(`Batch Number: ${batchIndex}`);
        console.log(`Rows: ${batch.length}`);

        try {
          let parsed: any;

          // Retry mechanism for AI mapping and JSON parsing (handles network errors & hallucinations)
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              const aiResponse = await AiService.mapToCrmSchema(batch);
              parsed = ResponseParserService.parse(aiResponse);
              break; // Success, break out of retry loop
            } catch (err) {
              if (attempt === 3) throw err;
              console.warn(
                `Batch ${batchIndex} failed (attempt ${attempt}/3): ${(err as Error).message}. Retrying in ${2000 * attempt}ms...`,
              );
              await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
            }
          }

          const validated = ResponseValidatorService.validate(parsed);
          const normalized = NormalizerService.normalize(validated);
          const deduped = DuplicateDetectorService.detect(normalized);
          const result = ResultBuilderService.build(deduped, batch.length);

          totalImportProcessed += result.statistics.processed;
          totalImportSkipped += result.statistics.skipped;
          totalImportDuplicates += result.statistics.duplicates;

          finalRecords.push(...result.records);
          finalSkipped.push(...result.skipped);

          processedRows += batch.length;
          const percent = totalRows ? Math.round((processedRows / totalRows) * 100) : 0;

          await job.updateProgress({
            percent,
            processedRows,
            totalRows,
          });

          console.log('Batch Statistics:');
          console.log(`  Processed: ${result.statistics.processed}`);
          console.log(`  Skipped: ${result.statistics.skipped}`);
          console.log(`  Duplicates: ${result.statistics.duplicates}`);
        } catch (error) {
          console.error(`Error processing batch ${batchIndex}:`, (error as Error).message);
          throw error; // Let BullMQ catch this and fail the job
        }

        console.log('--------------------------------');
      },
    );

    console.log('--------------------------------');
    console.log('Import Summary\n');
    console.log(`Total Rows: ${totalRows}\n`);
    console.log(`Total Batches: ${totalBatches}`);
    console.log(`Processed: ${totalImportProcessed}`);
    console.log(`Skipped: ${totalImportSkipped}`);
    console.log(`Duplicates: ${totalImportDuplicates}`);
    console.log('--------------------------------');

    const finalResult = {
      records: finalRecords,
      skipped: finalSkipped,
      statistics: {
        totalRows,
        processed: totalImportProcessed,
        skipped: totalImportSkipped,
        duplicates: totalImportDuplicates,
      },
    };

    await redisConnection.set(`job-result:${job.id}`, JSON.stringify(finalResult), 'EX', 86400);
    await job.updateProgress({
      percent: 100,
      processedRows: totalImportProcessed + totalImportSkipped,
      totalRows: totalRows,
    });

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error('Failed to delete temp file:', e);
    }
  },
  {
    connection: redisConnection,
  },
);

worker.on('ready', () => {
  console.log('Worker is ready and listening for jobs...');
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
});
