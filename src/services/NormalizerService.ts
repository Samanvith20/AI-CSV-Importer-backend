/**
 * Responsible for normalizing valid data (e.g., formatting phone numbers,
 * trimming whitespaces, fixing capitalization) after AI extraction.
 */
import { CRMResponse, CRMRecord } from '../types/crm.types.js';

export class NormalizerService {
  /**
   * Normalizes string fields, emails, phones, and dates.
   */
  public static normalize(response: CRMResponse): CRMResponse {
    const normalizedRecords = response.records.map((record: CRMRecord) => {
      const normalized = { ...record };

      // Trim whitespace for all string fields
      for (const [key, value] of Object.entries(normalized)) {
        if (typeof value === 'string') {
          (normalized as any)[key] = value.trim();
        }
      }

      // Email to lowercase
      if (normalized.email) {
        normalized.email = normalized.email.toLowerCase();
      }

      // Remove spaces/dashes from phone numbers
      if (normalized.mobile_without_country_code) {
        normalized.mobile_without_country_code = normalized.mobile_without_country_code.replace(
          /[\s-]/g,
          '',
        );
      }

      if (normalized.country_code) {
        normalized.country_code = normalized.country_code.replace(/[\s-]/g, '');
        if (!normalized.country_code.startsWith('+')) {
          normalized.country_code = '+' + normalized.country_code;
        }
      }

      // Country code to +91 format when applicable (e.g., if mobile starts with 91 and is 12 digits)
      if (
        !normalized.country_code &&
        normalized.mobile_without_country_code.startsWith('91') &&
        normalized.mobile_without_country_code.length === 12
      ) {
        normalized.country_code = '+91';
        normalized.mobile_without_country_code =
          normalized.mobile_without_country_code.substring(2);
      }

      // Normalize dates to ISO strings when possible
      if (normalized.created_at) {
        const date = new Date(normalized.created_at);
        if (!isNaN(date.getTime())) {
          normalized.created_at = date.toISOString();
        }
      }

      return normalized;
    });

    return { records: normalizedRecords, skipped: response.skipped };
  }
}
