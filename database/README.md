# CanonSync AI — Database

This directory contains the PostgreSQL schema for the CanonSync AI backend.

---

## Overview

CanonSync AI is a tool that helps writers and showrunners detect **canon conflicts** in submitted scripts. A *canon fact* is any established piece of story truth for a show — a character trait, a world rule, a timeline event. When a new script is submitted, the AI compares it against the stored canon facts and surfaces anything that contradicts established lore.

The database is built around four concerns:

| Concern | Table |
|---|---|
| Tracking shows | `shows` |
| Storing established canon facts (with AI embeddings) | `canon_facts` |
| Receiving new script submissions | `submissions` |
| Recording detected canon conflicts | `conflicts` |

**Extensions used:**

- [`pgvector`](https://github.com/pgvector/pgvector) — stores and queries 1536-dimensional AI embeddings for semantic similarity search
- [`uuid-ossp`](https://www.postgresql.org/docs/current/uuid-ossp.html) — generates UUID primary keys via `uuid_generate_v4()`

---

## Prerequisites

- PostgreSQL **14+** (18 recommended)
- `pgvector` extension installed on the server

### Installing pgvector

**macOS (Homebrew):**
```bash
brew install pgvector
```

**Ubuntu / Debian:**
```bash
sudo apt install postgresql-16-pgvector
```

**Windows:**
Download the pre-built binaries from the [pgvector releases page](https://github.com/pgvector/pgvector/releases) and follow the installation instructions for your PostgreSQL version.

**From source (any platform):**
```bash
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
make install
```

---

## Setup

### 1. Create the database

Connect to PostgreSQL as a superuser and create the database:

```bash
psql -U postgres
```

```sql
CREATE DATABASE canonsync;
\c canonsync
```

### 2. Apply the schema

From the project root, run:

```bash
psql -U postgres -d canonsync -f canonsync-ai/database/schema.sql
```

Or from inside this directory:

```bash
psql -U postgres -d canonsync -f schema.sql
```

This single command will:
- Enable the required extensions (`uuid-ossp`, `vector`)
- Create all tables and enum types
- Apply all indexes

### 3. (Optional) Load seed data

If a seed file is available for local development:

```bash
psql -U postgres -d canonsync -f canonsync-ai/database/seed.sql
```

---

## Schema

### `shows`

The top-level entity. Every canon fact and every submission belongs to a show.

| Column | Type | Notes |
|---|---|---|
| `show_id` | `UUID` | Primary key, auto-generated |
| `title` | `VARCHAR(255)` | Required |
| `description` | `TEXT` | Optional synopsis |
| `created_at` | `TIMESTAMPTZ` | Auto-set on insert |

---

### `canon_facts`

Stores individual facts that are considered established canon for a show. Each fact can optionally carry an AI embedding for semantic search, and can be marked as superseded by a newer fact (e.g. a retcon).

| Column | Type | Notes |
|---|---|---|
| `canon_id` | `UUID` | Primary key, auto-generated |
| `show_id` | `UUID` | FK → `shows.show_id` |
| `category` | `VARCHAR(100)` | e.g. `character`, `world`, `timeline` |
| `fact_text` | `TEXT` | The plain-text canon statement |
| `source_episode` | `VARCHAR(100)` | Episode reference the fact originates from |
| `embedding` | `VECTOR(1536)` | OpenAI-compatible embedding for similarity search |
| `superseded_by` | `UUID` | FK → `canon_facts.canon_id` (self-referencing, nullable) |
| `author_name` | `VARCHAR(100)` | Who submitted this fact |
| `created_at` | `TIMESTAMPTZ` | Auto-set on insert |

**Notes:**
- `superseded_by` allows modelling retcons — a fact that has been replaced points to the fact that replaced it. When the referenced fact is deleted, this field is set to `NULL` (not cascaded).
- `embedding` is nullable. Facts without embeddings are excluded from vector similarity search but still participate in full-text search.

---

### `submissions`

Represents a script submitted for canon conflict analysis.

| Column | Type | Notes |
|---|---|---|
| `submission_id` | `UUID` | Primary key, auto-generated |
| `show_id` | `UUID` | FK → `shows.show_id` |
| `script` | `TEXT` | Full script content |
| `status` | `submission_status` | Enum: `pending`, `processed`, `failed` |
| `author_name` | `VARCHAR(100)` | Who submitted the script |
| `created_at` | `TIMESTAMPTZ` | Auto-set on insert |

**Enum — `submission_status`:**

| Value | Meaning |
|---|---|
| `pending` | Queued, not yet analysed |
| `processed` | Analysis complete |
| `failed` | Processing encountered an error |

---

### `conflicts`

Records a detected conflict between a submitted script and an established canon fact. Created by the AI processing pipeline after a submission is analysed.

| Column | Type | Notes |
|---|---|---|
| `conflict_id` | `UUID` | Primary key, auto-generated |
| `submission_id` | `UUID` | FK → `submissions.submission_id` |
| `canon_id` | `UUID` | FK → `canon_facts.canon_id` |
| `confidence` | `NUMERIC(5,4)` | AI confidence score `0.0000–1.0000` |
| `reasoning` | `TEXT` | Human-readable explanation from the AI |
| `status` | `conflict_status` | Enum: `open`, `resolved`, `ignored` |
| `created_at` | `TIMESTAMPTZ` | Auto-set on insert |
| `updated_at` | `TIMESTAMPTZ` | Updated when `status` changes |

**Enum — `conflict_status`:**

| Value | Meaning |
|---|---|
| `open` | Conflict flagged, awaiting review |
| `resolved` | Conflict acknowledged and addressed |
| `ignored` | Conflict reviewed and dismissed |

**Note:** `confidence` uses `NUMERIC(5,4)` (exact decimal, e.g. `0.9731`) rather than a floating-point type to ensure the `CHECK (confidence >= 0 AND confidence <= 1)` constraint is always evaluated accurately.

---

## Indexes

| Index | Table | Type | Purpose |
|---|---|---|---|
| `idx_canon_show` | `canon_facts(show_id)` | B-Tree | Fetching all canon facts for a given show. Used on nearly every query that loads facts for a show. |
| `idx_submission_show` | `submissions(show_id)` | B-Tree | Listing all submissions for a given show. |
| `idx_conflict_canon` | `conflicts(canon_id)` | B-Tree | Finding all conflicts that reference a specific canon fact — used when reviewing or deleting a fact. |
| `idx_conflict_submission` | `conflicts(submission_id)` | B-Tree | Finding all conflicts produced by a specific submission — the primary read path after processing. |
| `idx_canon_fact_text` | `canon_facts(fact_text)` | GIN | Full-text keyword search over canon fact text using PostgreSQL's `tsvector`. Supports `WHERE to_tsvector('english', fact_text) @@ to_tsquery(...)` queries. |
| `idx_canon_embedding` | `canon_facts(embedding)` | HNSW | Approximate nearest-neighbour vector similarity search via `pgvector`. Uses cosine distance (`vector_cosine_ops`). Enables semantic matching between a submission chunk and stored canon facts. |

### Why HNSW for vector search?

HNSW (Hierarchical Navigable Small World) is the recommended index type for `pgvector` in production. It offers significantly better query performance than the alternative IVFFlat index at the cost of slightly higher build time and memory usage. For a dataset of canon facts that grows incrementally (not bulk-loaded), HNSW is the right choice.

---

## Cascade Behaviour

Understanding what happens on deletion:

| Deleted record | Effect |
|---|---|
| A `show` | Cascades to all its `canon_facts` and `submissions`. Deleting a submission also cascades to its `conflicts`. |
| A `submission` | Cascades to all `conflicts` linked to it. |
| A `canon_fact` | Cascades to all `conflicts` that reference it. Any other fact whose `superseded_by` pointed to this fact is set to `NULL`. |

---

## Re-running the Schema

The schema uses `CREATE TABLE IF NOT EXISTS` throughout, so re-running `schema.sql` against an existing database is safe for tables. However, the two `CREATE TYPE` statements (`submission_status`, `conflict_status`) are **not idempotent** — they will error if the types already exist. To re-apply from scratch, drop and recreate the database:

```bash
psql -U postgres -c "DROP DATABASE IF EXISTS canonsync;"
psql -U postgres -c "CREATE DATABASE canonsync;"
psql -U postgres -d canonsync -f canonsync-ai/database/schema.sql
```

---

# AI Workflow

The database supports the following pipeline:

```
Create Show

↓

Seed Canon

↓

Submit Scene

↓

IBM Granite extracts facts

↓

Generate Embeddings

↓

Store Embeddings

↓

pgvector Semantic Search

↓

IBM Granite Contradiction Reasoning

↓

Conflict Report

↓

Store Conflict
```

---

# Notes

- Embeddings are generated by the AI service and stored in the `embedding` column of the `canon_facts` table.
- The schema does **not** generate embeddings.
- The schema assumes pgvector has already been installed on the PostgreSQL server.
- `seed.sql` is intended only for development and testing.

---

## File Reference

```
canonsync-ai/database/
├── schema.sql   — Full schema: extensions, tables, types, indexes
└── seed.sql     — Sample data for local development
```

