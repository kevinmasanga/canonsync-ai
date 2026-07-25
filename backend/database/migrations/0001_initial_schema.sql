-- Migration: 0001_initial_schema
-- Description: Create all baseline tables (shows, canon_facts, submissions, conflicts)

-- ── UP ───────────────────────────────────────────────────────────────────────
-- @UP

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TABLE IF NOT EXISTS shows (
    show_id     UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS canon_facts (
    canon_id       UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id        UUID         NOT NULL REFERENCES shows(show_id) ON DELETE CASCADE,
    category       VARCHAR(100) NOT NULL,
    fact_text      TEXT         NOT NULL,
    source_episode VARCHAR(255),
    embedding      vector(1536),
    superseded_by  UUID         REFERENCES canon_facts(canon_id) ON DELETE SET NULL,
    author_name    VARCHAR(255),
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
    submission_id UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id       UUID        NOT NULL REFERENCES shows(show_id) ON DELETE CASCADE,
    script        TEXT        NOT NULL,
    status        VARCHAR(50) NOT NULL DEFAULT 'pending',
    author_name   VARCHAR(255),
    created_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conflicts (
    conflict_id   UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID         NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
    canon_id      UUID         NOT NULL REFERENCES canon_facts(canon_id) ON DELETE CASCADE,
    confidence    NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    reasoning     TEXT,
    status        VARCHAR(50)  NOT NULL DEFAULT 'unresolved',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── DOWN ─────────────────────────────────────────────────────────────────────
-- @DOWN

DROP TABLE IF EXISTS conflicts;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS canon_facts;
DROP TABLE IF EXISTS shows;
