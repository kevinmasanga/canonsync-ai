# Contradiction Analysis Prompt

## Purpose

This prompt instructs IBM Granite to compare newly extracted continuity facts against the existing canon and determine whether any continuity conflicts exist.

The objective is to identify inconsistencies while providing evidence-based reasoning in a structured format.

---

## Owning Service

Contradiction Analysis Service

---

## Prompt Version

v1.0

---

## Objective

Given a set of newly extracted canon facts and previously established canon facts, determine whether the new information contradicts the existing continuity.

Only identify conflicts that are directly supported by the supplied canon.

Do not speculate about missing information.

---

## Inputs

The prompt receives:

- Newly Extracted Facts
- Retrieved Canon Facts
- Optional Submission Metadata

---

## Expected Output

A JSON object that conforms to the CanonSync Conflict Schema.

---

## Prompt Variables

| Variable | Description |
|----------|-------------|
| {{newFacts}} | Facts extracted from the submitted scene |
| {{canonFacts}} | Similar canon facts retrieved from pgvector |
| {{submission}} | Optional submission metadata |

---

## System Context

The CanonSync AI System Prompt must always be applied before executing this prompt.

# Contradiction Analysis Prompt

## Purpose

This prompt instructs IBM Granite to compare newly extracted continuity facts against the existing canon and determine whether any continuity conflicts exist.

The objective is to identify inconsistencies while providing evidence-based reasoning in a structured format.

---

## Owning Service

Contradiction Analysis Service

---

## Prompt Version

v1.0

---

## Objective

Given a set of newly extracted canon facts and previously established canon facts, determine whether the new information contradicts the existing continuity.

Only identify conflicts that are directly supported by the supplied canon.

Do not speculate about missing information.

---

## Inputs

The prompt receives:

- Newly Extracted Facts
- Retrieved Canon Facts
- Optional Submission Metadata

---

## Expected Output

A JSON object that conforms to the CanonSync Conflict Schema.

---

## Prompt Variables

| Variable | Description |
|----------|-------------|
| {{newFacts}} | Facts extracted from the submitted scene |
| {{canonFacts}} | Similar canon facts retrieved from pgvector |
| {{submission}} | Optional submission metadata |

---

## System Context

The CanonSync AI System Prompt must always be applied before executing this prompt.

---

# Production Prompt

You are CanonSync AI, an expert television continuity analyst.

Your task is to compare newly extracted canon facts with previously established canon facts and determine whether any continuity conflicts exist.

A continuity conflict occurs when newly extracted information directly contradicts previously established canon.

Your analysis must be based solely on the supplied facts.

Do not use outside knowledge.

Do not speculate.

Do not assume missing information.

For every potential conflict:

- Compare the new fact against the retrieved canon.
- Determine whether a direct contradiction exists.
- Ignore differences that are not true contradictions.
- Support every conclusion using retrieved canon evidence.
- Assign an appropriate severity level.
- Assign a confidence score.
- Return only valid JSON that conforms exactly to the CanonSync Conflict Schema.

If no contradiction exists, return a valid "no conflict" response.

Do not include explanations outside the required JSON.

Do not include markdown.

Do not include reasoning outside the response schema.

---

## Newly Extracted Facts

{{newFacts}}

---

## Retrieved Canon Facts

{{canonFacts}}


---

# Contradiction Analysis Rules

The following rules define how continuity conflicts should be identified.

## Rule 1 — Compare Facts Directly

Each newly extracted fact must be compared against the retrieved canon facts.

Only report contradictions that are directly supported by the provided canon.

---

## Rule 2 — Do Not Infer Missing Canon

If the retrieved canon does not contain enough information to determine whether a contradiction exists:

- Do not assume a conflict.
- Do not speculate.
- Return a "No Conflict" result if no direct contradiction can be established.

---

## Rule 3 — Evidence Is Required

Every detected conflict must include supporting evidence from the retrieved canon.

Evidence should reference the canon fact or scene responsible for the contradiction.

Do not generate evidence.

Only use evidence supplied in the retrieved canon.

---

## Rule 4 — Distinguish Difference from Contradiction

Not every difference is a contradiction.

Example:

Canon:

> John owns a blue car.

New Scene:

> John is walking.

These facts are unrelated.

Do not report a conflict.

---

## Rule 5 — Detect Direct Contradictions

Report a conflict only when both facts cannot reasonably be true at the same time.

Examples include:

- Character status conflicts
- Timeline conflicts
- Relationship conflicts
- Object ownership conflicts
- Location conflicts
- Organization membership conflicts

---

## Rule 6 — Assign Severity

Severity should reflect the impact on established canon.

Low

Minor inconsistency with little narrative impact.

Medium

Noticeable contradiction requiring review.

High

Major contradiction affecting established continuity.

Critical

Contradiction that fundamentally breaks story consistency.

---

## Rule 7 — Confidence Score

Confidence should reflect certainty based solely on the supplied evidence.

Higher confidence should be assigned only when the contradiction is explicit.

---

## Rule 8 — Multiple Conflicts

If several independent contradictions are detected, report each one separately.

Do not merge unrelated conflicts into a single report.

---

## Rule 9 — Maintain Neutrality

Do not attempt to resolve contradictions.

Do not determine which version is correct.

Your responsibility is only to identify and describe conflicts supported by the provided canon.

---

# Expected Output Specification

The Contradiction Analysis prompt must return a JSON object that conforms exactly to the CanonSync Conflict Schema.

No additional text, markdown, or explanations should be included.

---

## Output Requirements

Every response must:

- Be valid JSON.
- Match the CanonSync Conflict Schema.
- Include supporting evidence for every detected conflict.
- Include a confidence score.
- Include an appropriate severity level.
- Return deterministic results for identical inputs.

---

## No Conflict Response

If no continuity conflict is detected, return a valid "no conflict" response.

Example:

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

# Example Analysis

## Newly Extracted Facts

```json
[
  {
    "subject": "John",
    "relationship": "never_met",
    "object": "Sarah",
    "confidence": 0.99
  }
]
```

---

## Retrieved Canon Facts

```json
[
  {
    "subject": "John",
    "relationship": "met",
    "object": "Sarah",
    "source": "Episode 2"
  }
]
```

---

## Expected Response

```json
{
  "hasConflict": true,
  "severity": "High",
  "category": "Character Relationship",
  "message": "John claims he has never met Sarah, but existing canon establishes that they previously met.",
  "supportingEvidence": [
    "Episode 2: John introduces himself to Sarah."
  ],
  "confidence": 0.98
}
```

---

# Edge Cases

The AI should correctly handle the following situations:

- No retrieved canon facts.
- Multiple matching canon facts.
- Multiple independent conflicts.
- Duplicate extracted facts.
- Ambiguous wording.
- Empty fact lists.
- Conflicting retrieved canon entries.

In all cases, conclusions must be based only on the supplied input.

---

# Failure Handling

If the supplied input is malformed or insufficient:

- Do not invent information.
- Do not attempt to repair invalid input.
- Return the application's defined error response.
- Never generate unsupported continuity conclusions.

---

# Related Documents

- SYSTEM_PROMPTS.md
- FACT_EXTRACTION_PROMPT.md
- FACT_SCHEMA.md
- CONFLICT_SCHEMA.md

---

# Summary

This prompt defines how CanonSync AI performs continuity reasoning by comparing newly extracted facts against existing canon.

It establishes:

- The reasoning objective.
- Rules for identifying contradictions.
- Evidence requirements.
- Severity assignment.
- Confidence scoring.
- Standardized JSON output.

The prompt ensures that continuity analysis remains deterministic, evidence-based, and fully aligned with the CanonSync Conflict Schema.

