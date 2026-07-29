# CanonSync AI Architecture

## Purpose

This document defines the architecture of the CanonSync AI subsystem.

It explains the components responsible for AI processing, their individual responsibilities, how they interact, and the boundaries between AI, backend services, the database, and IBM watsonx.ai.

The objective is to provide a clear architectural blueprint that guides implementation while maintaining a modular, scalable, and maintainable design.

---

## Scope

This document covers:

- AI subsystem components
- Component responsibilities
- Service boundaries
- Inter-service communication
- IBM watsonx.ai integration
- Database interaction
- Architectural design principles

This document does not describe prompt implementations, API contracts, or workflow sequencing. Those are documented separately.

---

## Intended Audience

- AI Engineers
- Backend Developers
- Software Architects
- Technical Reviewers
- Project Maintainers


---

# AI Component Architecture

The CanonSync AI subsystem is composed of independent services coordinated by a central AI Orchestrator.

Each service has a single responsibility and communicates only through well-defined interfaces.

```text
                           CanonSync AI Architecture

                           Next.js Frontend
                                  │
                                  ▼
                          Express REST API
                                  │
                                  ▼
                        Submission Service
                                  │
                                  ▼
                           AI Orchestrator
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
Fact Extraction Service   Embedding Service    Vector Search Service
        │                         │                         │
        ▼                         ▼                         ▼
   IBM Granite          IBM Embedding Model         PostgreSQL + pgvector
        │                                                   │
        └──────────────────────┬────────────────────────────┘
                               ▼
                  Contradiction Analysis Service
                               │
                               ▼
                          IBM Granite
                               │
                               ▼
                    Conflict Report Service
                               │
                               ▼
                        PostgreSQL Database
                               │
                               ▼
                         Express Backend
                               │
                               ▼
                        Next.js Frontend
```

---

### Architectural Overview

The AI subsystem follows an orchestration-based architecture.

Instead of placing all AI logic inside a single service, the AI Orchestrator coordinates specialized services responsible for different stages of processing.

This design improves:

- Maintainability
- Testability
- Scalability
- Separation of concerns

Each component performs one well-defined responsibility and remains independent of the implementation details of other components.

---

# Component Responsibilities

## 1. AI Orchestrator

### Purpose

The AI Orchestrator coordinates the complete AI pipeline.

It does not perform AI reasoning itself. Instead, it manages the execution order of specialized AI services and passes data between them.

### Responsibilities

- Start AI processing
- Coordinate AI services
- Handle execution flow
- Handle AI-related failures
- Return the final processing result

### Inputs

- Submission ID
- Scene script

### Outputs

- Conflict report
- Processing status

---

## 2. Fact Extraction Service

### Purpose

Extract structured continuity facts from a submitted scene using IBM Granite.

### Responsibilities

- Send extraction prompt to Granite
- Parse AI response
- Validate JSON structure
- Return structured facts

### Inputs

- Scene script

### Outputs

- Structured canon facts

---

## 3. Embedding Service

### Purpose

Generate semantic vector embeddings for extracted canon facts using the IBM watsonx.ai embedding model.

### Responsibilities

- Generate embeddings
- Validate embedding dimensions
- Return embedding vectors

### Inputs

- Structured canon facts

### Outputs

- 1536-dimensional vectors

---

## 4. Vector Search Service

### Purpose

Retrieve the most relevant canon facts using pgvector similarity search.

### Responsibilities

- Query pgvector
- Rank results by similarity
- Return Top-K relevant facts

### Inputs

- Embedding vector

### Outputs

- Relevant canon facts

---

## 5. Contradiction Analysis Service

### Purpose

Determine whether newly submitted facts contradict existing canon.

### Responsibilities

- Send reasoning prompt to IBM Granite
- Compare new facts against retrieved canon
- Determine conflict severity
- Generate reasoning

### Inputs

- New canon facts
- Retrieved canon facts

### Outputs

- Conflict analysis

---

## 6. Conflict Report Service

### Purpose

Convert AI reasoning into a standardized report for storage and frontend display.

### Responsibilities

- Format AI response
- Attach supporting evidence
- Assign severity level
- Prepare final report

### Inputs

- Contradiction analysis

### Outputs

- Structured conflict report

---

# Component Interactions

The CanonSync AI subsystem follows a controlled communication model.

Each component communicates only with the components it requires to perform its responsibility. Components should never bypass the AI Orchestrator or directly access unrelated services.

## Interaction Flow

```text
Submission Service
        │
        ▼
AI Orchestrator
        │
        ├────────► Fact Extraction Service
        │                 │
        │                 ▼
        │          IBM Granite
        │
        ├────────► Embedding Service
        │                 │
        │                 ▼
        │      IBM Embedding Model
        │
        ├────────► Vector Search Service
        │                 │
        │                 ▼
        │      PostgreSQL + pgvector
        │
        ├────────► Contradiction Analysis Service
        │                 │
        │                 ▼
        │          IBM Granite
        │
        └────────► Conflict Report Service
                          │
                          ▼
                  PostgreSQL Database
```

---

## Communication Rules

### AI Orchestrator

Communicates with:

- Fact Extraction Service
- Embedding Service
- Vector Search Service
- Contradiction Analysis Service
- Conflict Report Service

Does **not** communicate directly with:

- IBM Granite
- PostgreSQL
- Frontend

---

### Fact Extraction Service

Communicates with:

- IBM Granite
- AI Orchestrator

Does **not** communicate with:

- PostgreSQL
- Frontend
- Vector Search Service

---

### Embedding Service

Communicates with:

- IBM Embedding Model
- AI Orchestrator

Does **not** communicate with:

- PostgreSQL
- Frontend
- Contradiction Service

---

### Vector Search Service

Communicates with:

- PostgreSQL
- pgvector
- AI Orchestrator

Does **not** communicate with:

- IBM Granite
- Frontend

---

### Contradiction Analysis Service

Communicates with:

- IBM Granite
- AI Orchestrator

Does **not** communicate with:

- PostgreSQL
- Frontend

---

### Conflict Report Service

Communicates with:

- PostgreSQL
- AI Orchestrator

Does **not** communicate with:

- IBM Granite
- Frontend


---

# Service Boundaries

Service boundaries define the responsibilities and knowledge limits of each component within the AI subsystem.

Each service should know only what it needs to perform its task. This minimizes coupling, improves maintainability, and makes the system easier to test and extend.

---

## AI Orchestrator

### Knows

- The overall AI processing workflow
- Which service should execute next
- Processing status
- Error handling

### Does Not Know

- Prompt contents
- IBM SDK implementation
- SQL queries
- Embedding algorithms
- Database schema

---

## Fact Extraction Service

### Knows

- How to communicate with IBM Granite
- Fact extraction prompt
- Expected JSON schema

### Does Not Know

- Vector search
- Database operations
- Semantic similarity logic
- Frontend implementation

---

## Embedding Service

### Knows

- IBM Embedding Model
- Embedding dimensions (1536)
- Embedding generation process

### Does Not Know

- Prompt engineering
- Conflict detection
- Database business logic
- Frontend logic

---

## Vector Search Service

### Knows

- PostgreSQL
- pgvector
- Similarity search algorithms
- Top-K retrieval

### Does Not Know

- IBM Granite
- Prompt contents
- AI reasoning
- Frontend logic

---

## Contradiction Analysis Service

### Knows

- Contradiction analysis prompt
- Retrieved canon facts
- Newly extracted facts
- IBM Granite reasoning

### Does Not Know

- Database implementation
- Embedding generation
- Frontend rendering

---

## Report Generation Service

### Knows

- Conflict analysis results
- Report structure
- Severity levels
- Supporting evidence format

### Does Not Know

- IBM SDK
- Vector search
- Prompt engineering
- Database schema

---

# Boundary Principles

The CanonSync AI subsystem follows these architectural principles:

### Single Responsibility

Each service owns one responsibility and should not perform the work of another service.

---

### Information Hiding

Internal implementation details remain private.

Other services interact only through clearly defined interfaces.

---

### Loose Coupling

Changing one service should require little or no modification to the others.

---

### High Cohesion

Every service groups together closely related functionality.

Responsibilities should never be scattered across multiple services.

---

### Replaceability

Any AI component should be replaceable without affecting the rest of the architecture.

For example:

- IBM Granite could be replaced by another LLM.
- The embedding model could change.
- PostgreSQL could be optimized.

As long as each component continues to honor its interface, the rest of the system remains unchanged.

# Design Principles

- Separation of Concerns
- Single Responsibility
- Loose Coupling
- High Cohesion
- Information Hiding
- Replaceability
- Extensibility
- Scalability

---

# Future Extensions

- Multiple LLM providers
- Multiple embedding models
- Background job queues
- AI caching
- Human review workflow
- Prompt versioning
- Multi-project knowledge bases
- Streaming responses

# Service Dependency Matrix

| Service | Depends On | Produces |
|----------|------------|----------|
| AI Orchestrator | All AI Services | Complete AI workflow result |
| Fact Extraction Service | IBM Granite | Structured canon facts |
| Embedding Service | IBM watsonx.ai Embedding Model | 1536-dimensional embedding vectors |
| Vector Search Service | PostgreSQL + pgvector | Top-K relevant canon facts |
| Contradiction Analysis Service | IBM Granite | Conflict analysis |
| Report Generation Service | AI Orchestrator | Standardized conflict report |



# Summary

The AI Service Specification defines the implementation contracts for every AI service within CanonSync.

It establishes:

- The responsibility of each AI service.
- Public methods exposed by each service.
- Expected inputs and outputs.
- Dependencies between services.
- Error handling expectations.

This document serves as the primary implementation reference for backend developers building the CanonSync AI subsystem. It complements the AI Workflow and AI Architecture documents by translating architectural decisions into implementation-ready service contracts.
