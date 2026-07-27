# CanonSync Conflict Schema

## Purpose

This document defines the canonical JSON schema used to represent continuity conflicts identified by the CanonSync AI subsystem.

The schema establishes a standardized contract between the Contradiction Analysis Service, Report Generation Service, backend APIs, and frontend applications.

---

## Scope

This schema applies to:

- Contradiction Analysis Service
- Report Generation Service
- AI Orchestrator
- Backend APIs
- Frontend Conflict Viewer

Every detected continuity conflict must conform to this schema before being stored or returned to the application.

---

## Intended Audience

- AI Engineers
- Backend Developers
- Frontend Developers
- Software Architects

---

# Schema Version

Current Version: v1.0


---

# Canonical Conflict Structure

Every detected continuity conflict is represented as a JSON object.

```json
{
  "hasConflict": true,
  "severity": "High",
  "category": "Character Relationship",
  "message": "John previously met Sarah in Episode 2.",
  "supportingEvidence": [
    "Episode 2: John introduces himself to Sarah."
  ],
  "confidence": 0.97
}
```

---

# Field Definitions

## hasConflict

### Type

Boolean

### Required

Yes

### Description

Indicates whether a continuity conflict exists.

---

## severity

### Type

String

### Required

Yes

### Allowed Values

- Low
- Medium
- High
- Critical

### Description

Represents the estimated impact of the detected continuity issue.

---

## category

### Type

String

### Required

Yes

### Description

Classifies the type of continuity issue.

Examples:

- Character Relationship
- Character Status
- Timeline
- Location
- Object Ownership
- Organization
- Event

---

## message

### Type

String

### Required

Yes

### Description

A concise human-readable explanation of the detected conflict.

---

## supportingEvidence

### Type

Array of Strings

### Required

Yes

### Description

References from the retrieved canon that support the detected contradiction.

---

## confidence

### Type

Number

### Required

Yes

### Range

0.00–1.00

### Description

Represents the AI's confidence that the detected conflict is valid.

---

# Validation Rules

Every detected continuity conflict must satisfy the following validation requirements before it is accepted into the CanonSync AI pipeline.

## Rule 1 — Required Fields

Every conflict object must contain:

- hasConflict
- severity
- category
- message
- supportingEvidence
- confidence

---

## Rule 2 — Data Types

| Field | Data Type |
|---------|-----------|
| hasConflict | Boolean |
| severity | String |
| category | String |
| message | String |
| supportingEvidence | Array of Strings |
| confidence | Number |

---

## Rule 3 — Confidence Range

The confidence value must be between **0.00** and **1.00** inclusive.

---

## Rule 4 — Severity Values

The severity field must be one of the following:

- Low
- Medium
- High
- Critical

No other values are permitted.

---

## Rule 5 — Supporting Evidence

The supportingEvidence array should contain one or more references that justify the detected conflict.

If no conflict exists, this array may be empty.

---

## Rule 6 — Message Quality

The message should:

- Clearly describe the conflict.
- Remain concise.
- Avoid speculation.
- Reference only established canon.

---

# Conflict Categories

The following categories are recommended for continuity analysis.

## Character

- Character Relationship
- Character Status
- Character Identity

---

## Timeline

- Timeline
- Chronology
- Flashback Consistency

---

## Location

- Character Location
- Scene Location

---

## Objects

- Object Ownership
- Object State

---

## Organizations

- Organization Membership
- Leadership

---

## Events

- Major Event
- Canon Event

---

# Severity Guidelines

Severity indicates how significantly a contradiction affects story continuity.

| Severity | Description |
|-----------|-------------|
| Low | Minor inconsistency with little narrative impact. |
| Medium | Noticeable contradiction that should be reviewed. |
| High | Significant conflict affecting established canon. |
| Critical | Contradiction that fundamentally breaks story continuity. |

---

# Valid Examples

## Example 1 — High Severity Conflict

```json
{
  "hasConflict": true,
  "severity": "High",
  "category": "Character Relationship",
  "message": "John states he has never met Sarah, but Episode 2 establishes that they previously met.",
  "supportingEvidence": [
    "Episode 2: John introduces himself to Sarah."
  ],
  "confidence": 0.98
}
```

---

## Example 2 — No Conflict

```json
{
  "hasConflict": false,
  "severity": "Low",
  "category": "None",
  "message": "No continuity conflicts detected.",
  "supportingEvidence": [],
  "confidence": 0.99
}
```

---

# Invalid Examples

## Invalid Severity

```json
{
  "hasConflict": true,
  "severity": "Extreme",
  "category": "Timeline",
  "message": "Timeline mismatch.",
  "supportingEvidence": [],
  "confidence": 0.91
}
```

Reason:

"Extreme" is not a valid severity level.

---

## Invalid Confidence

```json
{
  "hasConflict": true,
  "severity": "High",
  "category": "Character Status",
  "message": "Character appears alive.",
  "supportingEvidence": [],
  "confidence": 1.7
}
```

Reason:

Confidence must be between **0.00** and **1.00**.

---

# Future Extensibility

Future versions of this schema may include:

- conflict_id
- submission_id
- episode_id
- season_number
- conflicting_fact
- retrieved_fact
- ai_reasoning_summary
- reviewer_notes
- resolution_status

Future schema revisions should maintain backward compatibility whenever possible.

---

# Related Documents

- AI_WORKFLOW.md
- AI_ARCHITECTURE.md
- AI_SERVICE_SPEC.md
- SYSTEM_PROMPTS.md
- FACT_SCHEMA.md

---

# Summary

The CanonSync Conflict Schema defines the standard structure used to represent continuity conflicts identified by the AI subsystem.

It establishes:

- A consistent contract for AI-generated conflict reports.
- Validation rules for backend processing.
- Standard severity levels.
- Standard conflict categories.
- Examples of valid and invalid responses.

All contradiction analysis results should conform to this schema before they are stored, displayed, or passed to downstream services.

