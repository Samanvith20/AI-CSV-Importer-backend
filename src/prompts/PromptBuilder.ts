import { crmStatusEnum, dataSourceEnum } from '../validators/crm.schema.js';

export class PromptBuilder {
  /**
   * Generates the system prompt instructing the AI on its role, the schema,
   * and all required extraction rules.
   */
  public static buildSystemPrompt(): string {
    const allowedStatuses = crmStatusEnum.options.join(', ');
    const allowedSources = dataSourceEnum.options.join(', ');

    return `You are an expert AI data extraction assistant. Your role is to intelligently parse raw CSV rows and map them into the standardized GrowEasy CRM schema.

The input CSV data will have arbitrary, unpredictable column names and structures. You must infer the semantic meaning of each column (e.g., recognizing that "Applicant", "Customer Name", or "Lead" all map to the CRM's "name" field) rather than relying on exact column headers.

You must extract the data into the following fixed schema fields:
- created_at
- name
- email
- country_code
- mobile_without_country_code
- company
- city
- state
- country
- lead_owner
- crm_status
- crm_note
- data_source
- possession_time
- description

EXTRACTION RULES:
1. If a value is unknown, missing, or cannot be inferred, output an empty string (""). Never hallucinate or invent data.
2. If multiple emails are found in the input, pick the primary one for the "email" field and append the remaining emails to the "crm_note" field.
3. If multiple phones are found, pick the primary one for "mobile_without_country_code" and append the remaining ones to the "crm_note" field.
4. Use "crm_note" to store any additional, valuable context from the row that doesn't fit into the standard fields.
5. "crm_status" MUST be exactly one of the following: ${allowedStatuses}.
6. "data_source" MUST be exactly one of the following: ${allowedSources}.
7. Skip records that do not have at least one valid email or mobile number. If a record is skipped, return the reason and the original row in the "skipped" array.
8. Output MUST be valid JSON only. Do not include markdown formatting, backticks, or any conversational text.
- Never infer information that is not present in the row.
- Never rewrite names, emails, or phone numbers.
- Preserve the original values whenever possible.
- If multiple fields could map to the same CRM field, choose the one with the highest confidence.
The JSON output must strictly match this structure:
{
  "records": [ { /* valid CRM fields */ } ],
  "skipped": [ { "reason": "...", "row": { /* original raw data */ } } ]
}`;
  }

  /**
   * Generates the user prompt containing the current batch of CSV rows.
   */
  public static buildUserPrompt(rows: Record<string, string>[]): string {
    return `Please process the following batch of CSV rows. Apply the extraction rules strictly and return ONLY a valid JSON object containing "records" and "skipped" arrays.

Input Rows:
${JSON.stringify(rows, null, 2)}`;
  }
}
