/**
 * Responsible for checking the newly normalized records against each other
 * to flag duplicates before finalizing the batch.
 */
import { CRMResponse, CRMRecord } from '../types/crm.types.js';

export type ProcessedCRMRecord = CRMRecord & {
  duplicate?: boolean;
  duplicateReason?: 'email' | 'mobile' | 'email+mobile';
};

export interface ProcessedCRMResponse extends Omit<CRMResponse, 'records'> {
  records: ProcessedCRMRecord[];
}

export class DuplicateDetectorService {
  /**
   * Detects duplicates by email, mobile, or both.
   * Does NOT remove duplicates. Adds duplicate flags.
   */
  public static detect(response: CRMResponse): ProcessedCRMResponse {
    const seenEmails = new Set<string>();
    const seenMobiles = new Set<string>();

    const processedRecords = response.records.map((record: CRMRecord) => {
      const processed: ProcessedCRMRecord = { ...record };

      const hasEmail = record.email && record.email !== '';
      const hasMobile =
        record.mobile_without_country_code && record.mobile_without_country_code !== '';

      let isDuplicate = false;
      let duplicateReason: 'email' | 'mobile' | 'email+mobile' | undefined;

      if (
        hasEmail &&
        hasMobile &&
        seenEmails.has(record.email) &&
        seenMobiles.has(record.mobile_without_country_code)
      ) {
        isDuplicate = true;
        duplicateReason = 'email+mobile';
      } else if (hasEmail && seenEmails.has(record.email)) {
        isDuplicate = true;
        duplicateReason = 'email';
      } else if (hasMobile && seenMobiles.has(record.mobile_without_country_code)) {
        isDuplicate = true;
        duplicateReason = 'mobile';
      }

      if (isDuplicate) {
        processed.duplicate = true;
        processed.duplicateReason = duplicateReason;
      } else {
        if (hasEmail) seenEmails.add(record.email);
        if (hasMobile) seenMobiles.add(record.mobile_without_country_code);
      }

      return processed;
    });

    return { records: processedRecords, skipped: response.skipped };
  }
}
