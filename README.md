CanonSync AI

An AI-powered continuity engine that helps television writers maintain story consistency by detecting canon conflicts before scripts are finalized.

CanonSync AI helps writers and story editors maintain a consistent source of truth ("canon") for television shows by automatically detecting continuity conflicts in newly submitted scenes. By combining semantic search, vector embeddings, and IBM Granite, the platform enables writers to identify inconsistencies before scripts move into production, helping preserve narrative quality across episodes and seasons.

---

IBM AI Builders Challenge Theme

Theme: Reimagine Creative Industries with AI

CanonSync AI demonstrates how generative AI can enhance the creative writing process by assisting television writers and story editors in preserving narrative continuity. Rather than replacing creativity, the platform augments writers with intelligent canon management, semantic search, and AI-powered contradiction detection using IBM technologies.

---

Problem Statement

Television writers often work collaboratively across multiple episodes and seasons. As a story grows, maintaining continuity becomes increasingly difficult. Small inconsistencies—such as changes to a character's background, timeline, relationships, or previously established events—can lead to continuity errors that reduce the quality, credibility, and consistency of a show.

Traditional documentation methods quickly become difficult to maintain as the volume of story information increases. Writers often spend valuable creative time manually searching previous scripts to verify facts.

CanonSync AI addresses this challenge by maintaining a structured canon database and automatically detecting contradictions before scripts are finalized.

---

Solution

CanonSync AI provides a centralized canon repository where established story facts are stored and semantically indexed.

When a writer submits a new scene:

- IBM Granite extracts structured canon facts.
- IBM Slate generates semantic embeddings for each extracted fact.
- PostgreSQL with pgvector retrieves the most semantically similar existing canon.
- IBM Granite evaluates whether contradictions exist between the new scene and established canon.
- A structured conflict report is generated for the writer before publication.

This workflow allows writers to focus on storytelling while AI assists with continuity verification.

---

MVP Workflow

Create Show
      ↓
Seed Initial Canon
      ↓
Submit Scene
      ↓
IBM Granite extracts structured facts
      ↓
IBM Slate generates embeddings
      ↓
Semantic search using pgvector
      ↓
IBM Granite performs contradiction reasoning
      ↓
Conflict Report
      ↓
Store Conflict

---

AI Architecture

Writer
   │
   ▼
Frontend (Next.js)
   │
   ▼
Backend (Node.js + Express)
   │
   ├── Fact Extraction
   ├── Embedding Generation
   ├── Semantic Retrieval
   ├── Contradiction Analysis
   └── Conflict Persistence
   │
   ▼
PostgreSQL + pgvector
   │
   ▼
IBM watsonx.ai
      ├── IBM Granite
      └── IBM Slate Embeddings

---

Technology Stack

Frontend

- Next.js

Backend

- Node.js
- Express.js

Database

- PostgreSQL
- pgvector

AI

- IBM Granite 3 8B Instruct
- IBM Slate Embedding Model
- IBM watsonx.ai

Cloud Platform

- IBM Cloud

Collaboration & Version Control

- Git
- GitHub

---

IBM Technologies Used

CanonSync AI is built around IBM's AI ecosystem.

- IBM Bob – Primary AI-assisted development tool used throughout implementation.
- IBM watsonx.ai – Hosts and serves the AI models used by the application.
- IBM Granite 3 8B Instruct – Extracts structured canon facts and performs contradiction reasoning.
- IBM Slate Embedding Model – Generates semantic vector embeddings for similarity search.
- IBM Cloud – Provides the runtime infrastructure supporting the AI services.

These technologies form the core intelligence behind CanonSync AI.

---

How IBM Bob Was Used

IBM Bob served as the team's primary AI-assisted development companion throughout the project.

It was used to:

- Design the overall AI architecture.
- Plan the CanonPipeline orchestration workflow.
- Assist with backend implementation and debugging.
- Refine prompt engineering for fact extraction and contradiction analysis.
- Support IBM Granite integration with watsonx.ai.
- Review implementation decisions and suggest improvements.
- Assist with technical documentation and developer workflows.

IBM Bob accelerated development while allowing the team to retain full ownership of architectural decisions, implementation, testing, and validation.

---

# Database Design
Database Design

The MVP consists of four primary tables.

Shows

Stores television show projects.

Example fields:

- Show title
- Description
- Creation timestamp

---

Canon Facts

Stores established facts that define a show's official canon.

Each fact contains:

- Category
- Fact text
- Source episode
- Vector embedding
- Version reference ("superseded_by")
- Author name
- Creation timestamp

---

Submissions

Stores scenes submitted for AI analysis.

Each submission includes:

- Script
- Processing status
- Author name
- Timestamp

---

Conflicts

Stores AI-generated continuity conflict reports.

Each conflict contains:

- Related submission
- Related canon fact
- Confidence score
- AI reasoning
- Resolution status

---

Database Schema

The database uses PostgreSQL relational modeling with foreign key constraints to maintain data integrity.

### Relationships

- One show can have many canon facts.
- One show can have many submissions.
- One submission can generate many conflicts.
- One canon fact can be referenced by many conflicts.
- Canon facts support versioning through the "superseded_by" self-reference.

---

AI Pipeline

CanonSync AI follows the workflow below:

1. Writer submits a scene.
2. IBM Granite extracts structured facts.
3. IBM Slate generates semantic embeddings.
4. pgvector retrieves the most relevant canon facts.
5. IBM Granite reasons over the retrieved canon.
6. Potential continuity conflicts are identified.
7. Structured conflict reports are generated.
8. Results are stored for future reference and presented to the writer.

---

Project Structure

canonsync-ai/
│
├── frontend/
├── backend/
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── migrations/
└── README.md

---

Installation Guide

Clone the Repository

git clone https://github.com/kevinmasanga/canonsync-ai.git

Navigate into the project.

cd canonsync-ai

---

PostgreSQL Setup

Create the project database.

CREATE DATABASE canonsync;

Enable pgvector.

CREATE EXTENSION IF NOT EXISTS vector;

---

Database Setup

Create the schema.

psql -U postgres -d canonsync -f database/schema.sql

Populate the database with sample data.

psql -U postgres -d canonsync -f database/seed.sql

Run any required migrations.

psql -U postgres -d canonsync -f database/migrations/002_embedding_dimensions.sql

---

Running the Project

Backend

cd backend
npm install
npm run dev

Frontend

cd frontend
npm install
npm run dev

---

Key Features

- AI-powered canon fact extraction
- Semantic search using vector embeddings
- Automatic continuity conflict detection
- Canon version management
- Structured conflict reporting
- PostgreSQL + pgvector vector database integration
- IBM Granite reasoning pipeline
- IBM Slate embedding generation

---

Future Work

Future versions of CanonSync AI may include:

- Timeline visualization
- Character relationship graphs
- Multi-show knowledge management
- Real-time script editor integration
- Collaborative writers' room features
- Advanced conflict resolution suggestions

---

Demo

A demonstration video showcasing CanonSync AI is available as part of the IBM AI Builders Challenge submission.

---

# Team Members

| Name | Role |
|------|------|
| Brian Ngari | Project Lead & AI Integration |
| Kevin Masanga | Software & Backend Lead |
| Dickson Moseti | Frontend Lead & Project Owner |
| Elly Mikera | Database & Documentation Lead 

This project was developed as part of the IBM AI Builders Challenge – Reimagine Creative Industries with AI.
