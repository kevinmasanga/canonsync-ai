-- ==================================================
-- Migration 003 — Idempotency constraints
-- ==================================================
--
-- Context
-- -------
-- The CanonSync AI pipeline processes submissions asynchronously.  A crash
-- mid-pipeline or a manual retry could attempt to re-insert facts and
-- conflicts that were already persisted on a previous run.
--
-- This migration adds two unique constraints that make those inserts safe:
--
--   1. canon_facts(show_id, fact_text)
--      A given textual claim can only be recorded once per show.
--      The pipeline's INSERT ... ON CONFLICT DO NOTHING relies on this.
--
--   2. conflicts(submission_id, canon_id)
--      A submission can only conflict with a given canon fact once.
--      Prevents duplicate conflict rows if the pipeline is retried.
--
-- How to apply
-- ------------
--   psql -d canonsync -f database/migrations/003_idempotency_constraints.sql
--
-- Safe to re-run?
-- ---------------
-- Yes — both constraints are created with IF NOT EXISTS semantics via
-- DO $$ blocks that check pg_constraint before adding.
--
-- Pre-flight check
-- ----------------
-- Before applying, verify that no existing data violates the constraints:
--
--   -- Duplicate canon facts:
--   SELECT show_id, fact_text, COUNT(*)
--   FROM canon_facts
--   GROUP BY show_id, fact_text
--   HAVING COUNT(*) > 1;
--
--   -- Duplicate conflict pairs:
--   SELECT submission_id, canon_id, COUNT(*)
--   FROM conflicts
--   GROUP BY submission_id, canon_id
--   HAVING COUNT(*) > 1;
--
-- If either query returns rows, deduplicate that data before applying
-- this migration (retain the row with the lowest created_at).
-- ==================================================

-- Step 1: Unique canon fact per show
--   Prevents the same textual claim from being inserted twice for the
--   same show, which is the primary deduplication mechanism for pipeline retries.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_canon_fact_per_show'
    ) THEN
        ALTER TABLE canon_facts
            ADD CONSTRAINT uq_canon_fact_per_show
            UNIQUE (show_id, fact_text);
    END IF;
END $$;

-- Step 2: Unique conflict per (submission, canon) pair
--   Prevents duplicate conflict rows if contradiction analysis is replayed
--   for the same submission against the same canon fact.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_conflict_submission_canon'
    ) THEN
        ALTER TABLE conflicts
            ADD CONSTRAINT uq_conflict_submission_canon
            UNIQUE (submission_id, canon_id);
    END IF;
END $$;
