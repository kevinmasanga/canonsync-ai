# CanonSync AI Workflow

## Purpose

This document defines the complete AI processing workflow for CanonSync AI.

It describes how a scene moves through the AI pipeline—from submission by a writer to the generation of a continuity conflict report. The workflow serves as the single source of truth for understanding how AI components interact with the backend, database, and frontend.

---

## Scope

This document covers:

- Scene submission workflow
- AI orchestration process
- Fact extraction
- Embedding generation
- Semantic search with pgvector
- Continuity conflict detection using IBM Granite
- Conflict report generation
- Response delivery to the frontend

This document does **not** cover implementation details, API specifications, or prompt definitions. Those are documented separately.

---

## Intended Audience

This document is intended for:

- AI Engineers
- Backend Developers
- Frontend Developers
- Database Engineers
- Project Maintainers
- Technical Reviewers

It should provide enough context for any contributor to understand how the AI subsystem operates before reading the implementation.

---

# Workflow Overview

The diagram below shows the complete lifecycle of a scene as it moves through CanonSync's AI subsystem.

```text
Writer
    │
    ▼
Submit Scene
    │
    ▼
Next.js Frontend
    │
    ▼
Express Backend
    │
    ▼
Submission Service
    │
    ▼
Store Submission (Status: Pending)
    │
    ▼
AI Orchestrator
    │
    ├──────────────► Fact Extraction Service
    │                     │
    │                     ▼
    │             Structured Canon Facts
    │
    ├──────────────► Embedding Service
    │                     │
    │                     ▼
    │            1536-Dimensional Vectors
    │
    ├──────────────► Canon Repository
    │                     │
    │                     ▼
    │          PostgreSQL + pgvector
    │
    ├──────────────► Vector Search Service
    │                     │
    │                     ▼
    │        Retrieve Relevant Canon Facts
    │
    ├──────────────► Contradiction Service
    │                     │
    │                     ▼
    │         IBM Granite Reasoning
    │
    ▼
Conflict Report
    │
    ▼
Submission Status = Completed
    │
    ▼
Return Response
    │
    ▼
Next.js Frontend
    │
    ▼
Writer Reviews Conflict Report
```

---

# Detailed Workflow

## Step 1 — Scene Submission

**Actor:** Writer

The workflow begins when a writer submits a television scene through the CanonSync web interface.

The frontend validates the required fields and sends the scene to the Express backend using a REST API request.

**Input**

- Show ID
- Scene Title
- Scene Script
- Author Name

**Output**

A valid submission request is sent to the backend.

---

## Step 2 — Submission Storage

**Owner:** Submission Service

The backend validates the request and stores the raw scene in PostgreSQL.

A unique Submission ID is generated and the submission status is set to **Pending**.

At this stage, no AI processing has occurred.

**Responsibilities**

- Validate request
- Save submission
- Generate Submission ID
- Set initial processing status

---

## Step 3 — AI Orchestration

**Owner:** AI Orchestrator

Once the submission is successfully stored, the AI Orchestrator takes control of the workflow.

Rather than placing all AI logic inside one service, the orchestrator coordinates multiple specialized AI services in the correct order.

Its responsibilities include:

- Starting AI processing
- Managing execution order
- Passing outputs between AI services
- Handling AI-related failures
- Returning the final result to the backend

---

## Step 4 — Fact Extraction

**Owner:** Fact Extraction Service

The AI Orchestrator sends the submitted scene to the Fact Extraction Service.

This service uses IBM Granite to transform unstructured natural language into structured canon facts that can be processed by the rest of the system.

The objective is not to summarize the scene, but to identify factual information that contributes to story continuity.

**Input**

- Scene Script

**AI Responsibilities**

Extract structured information such as:

- Characters
- Relationships
- Events
- Locations
- Timeline references
- Important objects
- Character states

**Example Scene**

John enters the café.

Sarah tells John they have never met before.

**Example Structured Output**

```json
[
  {
    "subject": "Sarah",
    "relationship": "never_met",
    "object": "John",
    "confidence": 0.98
  }
]
```

The service must always return structured JSON that follows the predefined response schema. Free-form natural language responses are not accepted.

---

## Step 5 — Embedding Generation

**Owner:** Embedding Service

Once facts have been extracted, each fact is converted into a numerical vector using the IBM watsonx.ai embedding model.

These embeddings capture semantic meaning rather than exact wording, allowing CanonSync to compare ideas instead of simple keywords.

**Input**

Structured canon facts.

**Output**

1536-dimensional embedding vectors.

Example

```
Sarah has never met John.

↓

[0.014, -0.238, 0.911, ...]
```

The Embedding Service is responsible only for generating embeddings. It does not perform searches or reasoning.

---

## Step 6 — Canon Storage

**Owner:** Canon Repository

The structured facts and their corresponding embeddings are stored in PostgreSQL.

Vector embeddings are stored using the pgvector extension, enabling efficient semantic similarity searches.

The repository stores:

- Canon facts
- Embedding vectors
- Metadata
- Submission references

At the end of this step, the new scene has been converted into searchable knowledge.


---

## Step 7 — Semantic Search

**Owner:** Vector Search Service

After the new canon facts have been stored, the AI Orchestrator requests a semantic similarity search.

Instead of comparing text word-for-word, the Vector Search Service queries PostgreSQL using the pgvector extension to retrieve canon facts that are semantically similar to the newly extracted facts.

This significantly reduces the amount of information that must be analyzed by the Large Language Model, improving both performance and accuracy.

**Input**

- Newly generated embedding vector

**Responsibilities**

- Query pgvector
- Retrieve the Top-K most relevant canon facts
- Rank results by similarity score
- Return the relevant canon facts to the AI Orchestrator

**Output**

A ranked collection of canon facts that are most relevant to the submitted scene.

---

## Step 8 — Contradiction Analysis

**Owner:** Contradiction Service

The AI Orchestrator submits both the newly extracted facts and the retrieved canon facts to IBM Granite for reasoning.

IBM Granite evaluates whether the new scene is consistent with the existing canon and determines whether any continuity conflicts exist.

Unlike semantic search, this stage focuses on logical reasoning rather than similarity.

**Input**

- Newly extracted facts
- Retrieved canon facts

**Possible Outcomes**

- No Conflict
- Possible Conflict
- Conflict Detected

**Responsibilities**

- Compare new facts with existing canon
- Detect inconsistencies
- Determine conflict severity
- Generate explanations supported by evidence

---

## Step 9 — Conflict Report Generation

**Owner:** Conflict Service

The reasoning results are converted into a structured conflict report.

The report provides a clear explanation of the detected issues and can be consumed directly by both the backend and frontend.

Each report contains:

- Conflict status
- Severity level
- Explanation
- Supporting canon evidence
- Confidence score (optional)

**Example Output**

```json
{
  "status": "Conflict",
  "severity": "High",
  "reason": "John previously met Sarah in Episode 2.",
  "evidence": [
    "Episode 2: John introduced himself to Sarah."
  ]
}
```

The completed report is stored in PostgreSQL for future retrieval.

---

## Step 10 — Response Delivery

**Owner:** Express Backend

After AI processing has successfully completed:

- Submission status is updated to **Completed**
- The conflict report is returned through the REST API
- The frontend receives the processed results

The writer can now review the detected continuity issues through the CanonSync interface.

The AI workflow is considered complete once the conflict report has been successfully delivered.


---

# Engineering Principles

The CanonSync AI workflow follows the following engineering principles:

### 1. Separation of Responsibilities

Each service performs a single, well-defined responsibility.

Examples:

- Submission Service manages scene submissions.
- Fact Extraction Service extracts structured facts.
- Embedding Service generates vector embeddings.
- Vector Search Service retrieves semantically relevant canon.
- Contradiction Service performs AI reasoning.

No service should perform another service's responsibility.

---

### 2. AI Orchestration

All AI operations are coordinated by the AI Orchestrator.

The AI Orchestrator is responsible for:

- Executing AI services in the correct order.
- Passing outputs between services.
- Handling AI-related failures.
- Returning the final AI result.

This keeps business logic independent from AI implementation details.

---

### 3. Structured AI Outputs

Every AI service must return structured, machine-readable JSON.

Natural language explanations should only appear inside designated response fields.

This ensures predictable integration with backend services.

---

### 4. Semantic Retrieval Before Reasoning

CanonSync performs semantic retrieval before contradiction analysis.

Instead of sending the entire knowledge base to the LLM:

1. pgvector retrieves the most relevant canon facts.
2. IBM Granite reasons only over those results.

This improves:

- Performance
- Scalability
- Cost efficiency
- Response quality

---

### 5. Loose Coupling

Frontend components never communicate directly with AI services.

IBM watsonx.ai is accessed only through the backend AI layer.

Database operations remain independent from AI logic.

Each subsystem communicates through clearly defined interfaces.

---

# Failure Handling

The AI workflow should fail gracefully.

Possible failure scenarios include:

| Failure | Expected Behaviour |
|----------|--------------------|
| Invalid submission | Reject request before AI processing |
| IBM watsonx.ai unavailable | Mark submission as Failed and log the error |
| Embedding generation fails | Stop processing and record the failure |
| Semantic search returns no results | Continue reasoning with an empty canon context |
| Invalid AI response | Reject response and trigger validation or retry logic |

No failure should result in loss of the original submission.

---

# Future Enhancements

The workflow has been designed to support future improvements without major architectural changes.

Potential enhancements include:

- Background job processing using message queues
- Asynchronous AI processing
- AI result caching
- Multi-model AI support
- Human review workflow
- Prompt version management
- AI performance monitoring
- Automatic retry mechanisms
- Batch processing of submissions

---

# Summary

The CanonSync AI Workflow defines the complete lifecycle of AI processing within the system.

It establishes:

- The sequence of AI operations.
- The responsibility of each service.
- The interaction between AI, backend, database, and frontend.
- Engineering principles that promote maintainability, scalability, and reliability.

This document serves as the reference for implementing and maintaining the AI subsystem throughout the project lifecycle.