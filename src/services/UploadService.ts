import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { AppError } from '../middlewares/errorHandler';

export class UploadService {
  /**
   * Reads a few rows from the uploaded CSV to generate the frontend preview.
   * Leverages streams so it never loads the full file into memory.
   */
  public static async generatePreview(filePath: string, originalName: string, size: number) {
    if (!fs.existsSync(filePath)) {
      throw new AppError(400, 'MISSING_FILE', 'No file was uploaded.');
    }

    return new Promise((resolve, reject) => {
      const headers: string[] = [];
      const previewRows: Record<string, string>[] = [];
      let totalRows = 0;

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('headers', (headerList) => {
          headers.push(...headerList);
        })
        .on('data', (data) => {
          totalRows++;
          // Keep only the first 5 rows for the preview
          if (previewRows.length < 5) {
            // Map the parsed JSON object back into a flat array based on headers
           
            previewRows.push(data);
          }
        })
        .on('end', () => {
          // Extract the exact UUID importId by stripping the .csv extension
          const importId = path.parse(filePath).name;
          
          resolve({
            importId,
            originalFileName: originalName,
            size,
            uploadedAt: new Date().toISOString(),
            headers,
            previewRows,
            totalRows
          });
        })
        .on('error', () => {
          reject(new AppError(500, 'CSV_PARSE_ERROR', 'Failed to parse the CSV file.'));
        });
    });
  }
}
