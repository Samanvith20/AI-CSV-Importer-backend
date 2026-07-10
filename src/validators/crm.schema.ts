import { z } from 'zod';

export const crmStatusEnum = z.enum([
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
]);

export const dataSourceEnum = z.enum([
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
]);

export const crmRecordSchema = z.object({
  created_at: z
    .string()
    .refine((val) => val === '' || !isNaN(Date.parse(val)), {
      message: 'Must be convertible into a valid JavaScript Date',
    })
    .default(''),
  name: z.string().default(''),
  email: z.string().email().or(z.literal('')).default(''),
  country_code: z.string().default(''),
  mobile_without_country_code: z.string().default(''),
  company: z.string().default(''),
  city: z.string().default(''),
  state: z.string().default(''),
  country: z.string().default(''),
  lead_owner: z.string().default(''),
  crm_status: z.union([crmStatusEnum, z.literal('')]).default(''),
  crm_note: z.string().default(''),
  data_source: z.union([dataSourceEnum, z.literal('')]).default(''),
  possession_time: z.string().default(''),
  description: z.string().default(''),
});

export const skippedRecordSchema = z.object({
  reason: z.string(),
  row: z.any(),
});

export const crmResponseSchema = z.object({
  records: z.array(crmRecordSchema),
  skipped: z.array(skippedRecordSchema),
});
