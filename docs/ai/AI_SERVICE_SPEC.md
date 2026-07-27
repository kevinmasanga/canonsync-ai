# CanonSync AI Service Specification

## Purpose

This document defines the public interfaces for every AI service within CanonSync.

It specifies the responsibilities, methods, inputs, outputs, dependencies, and expected behavior of each service.

The objective is to provide implementation contracts that backend developers can follow while keeping the AI subsystem modular and maintainable.

---

## Scope

This document covers:

- Public service interfaces
- Service methods
- Inputs and outputs
- Dependencies
- Error handling
- Expected behavior

This document does not describe internal implementation details or prompt contents.

---

## Intended Audience

- Backend Developers
- AI Engineers
- Software Architects
- Technical Reviewers

---

# AI Service Specifications

## 1. AI Orchestrator

### Responsibility

Coordinate the complete AI processing pipeline.

The AI Orchestrator manages execution order but does not perform AI reasoning itself.

---

### Public Methods

#### processSubmission()

Starts the complete AI workflow for a submitted scene.

---

### Input

```text
Submission ID

Scene Script
```

---

### Output

```text
Conflict Report

Processing Status
```

---

### Dependencies

- Fact Extraction Service
- Embedding Service
- Vector Search Service
- Contradiction Analysis Service
- Report Generation Service

---

### Possible Errors

- AI service unavailable
- Invalid AI response
- Processing timeout
- Unexpected internal error

---

### Notes

The AI Orchestrator should remain independent of IBM SDK implementation details.

## 2. Fact Extraction Service

### Responsibility

Extract structured continuity facts from a submitted scene using IBM Granite.

The service converts unstructured screenplay text into machine-readable JSON that can be processed by downstream AI services.

---

### Public Methods

#### extractFacts()

Extracts canon facts from a submitted scene.

---

### Input

```text
Scene Script
```

---

### Output

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

---

### Dependencies

- IBM Granite
- Prompt Library
- Response Schema Validator

---

### Possible Errors

- Invalid AI response
- Malformed JSON
- Granite unavailable
- Prompt execution failure

---

### Notes

This service must always return structured JSON that conforms to the predefined response schema.
It must never return free-form natural language.

---

## 3. Embedding Service

### Responsibility

Generate semantic embeddings for extracted canon facts using the IBM watsonx.ai embedding model.

---

### Public Methods

#### generateEmbedding()

Creates a vector embedding for a structured canon fact.

---

### Input

Structured canon fact.

---

### Output

```text
1536-dimensional vector
```

---

### Dependencies

- IBM watsonx.ai Embedding Model

---

### Possible Errors

- Embedding API unavailable
- Invalid embedding dimensions
- Empty input

---

### Notes

This service is responsible only for generating embeddings.
Storage of embeddings is handled elsewhere.

---

## 4. Vector Search Service

### Responsibility

Retrieve semantically similar canon facts from PostgreSQL using pgvector.

---

### Public Methods

#### searchSimilarFacts()

Performs semantic similarity search.

---

### Input

Embedding Vector

---

### Output

Top-K relevant canon facts.

---

### Dependencies

- PostgreSQL
- pgvector

---

### Possible Errors

- Database unavailable
- pgvector extension unavailable
- Empty search results

---

### Notes

This service performs retrieval only.
It does not perform AI reasoning.

## 5. Contradiction Analysis Service

### Responsibility

Analyze newly extracted canon facts against previously established canon to determine whether continuity conflicts exist.

The service uses IBM Granite to perform contextual reasoning based on the retrieved canon facts.

---

### Public Methods

#### analyzeContradictions()

Determines whether the submitted scene introduces continuity conflicts.

---

### Input

- Newly extracted canon facts
- Retrieved canon facts

---

### Output

```json
{
  "hasConflict": true,
  "severity": "High",
  "reason": "John previously met Sarah in Episode 2.",
  "supportingEvidence": [
    "Episode 2: John introduces himself to Sarah."
  ]
}
```

---

### Dependencies

- IBM Granite
- Prompt Library
- Response Schema Validator

---

### Possible Errors

- Granite unavailable
- Invalid reasoning response
- Malformed JSON
- Prompt execution failure

---

### Notes

This service performs reasoning only.

It does not retrieve canon data or generate reports.

---

## 6. Report Generation Service

### Responsibility

Transform the contradiction analysis into a standardized report suitable for storage and frontend presentation.

---

### Public Methods

#### generateReport()

Creates the final conflict report.

---

### Input

Contradiction analysis result.

---

### Output

```json
{
  "submissionId": "uuid",
  "status": "completed",
  "conflicts": [
    {
      "severity": "High",
      "message": "John previously met Sarah.",
      "supportingEvidence": [
        "Episode 2"
      ]
    }
  ]
}
```

---

### Dependencies

- AI Orchestrator

---

### Possible Errors

- Invalid analysis result
- Missing required fields
- Report formatting failure

---

### Notes

This service is responsible only for formatting and standardizing AI results.

It does not perform AI reasoning.

---

# Service Dependency Matrix

The following matrix summarizes the dependencies between AI services and external systems.

| Service | Depends On | Produces |
|----------|------------|----------|
| AI Orchestrator | All AI Services | Complete AI workflow result |
| Fact Extraction Service | IBM Granite | Structured canon facts |
| Embedding Service | IBM watsonx.ai Embedding Model | 1536-dimensional embedding vector |
| Vector Search Service | PostgreSQL + pgvector | Top-K relevant canon facts |
| Contradiction Analysis Service | IBM Granite | Conflict analysis |
| Report Generation Service | AI Orchestrator | Standardized conflict report |

---

# Design Principles

The CanonSync AI services follow several engineering principles to ensure the system remains maintainable, scalable, and easy to evolve.

## Single Responsibility

Each service owns one clearly defined responsibility.

Business logic should never be duplicated across services.

---

## Loose Coupling

Services communicate through defined interfaces rather than internal implementations.

Changes within one service should have minimal impact on others.

---

## High Cohesion

Each service groups together closely related functionality.

Responsibilities should not be scattered across multiple services.

---

## Interface-Driven Design

Developers should interact with services through their public methods.

Internal implementation details should remain hidden.

---

## Stateless Processing

AI services should avoid maintaining internal state between requests.

Each request should contain all information required for processing.

---

## Fail Gracefully

Errors should be handled consistently.

Services should return meaningful error messages without exposing implementation details.

---

# Future Extensions

The current service architecture has been designed to support future enhancements without requiring significant structural changes.

Potential extensions include:

- Multiple embedding models
- Support for multiple LLM providers
- Prompt version management
- AI response caching
- Asynchronous AI processing
- Background job queues
- Human review workflows
- AI performance analytics
- Automatic retry strategies
- Batch submission processing

---

# Summary

The AI Service Specification defines the implementation contracts for every AI service within CanonSync.

It establishes:

- The responsibility of each service.
- Public interfaces for backend implementation.
- Expected inputs and outputs.
- Dependencies between services.
- Error handling expectations.
- Engineering principles that guide implementation.

This document serves as the primary implementation reference for the CanonSync AI subsystem.