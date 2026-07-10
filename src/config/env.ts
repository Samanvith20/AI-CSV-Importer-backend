import dotenv from 'dotenv';
import { z } from 'zod';

// 1. Load environment variables from the .env file into process.env
dotenv.config();

// 2. Define a strict schema for our environment variables
const envSchema = z.object({
  PORT: z.string().default('3000'),
  UPSTASH_URL: z.string().min(1, 'UPSTASH_URL is required'),
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
  OPENROUTER_MODEL: z.string().min(1, 'OPENROUTER_MODEL is required'),
});

// 3. Validate process.env against our schema
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

// 4. Export the strictly typed environment variables
export const env = _env.data;
