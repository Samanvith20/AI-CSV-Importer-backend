# GrowEasy AI CSV Importer - Backend

An enterprise-grade, highly scalable AI pipeline that intelligently maps arbitrary, unpredictable CSV files into a strict, normalized CRM schema. 

Built with Node.js, TypeScript, BullMQ, Redis, and Gemini 2.5 Pro.

## 🌟 Key Features
- **Semantic Mapping:** Uses Gemini 2.5 Pro to magically understand arbitrary CSV columns (e.g., mapping "Applicant Num" to `mobile_without_country_code`).
- **Memory Efficient:** Processes gigabytes of CSVs using Node streams and strict 25-row batching. The server will never crash from out-of-memory errors.
- **Intelligent Retries:** Features a built-in batch-level exponential backoff system that intercepts AI hallucinations and rate-limits (`429 Too Many Requests`), automatically retrying the specific batch without failing the overarching job.
- **Dynamic State Tracking:** Accurately calculates true CSV row counts up-front using a blazing fast pass, guaranteeing 100% accurate progress polling for the frontend.
- **Bulletproof Validation:** Uses `Zod` to enforce strict CRM rules. Invalid rows are intelligently caught and moved to a skipped list with exact error reasons.
- **Data Normalization:** Automatically fixes casing, trims whitespace, formats phone numbers, and flags duplicates.
- **Asynchronous Flow:** Fully decoupled architecture using BullMQ and Redis for background processing.

## 🏗️ Architecture Flow
1. **Client** uploads a CSV -> Express API saves it to disk and enqueues a **BullMQ Job**.
2. **Worker** explicitly counts the total rows, then picks up the job and streams the CSV in batches of 25.
3. **AI Service** uses PromptBuilder to ask Gemini to map the raw rows into JSON.
4. **Resiliency Engine** intercepts failures (network/rate limits) and automatically retries the batch up to 3 times with exponential backoff.
5. **Post-Processing Pipeline** catches the JSON, parses it, validates it via Zod, normalizes the data, and flags duplicates.
6. **Redis** caches the final, perfect JSON payload.
7. **Client** polls the job status continuously and fetches the final JSON from Redis once completed.

## 🚀 Local Development

### Prerequisites
- Node.js (v18+)
- Redis Server (Running locally or via cloud like Upstash)
- Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Samanvith20/AI-CSV-Importer-backend.git
   
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   UPSTASH_URL=redis://your-redis-url:6379
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the Application:**
   Run the backend server and the worker simultaneously:
   ```bash
   # Terminal 1 - Start the API Server
   npm run dev

   # Terminal 2 - Start the BullMQ Worker
   npm run worker
   ```

## 📚 API Documentation
For detailed API request/response structures, refer to `docs/api_design.md`.
For deeper architecture details, see `docs/architecture.md`.



## 🛡️ Production Readiness
- **File Cleanup:** The worker automatically deletes raw CSVs after processing.
- **Error Handling:** Graceful failure states bubble up to BullMQ and are returnable via the API.
- **Strict Typing:** End-to-end TypeScript configuration ensures robust compilations and predictable logic flow.
