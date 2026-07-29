# API Documentation

This document lists the REST API endpoints available in the LegalQA operating system. All API endpoints reside under the `/api` route.

## Authentication

All endpoints under `/api` (excluding `/api/auth/login` and `/api/auth/signup`) require a valid JWT token stored in the `token` cookie.

### `POST /api/auth/signup`
Creates a new user profile and organization.
- **Request Body**:
  ```json
  {
    "email": "lawyer@firm.com",
    "password": "securepassword",
    "name": "Nidhi Patil",
    "orgName": "Apex Legal LLP"
  }
  ```
- **Response (201 Created)**: Returns the user object and sets the session cookie.

### `POST /api/auth/login`
Authenticates a user and sets the JWT session cookie.
- **Request Body**:
  ```json
  {
    "email": "lawyer@firm.com",
    "password": "securepassword"
  }
  ```
- **Response (200 OK)**: Returns the authenticated user object.

### `POST /api/auth/logout`
Clears the JWT session cookie.
- **Response (200 OK)**: Clears the `token` cookie.

---

## Contract Operations

### `GET /api/contracts`
Retrieves all contracts associated with the authenticated user's organization.
- **Response (200 OK)**:
  ```json
  {
    "contracts": [
      {
        "id": "contract-uuid",
        "title": "NDA-Partner.pdf",
        "status": "AUDITED",
        "riskScore": 12,
        "createdAt": "2026-07-29T07:08:51Z"
      }
    ]
  }
  ```

### `POST /api/contracts`
Uploads and parses a new contract.
- **Request Headers**: `Content-Type: multipart/form-data`
- **Request Body**:
  - `file`: PDF or DOCX file (up to 15MB)
  - `title` (optional): Custom title
- **Response (201 Created)**: Returns the newly created contract database record.

### `DELETE /api/contracts/[id]`
Deletes a contract, its analysis database tables, and associated text chunks.
- **Response (200 OK)**: `{ "success": true }`

### `POST /api/contracts/[id]/analyze`
Runs LlamaParse and Groq obligations RAG analysis.
- **Response (200 OK)**: Returns updated contract metrics, risks, and obligations tables.

---

## RAG & Chat

### `POST /api/chat`
Performs similarity document search and streams the answer with citations.
- **Request Body**:
  ```json
  {
    "message": "What is the limitation of liability cap?",
    "contractId": "contract-uuid"
  }
  ```
- **Response**: Streams SSE text chunks with citations metadata.

---

## Workspace Analytics

### `GET /api/analytics`
Fetches workspace statistics for the dashboard.
- **Response (200 OK)**: Returns overall risk score averages, pending reviews counter, and monthly uploads trend datasets.
