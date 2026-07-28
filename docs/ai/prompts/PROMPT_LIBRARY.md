# CanonSync AI Prompt Library

## Purpose

The Prompt Library serves as the central catalog for all prompts used by the CanonSync AI subsystem.

Rather than embedding prompts directly within application code, prompts are maintained as version-controlled documentation. This approach improves maintainability, collaboration, testing, and prompt evolution over time.

---

## Scope

This document provides an index of all AI prompts used throughout CanonSync.

For each prompt, it records:

- Purpose
- Owning AI service
- Input
- Expected output
- Current version
- Status
- Location

The complete prompt definitions are maintained in their own dedicated documents.

---

## Intended Audience

- AI Engineers
- Backend Developers
- Software Architects
- Technical Reviewers

---

# Prompt Design Principles

All prompts in CanonSync should follow these principles.

## Consistency

Prompts should produce structured, predictable outputs that conform to predefined schemas.

---

## Determinism

Prompts should minimize ambiguity by providing explicit instructions and expected response formats.

---

## Separation of Responsibilities

Each prompt should solve a single task.

For example:

- Fact extraction
- Contradiction analysis
- Character consistency

Complex reasoning should be achieved by chaining specialized prompts rather than creating one large prompt.

---

## Structured Output

Whenever possible, prompts should require JSON responses that conform to documented schemas.

Free-form responses should be avoided in production workflows.

---

## Maintainability

Prompt wording should remain independent from application code.

Prompt revisions should be tracked through version control.

---

## Testability

Every production prompt should have accompanying example inputs and expected outputs to support regression testing.


---

# Prompt Registry

| Prompt | Purpose | Owning Service | Input | Output | Version | Status | Location |
|--------|---------|----------------|-------|--------|---------|--------|----------|
| System Prompt | Defines CanonSync AI behavior and response rules | All AI Services | System Context | Behavioral Constraints | v1.0 | Active | SYSTEM_PROMPTS.md |
| Fact Extraction Prompt | Extract structured canon facts from scenes | Fact Extraction Service | Scene Script | Fact Array (JSON) | v1.0 | Active | FACT_EXTRACTION_PROMPT.md |
| Contradiction Analysis Prompt | Compare new facts against existing canon | Contradiction Analysis Service | New Facts + Canon Facts | Conflict Report (JSON) | v1.0 | Active | CONTRADICTION_ANALYSIS_PROMPT.md |

---

# Prompt Lifecycle

Every production prompt should follow the lifecycle below.

```text
Draft
  ↓
Review
  ↓
Testing
  ↓
Validation
  ↓
Production
  ↓
Versioned Update
```

A prompt should not be marked as "Active" until it has been tested against representative CanonSync scenarios.

---

# Versioning Rules

## Major Version (v2.0, v3.0)

Use when:

- The response schema changes.
- The prompt's purpose changes.
- The prompt produces substantially different behavior.

## Minor Version (v1.1, v1.2)

Use when:

- Instructions are clarified.
- Edge cases are improved.
- Output reliability is increased.

## Patch Version (v1.0.1)

Use when:

- Typographical corrections are made.
- Formatting is improved.
- No behavioral change is expected.

---

# Prompt Ownership

Each prompt must have a clearly identified owning service.

The owning service is responsible for:

- Maintaining the prompt
- Updating versions
- Validating outputs
- Coordinating schema changes
- Documenting behavioral changes

This prevents undocumented prompt modifications that could affect downstream services.


