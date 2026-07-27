# CanonSync Fact Schema

## Purpose

This document defines the canonical JSON schema used to represent continuity facts extracted from screenplay scenes.

The schema establishes a standardized data contract between the AI subsystem, backend services, and database layer.

---

## Scope

This schema applies to:

- Fact Extraction Service
- Embedding Service
- Vector Search Service
- Contradiction Analysis Service

Every extracted fact must conform to this schema before entering the CanonSync AI pipeline.

---

## Intended Audience

- AI Engineers
- Backend Developers
- Database Engineers
- Software Architects

---

# Schema Version

Current Version: v1.0


---

# Canonical Fact Structure

Every extracted continuity fact is represented as a JSON object.

```json
{
  "subject": "John",
  "relationship": "never_met",
  "object": "Sarah",
  "confidence": 0.98
}
```

---

# Field Definitions

## subject

### Type

String

### Required

Yes

### Description

The primary entity involved in the fact.

Examples:

- John
- Sarah
- Iron Throne
- King's Landing

---

## relationship

### Type

String

### Required

Yes

### Description

Describes the relationship or action connecting the subject and object.

Examples:

- never_met
- married_to
- located_in
- owns
- betrayed
- killed

---

## object

### Type

String or Null

### Required

No

### Description

The secondary entity involved in the relationship.

Some facts do not require an object.

Example

```json
{
  "subject":"John",
  "relationship":"dead",
  "object":null
}
```

---

## confidence

### Type

Number

### Required

Yes

### Range

0.00–1.00

### Description

Represents the AI's confidence that the extracted fact is explicitly supported by the scene.

---

# Validation Rules

Every extracted fact must satisfy the following validation requirements before it is accepted into the CanonSync AI pipeline.

## Rule 1 — Required Fields

The following fields are mandatory:

- subject
- relationship
- confidence

The `object` field is optional and may be `null`.

---

## Rule 2 — Data Types

| Field | Data Type |
|---------|-----------|
| subject | String |
| relationship | String |
| object | String or Null |
| confidence | Number |

---

## Rule 3 — Confidence Range

The confidence value must be between **0.00** and **1.00** inclusive.

Examples:

Valid

```json
0.82
```

Invalid

```json
1.42
```

```json
-0.15
```

---

## Rule 4 — Empty Strings

The following fields must never be empty strings:

- subject
- relationship

Invalid

```json
{
  "subject":"",
  "relationship":"married_to"
}
```

---

## Rule 5 — Null Handling

Only the **object** field may contain `null`.

Example

```json
{
  "subject":"John",
  "relationship":"dead",
  "object":null,
  "confidence":0.99
}
```

---

## Rule 6 — Duplicate Facts

Duplicate facts must not appear within the same extraction result.

Repeated observations should be merged into a single fact.

---

# Recommended Relationship Types

To improve consistency across AI responses, the following relationship values are recommended.

## Character Relationships

- married_to
- sibling_of
- parent_of
- child_of
- friend_of
- enemy_of
- never_met

---

## Character Status

- alive
- dead
- injured
- missing
- imprisoned

---

## Location

- located_in
- travelled_to
- departed_from

---

## Objects

- owns
- possesses
- lost
- discovered
- destroyed

---

## Events

- killed
- rescued
- betrayed
- promoted
- resigned
- crowned
- arrested

---

## Organizations

- member_of
- leader_of
- employed_by

---

## Timeline

- before
- after
- during

---

# Valid Examples

The following examples conform to the CanonSync Fact Schema.

## Example 1 — Relationship

```json
{
  "subject": "John",
  "relationship": "never_met",
  "object": "Sarah",
  "confidence": 0.98
}
```

---

## Example 2 — Character Status

```json
{
  "subject": "Ned Stark",
  "relationship": "dead",
  "object": null,
  "confidence": 1.00
}
```

---

## Example 3 — Location

```json
{
  "subject": "Daenerys",
  "relationship": "located_in",
  "object": "Dragonstone",
  "confidence": 0.96
}
```

---

# Invalid Examples

These examples violate the CanonSync Fact Schema.

## Invalid Confidence

```json
{
  "subject": "John",
  "relationship": "married_to",
  "object": "Sarah",
  "confidence": 1.42
}
```

Reason:

Confidence must be between **0.00** and **1.00**.

---

## Missing Required Field

```json
{
  "relationship": "located_in",
  "object": "Winterfell",
  "confidence": 0.91
}
```

Reason:

The **subject** field is required.

---

## Empty Subject

```json
{
  "subject": "",
  "relationship": "dead",
  "object": null,
  "confidence": 0.99
}
```

Reason:

The **subject** field must not be empty.

---

## Invalid Data Type

```json
{
  "subject": "Arya",
  "relationship": "located_in",
  "object": 42,
  "confidence": 0.95
}
```

Reason:

The **object** field must be a string or null.

---

# Future Extensibility

The schema has been intentionally designed to support future enhancements.

Possible additions include:

- episode_id
- season_number
- scene_number
- source_dialogue
- source_character
- extracted_timestamp
- confidence_explanation
- embedding_id
- provenance metadata

Future versions should maintain backward compatibility whenever possible.

---

# Related Documents

- AI_WORKFLOW.md
- AI_ARCHITECTURE.md
- AI_SERVICE_SPEC.md
- SYSTEM_PROMPTS.md
- FACT_EXTRACTION_PROMPT.md

---

# Summary

The CanonSync Fact Schema defines the standard structure used to represent continuity facts throughout the AI subsystem.

It provides:

- A common data contract for AI services.
- Validation requirements for extracted facts.
- Recommended relationship vocabulary.
- Examples of valid and invalid data.
- A foundation for semantic search, contradiction analysis, and future AI capabilities.

All AI-generated facts should conform to this schema before they are accepted into the CanonSync processing pipeline.