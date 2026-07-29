# Deployment Guide

This guide outlines steps for deploying the LegalQA operating system to production and setting it up locally.

## Prerequisites

- Node.js (v18 or higher, v20+ recommended)
- PostgreSQL (v14 or higher, running locally or on a cloud hosting provider)
- LlamaParse Account (for high-fidelity document ingestion)
- Groq Cloud Account (for legal analysis inferences)

---

## 1. Local Environment Configuration

Duplicate `.env.example` as `.env` and fill in the parameters:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/legalqa?schema=public"
GROQ_API_KEY="gsk_..."
LLAMA_CLOUD_API_KEY="llx-..."
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your_jwt_signing_secret"
UPLOAD_PATH="d:/Nidhi/LegalQA/uploads"
```

---

## 2. Database Sync

Deploy the schema and compile the Prisma client:
```bash
npx prisma db push
npx prisma generate
```

---

## 3. Production Compilation & Launch

Compile the production optimized Next.js build:
```bash
npm run build
```

Start the application node process:
```bash
npm start
```
The application will launch on port `3000`.
