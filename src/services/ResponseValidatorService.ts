/**
 * Responsible for validating the raw JSON string returned by Gemini
 * against our strict Zod CRM schema.
 */
import { CRMRecord, CRMResponse, SkippedRecord } from '../types/crm.types.js';
import { crmRecordSchema } from '../validators/crm.schema.js';

export class ResponseValidatorService {
  /**
   * Validates records using the Zod CRM schema.
   * Separates valid and invalid records.
   * Invalid records are moved into skipped with a reason.
   */
  public static validate(response: any): CRMResponse {
    const validRecords: CRMRecord[] = [];
    const skippedRecords: SkippedRecord[] = response.skipped || [];

    for (const record of response.records || []) {
      const result = crmRecordSchema.safeParse(record);
      if (result.success) {
        validRecords.push(result.data);
      } else {
        skippedRecords.push({
          reason: `Validation failed: ${result.error.message}`,
          row: record,
        });
      }
    }

    return { records: validRecords, skipped: skippedRecords };
  }
}
