# CanonSync AI

An AI-powered continuity engine for television writers' rooms.

CanonSync AI helps writers and story editors maintain a consistent source of truth ("canon") for television shows by detecting continuity conflicts in newly submitted scenes. The system combines PostgreSQL, pgvector, and IBM Granite to perform semantic search and AI-powered contradiction detection.

---

# Problem Statement

Television writers often work collaboratively across multiple episodes and seasons. As a story grows, maintaining continuity becomes increasingly difficult. Small inconsistencies—such as changes to a character's background, timeline, or established events—can lead to continuity errors that reduce the quality and consistency of a show.

CanonSync AI addresses this problem by maintaining a structured canon database and automatically detecting contradictions before scripts are finalized.

---

# Solution

CanonSync AI provides a centralized canon repository where established story facts are stored.

When a writer submits a new scene:

- IBM Granite extracts structured facts from the scene.
- Embeddings are generated for semantic understanding.
- pgvector searches for similar canon facts.
- IBM Granite determines whether contradictions exist.
- A conflict report is generated and presented to the user.

---

# MVP Workflow

```text
Create Show
      ↓
Seed Initial Canon
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

# System Architecture

```text
Frontend (Next.js)
        │
        ▼
Backend (Node.js + Express)
        │
        ▼
PostgreSQL + pgvector
        │
        ▼
IBM Granite AI
```

---

# Technology Stack

### Frontend
- Next.js

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL
- pgvector

### AI
- IBM Granite

### Collaboration and Version Control
- Git
- GitHub

---

# Database Design

The MVP consists of four main tables.

## Shows

Stores television show projects.

Example:

- Show title
- Description
- Creation timestamp

---

## Canon Facts

Stores all established facts that make up a show's canon.

Each fact contains:

- Category
- Fact text
- Source episode
- Embedding
- Version reference (`superseded_by`)
- Author name
- Creation timestamp

---

## Submissions

Stores scenes submitted by writers for AI analysis.

Each submission includes:

- Script
- Processing status
- Author name
- Timestamp

---

## Conflicts

Stores AI-generated continuity conflict reports.

Each conflict contains:

- Related submission
- Related canon fact
- Confidence score
- AI reasoning
- Resolution status

---

# Database Schema

The database uses PostgreSQL relational modeling with foreign key constraints to maintain data integrity.

Relationships:

- One show can have many canon facts.
- One show can have many submissions.
- One submission can generate many conflicts.
- One canon fact can be referenced by many conflicts.
- Canon facts support versioning through the `superseded_by` self-reference.

---

# AI Pipeline

CanonSync AI follows the workflow below:

1. Writer submits a scene.
2. IBM Granite extracts structured facts.
3. Embeddings are generated.
4. Embeddings are stored in PostgreSQL.
5. pgvector performs semantic similarity search.
6. IBM Granite reasons over the retrieved canon facts.
7. Conflict reports are generated.
8. Conflict reports are stored for future reference.

---

# Project Structure

```text
caononsync-ai/
│
├── frontend/
│
├── backend/
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│
└── README.md
```

---

# Installation Guide

## Clone the Repository

```bash
git clone https://github.com/kevinmasanga/canonsync-ai.git
```

Navigate into the project.

```bash
cd CanonSync-ai
```

---

# PostgreSQL Setup

Install PostgreSQL.

Create the project database.

```sql
CREATE DATABASE canonsync;
```

Install the pgvector extension if it is not already available.

The schema automatically enables it using:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

# Database Setup

Build the database schema.

```bash
psql -U postgres -d canonsync -f database/schema.sql
```

Populate the database with sample data.

```bash
psql -U postgres -d canonsync -f database/seed.sql
```

---

# Indexes

The database includes several indexes to improve query performance.

## idx_canon_show

Retrieves canon facts belonging to a specific show efficiently.

---

## idx_submission_show

Optimizes retrieval of submissions for a show.

---

## idx_conflict_canon

Improves lookup of conflicts associated with a canon fact.

---

## idx_canon_fact_text (GIN)

Supports fast full-text search on canon facts.

Useful for:

- Keyword search
- Natural language search
- Canon exploration

---

## idx_canon_embedding (HNSW)

Supports efficient semantic similarity search using pgvector.

Instead of comparing every embedding stored in the database, PostgreSQL uses the HNSW index to quickly retrieve the most semantically similar canon facts.

This index is a core component of the CanonSync AI continuity engine.

---

# Running the Project

### Backend

```bash
npm install
npm run dev
```

### Frontend

```bash
npm install
npm run dev
```

---

# Team Members

| Name | Role |
|------|------|
| Brian | Team Lead |
| Elly | AI and Research Lead |
| Kevin | Software Lead |
| Dickson | Documentation & Design Lead |


---

# License

This project was developed as part of the **IBM AI Builders Challenge**.