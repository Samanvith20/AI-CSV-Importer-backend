import { z } from 'zod';
import {
  crmRecordSchema,
  crmResponseSchema,
  skippedRecordSchema,
  crmStatusEnum,
  dataSourceEnum,
} from '../validators/crm.schema.js';

export type CRMRecord = z.infer<typeof crmRecordSchema>;
export type CRMResponse = z.infer<typeof crmResponseSchema>;
export type SkippedRecord = z.infer<typeof skippedRecordSchema>;
export type CRMStatus = z.infer<typeof crmStatusEnum>;
export type DataSource = z.infer<typeof dataSourceEnum>;
