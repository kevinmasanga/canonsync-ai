-- ==================================================
-- Migration 002 — Correct embedding column dimensions
-- ==================================================
--
-- Context
-- -------
-- The original schema declared VECTOR(1536), which was a forward-looking
-- placeholder sized for OpenAI-style models.
--
-- The configured IBM embedding model is ibm/slate-30m-english-rtrvr-v2,
-- which produces 384-dimensional vectors.
-- If ibm/slate-125m-english-rtrvr-v2 is used instead, change 384 → 768
-- everywhere in this migration and set EMBEDDING_DIMENSIONS=768 in .env.
--
-- Why the HNSW index must be dropped first
-- -----------------------------------------
-- PostgreSQL requires the index to be removed before an ALTER TABLE
-- changes the column type.  The index is recreated immediately after.
--
-- How to apply
-- ------------
--   psql -d canonsync -f database/migrations/002_embedding_dimensions.sql
--
-- Safe to re-run?
-- ---------------
-- No. The ALTER TABLE will fail if the column already holds stored vectors
-- of a different dimension.  Truncate canon_facts first if any test data
-- exists, or guard with a manual check.
-- ==================================================

-- Step 1: Remove the HNSW index (cannot coexist with a type change)
DROP INDEX IF EXISTS idx_canon_embedding;

-- Step 2: Resize the embedding column to match the actual model output.
--         Existing NULL values are unaffected.
--         Any stored VECTOR(1536) values would cause this to fail —
--         truncate the table or cast explicitly if that is the case.
ALTER TABLE canon_facts
    ALTER COLUMN embedding TYPE VECTOR(384);

-- Step 3: Recreate the HNSW cosine-distance index on the corrected dimension.
CREATE INDEX idx_canon_embedding
    ON canon_facts
    USING hnsw (embedding vector_cosine_ops);
