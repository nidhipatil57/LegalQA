# Database Documentation

This document describes the PostgreSQL database schema and custom PL/pgSQL database functions used by LegalQA.

## Prisma Schema Models

The database models are defined in [schema.prisma](file:///d:/Nidhi/LegalQA/LegalQA/prisma/schema.prisma).

### Principal Entities

- **Organization**: Holds users and documents.
- **User**: Member accounts associated with roles (e.g., `ADMIN`, `PARTNER`, `SENIOR_LAWYER`).
- **Contract**: Ingested files tracking metadata, overall risk profiles, and audit stages.
- **DocumentChunk**: Individual chunks of document text along with optional embeddings.
- **Risk**: Risks identified during AI analysis, holding category tags, severity scores (`LOW`, `MEDIUM`, `HIGH`), and recommended rewrite clauses.
- **Obligation**: Extracted obligations, tracking parties, descriptions, and categories.

---

## Semantic Chunks Similarity Matcher

To perform high-speed searches without heavy client-side RAG packages, LegalQA utilizes a PL/pgSQL similarity function directly inside PostgreSQL.

During setup, we execute a SQL migration to inject the similarity matching logic:

```sql
CREATE OR REPLACE FUNCTION match_chunks(
  query_text TEXT,
  target_contract_id TEXT,
  match_limit INT
)
RETURNS TABLE (
  id TEXT,
  content TEXT,
  "index" INT,
  similarity NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.content,
    dc.index,
    -- Simple text similarity algorithm (fallback to ts_rank or pg_trgm if installed)
    (ts_rank_cd(to_tsvector('english', dc.content), plainto_tsquery('english', query_text)))::numeric AS similarity
  FROM "DocumentChunk" dc
  WHERE dc."contractId" = target_contract_id
  ORDER BY similarity DESC
  LIMIT match_limit;
END;
$$;
```

---

## Commands for Database Management

### Apply Schema to Local Instance
Updates the local database schema to match the Prisma configurations:
```bash
npx prisma db push
```

### Reset Database
Drops all tables and re-initializes clean schemas:
```bash
npx prisma migrate reset
```
