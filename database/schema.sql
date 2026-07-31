-- ==================================================
-- CanonSync AI Database schema
-- Database: PostgreSQL
-- Extension: pgvector
-- Database name: canonsync
-- ==================================================

-- ==================================================
-- Enable pgvector and UUID if they don't exist
-- ==================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ==================================================
-- shows table
-- ==================================================

CREATE TABLE IF NOT EXISTS shows (
    show_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- Canon Facts Table
-- ==================================================

CREATE TABLE IF NOT EXISTS canon_facts (
    canon_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id UUID NOT NULL,
    category VARCHAR(100) NOT NULL,
    fact_text TEXT NOT NULL,
    source_episode VARCHAR(100),
    embedding VECTOR(384),
    superseded_by UUID,
    author_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_canon_show
        FOREIGN KEY (show_id)
        REFERENCES shows(show_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_superseded_fact
        FOREIGN KEY (superseded_by)
        REFERENCES canon_facts(canon_id)
        ON DELETE SET NULL
);

-- ===================================================
-- Submissions Table
-- ===================================================

CREATE TYPE submission_status AS ENUM (
    'pending',
    'processed',
    'failed'
);

CREATE TABLE IF NOT EXISTS submissions (
    submission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id UUID NOT NULL,
    script TEXT NOT NULL,
    status submission_status DEFAULT 'pending',
    author_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_submission_show
        FOREIGN KEY (show_id)
        REFERENCES shows(show_id)
        ON DELETE CASCADE
);

-- ===================================================
-- Conflicts Table
-- ===================================================

CREATE TYPE conflict_status AS ENUM (
    'open',
    'resolved',
    'ignored'
);

CREATE TABLE IF NOT EXISTS conflicts (
    conflict_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL,
    canon_id UUID NOT NULL,
    has_conflict BOOLEAN NOT NULL DEFAULT TRUE,
    category VARCHAR(100),
    severity VARCHAR(20),
    confidence NUMERIC(5,4) CHECK (confidence >= 0 AND confidence <= 1),
    supporting_evidence TEXT[],
    retrieved_canon_facts JSONB,
    reasoning TEXT,
    status conflict_status DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,          -- added: tracks when status changes

    CONSTRAINT fk_conflict_submission
        FOREIGN KEY (submission_id)
        REFERENCES submissions(submission_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_conflict_canon
        FOREIGN KEY (canon_id)
        REFERENCES canon_facts(canon_id)
        ON DELETE CASCADE
);


-- =====================================================
-- Indexes
-- =====================================================

-- Frequently searched by show
CREATE INDEX idx_canon_show
ON canon_facts(show_id);

CREATE INDEX idx_submission_show
ON submissions(show_id);

CREATE INDEX idx_conflict_canon
ON conflicts(canon_id);

-- Added: support FK lookups on conflicts by submission
CREATE INDEX idx_conflict_submission
ON conflicts(submission_id);

-- Full-text search on canon facts
CREATE INDEX idx_canon_fact_text
ON canon_facts
USING GIN (to_tsvector('english', fact_text));

-- pgvector similarity search
CREATE INDEX idx_canon_embedding
ON canon_facts
USING hnsw (embedding vector_cosine_ops);
