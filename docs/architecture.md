# System Architecture

## Overview
GrowEasy CSV Importer is an AI-powered pipeline designed to dynamically map arbitrary, unpredictable CSV files into a strict, standardized CRM schema. By leveraging Gemini 2.5 Pro and a robust backend streaming pipeline, it ensures high memory efficiency and 100% data integrity.

## Core Flow
1. **File Upload:** The client uploads a raw CSV file. The backend temporarily stores this file and enqueues an import job using **BullMQ**, immediately returning a `jobId` to the client.
2. **Streaming & Batching:** A background **Worker** picks up the job. To prevent memory exhaustion on massive files, it streams the CSV and processes rows in strict batches (25 rows per batch).
3. **AI Semantic Mapping:** Each batch is sent to the `AiService`. This service uses the `PromptBuilder` to instruct Gemini 2.5 Pro to infer semantic meaning from the CSV headers (e.g., mapping "Client Num" to `mobile_without_country_code`) and returns a raw JSON payload.
4. **Post-Processing Pipeline:** 
   - **ResponseParser:** Safely extracts the JSON from any markdown formatting.
   - **ResponseValidator:** Enforces the strict Zod CRM schema. Invalid rows are not dropped silently; they are moved to a `skipped` array with detailed error reasons.
   - **Normalizer:** Cleanses text, standardizes emails to lowercase, and formats phone numbers automatically.
   - **DuplicateDetector:** Identifies duplicates across the dataset (by email/mobile) and safely flags them without deleting data.
5. **Aggregation & Storage:** The batch results are accumulated. Once the stream ends, the final JSON is built and stored in **Redis** with a 24-hour expiration. The raw CSV file is deleted.
6. **Polling:** The client polls the job status. Once marked `completed`, the client fetches the final, pristine dataset from Redis.

## Technology Stack
- **Node.js & Express:** Core web server.
- **BullMQ & Redis:** Background job orchestration and final result caching.
- **Gemini 2.5 Pro:** The AI engine driving semantic extraction.
- **Zod:** Runtime type validation enforcing the CRM schema.
- **TypeScript:** Ensuring end-to-end static typing.