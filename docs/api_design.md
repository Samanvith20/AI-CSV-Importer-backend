# API Design

## Base URL
`/api`

## 1. Upload CSV
- **Endpoint:** `POST /upload`
- **Content-Type:** `multipart/form-data`
- **Body:** `file` (The CSV file to process)
- **Description:** Uploads a CSV, stores it temporarily, and enqueues a background processing job.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "File uploaded successfully. Job enqueued.",
    "data": {
      "jobId": "12345-abcde"
    }
  }
  ```

## 2. Check Job Status
- **Endpoint:** `GET /jobs/:jobId`
- **Description:** Poll this endpoint to check the progress of the worker.
- **Response (200 OK):**
  ```json
  {
    "status": "active", // "pending", "active", "completed", "failed"
    "progress": 50,
    "processedRows": 25,
    "totalRows": "Calculating..." // Becomes a number when finished
  }
  ```
- **Error Response (200 OK - If Failed):**
  ```json
  {
    "status": "failed",
    "error": "Error message details"
  }
  ```

## 3. Fetch Job Result
- **Endpoint:** `GET /jobs/:jobId/result`
- **Description:** Fetches the fully validated, normalized, and mapped CRM JSON payload from Redis.
- **Response (200 OK):**
  ```json
  {
    "records": [
      {
        "name": "John Doe",
        "email": "john@test.com",
        "country_code": "+91",
        "mobile_without_country_code": "9876543210",
        "company": "Acme Corp",
        "city": "Bangalore",
        "state": "Karnataka",
        "country": "",
        "lead_owner": "",
        "crm_status": "GOOD_LEAD_FOLLOW_UP",
        "crm_note": "",
        "data_source": "leads_on_demand",
        "possession_time": "",
        "description": ""
      }
    ],
    "skipped": [
      {
        "reason": "Validation failed: Invalid CRM Status",
        "row": { "raw": "data" }
      }
    ],
    "statistics": {
      "totalRows": 1,
      "processed": 1,
      "skipped": 0,
      "duplicates": 0
    }
  }
  ```
