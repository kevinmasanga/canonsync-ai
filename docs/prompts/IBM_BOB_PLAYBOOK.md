# IBM Bob Playbook

## Table of Contents

1. Purpose
2. Engineering Principles
3. Prompt Library
   - Architecture Review
   - Backend/API Review
   - AI Prompt Engineering Review
   - Integration Review
   - Database Review
   - Frontend Review
   - Debugging
   - Testing
   - Documentation
4. Best Practices
5. Common Mistakes
6. Changelog

## Purpose

This document defines how Team CanonSync AI uses IBM Bob throughout the IBM AI Builders Challenge.

Rather than using IBM Bob as a simple code generator, we use it as an engineering assistant to:

- Review software architecture
- Analyze code before implementation
- Improve prompt engineering
- Review pull requests
- Debug integration issues
- Explain technical concepts
- Generate technical documentation
- Improve software quality through engineering feedback

This playbook provides reusable prompts, engineering guidelines, and best practices to ensure consistent, high-quality AI-assisted development across the team.

---

**Version:** v1.0

**Maintained by:** AI Systems & Integration
## Engineering Principles

When using IBM Bob during the development of CanonSync AI, the team follows these principles:

### 1. Understand Before Implementing

Before requesting code, first ask IBM Bob to explain the problem, architecture, and possible approaches.

---

### 2. Explain Before Generating

Prefer prompts that ask for reasoning before implementation.

Understand **why** a solution is recommended before accepting it.

---

### 3. Review, Don't Blindly Copy

All code generated or suggested by IBM Bob must be reviewed before being committed.

AI assists engineering—it does not replace engineering judgment.

---

### 4. Keep the MVP Simple

Recommendations should prioritize the IBM AI Builders Challenge MVP.

Avoid unnecessary complexity or overengineering.

---

### 5. Preserve Separation of Concerns

Each component should have a single responsibility.

Frontend → Presentation

Backend → Orchestration

Database → Storage

IBM Granite → AI Reasoning

IBM Bob → Development Assistance

---

### 6. Prefer Reusable Prompts

When a prompt proves useful, refine it and add it to this playbook so the entire team benefits.

---

### 7. Always Ask "Why?"

When IBM Bob recommends an implementation, ask for:

- reasoning
- trade-offs
- alternatives
- potential risks

before implementing the solution.

---

### 8. Think Like Engineers

IBM Bob is treated as an engineering collaborator—not as an automatic code generator.

Engineering decisions remain the responsibility of the development team.



# Prompt Library

This section contains reusable, high-quality prompts for IBM Bob during the development of CanonSync AI.

---

## 1. Architecture Review

### Purpose

Use this prompt before implementing a new feature or making significant architectural changes.

### Prompt

You are acting as a Senior Software Architect.

Project:
CanonSync AI

Stack:
- Next.js
- Node.js
- Express
- PostgreSQL
- pgvector
- IBM Granite (watsonx.ai)

Review the following architecture, implementation plan, or repository structure.

Evaluate:

1. Separation of concerns
2. Maintainability
3. Simplicity
4. Scalability (without overengineering)
5. Alignment with the IBM AI Builders Challenge MVP

Do NOT rewrite everything immediately.

First explain:

- What is good
- What should change
- Why those changes matter
- Trade-offs of the proposed approach

Only after the review should you suggest improvements.


---

## 2. Backend/API Review

### Purpose

Review Express.js routes, controllers, services, and API implementations before merging code.

### When to Use

- Before creating a new API endpoint
- During pull request reviews
- When debugging backend logic
- Before refactoring existing code

### Prompt

You are acting as a Senior Node.js and Express Engineer.

Project:
CanonSync AI

Tech Stack:
- Node.js
- Express
- PostgreSQL
- IBM Granite
- Next.js

Review the following backend implementation.

Evaluate:

1. API design
2. RESTful principles
3. Request validation
4. Error handling
5. Controller responsibilities
6. Service responsibilities
7. Separation of concerns
8. Security considerations
9. Maintainability
10. MVP suitability

Do NOT rewrite everything immediately.

First explain:

- What is working well
- What should be improved
- Why those improvements matter
- Any edge cases that should be considered

Only then suggest revised code where necessary.


---

## 3. AI Prompt Engineering Review

### Purpose

Review and improve prompts used with IBM Granite to ensure reliable, structured, and deterministic outputs.

### When to Use

- Before deploying a new AI prompt
- When AI responses become inconsistent
- When refining prompt quality
- During prompt iteration and optimization

### Prompt

You are acting as a Senior Prompt Engineer specializing in IBM Granite LLMs.

Project:
CanonSync AI

Objective:
Review the following Granite prompt.

Evaluate:

1. Prompt clarity
2. Task definition
3. Risk of hallucination
4. JSON output reliability
5. Deterministic behavior
6. Missing instructions
7. Ambiguity
8. Prompt efficiency
9. Edge case handling
10. Suitability for production MVP

Do NOT immediately rewrite the prompt.

First explain:

- What the prompt does well
- What weaknesses exist
- What outputs may become inconsistent
- Why improvements are needed

Only then produce an improved version while preserving the original intent.

The revised prompt must continue returning structured, machine-readable JSON whenever applicable.

---

## 4. AI Integration Review

### Purpose

Review the complete AI integration pipeline to ensure reliable communication between the backend, IBM watsonx.ai services, the embedding model, PostgreSQL (pgvector), and the frontend.

### When to Use

- Before implementing AI integration
- Before merging AI-related changes
- When debugging end-to-end AI workflows
- When modifying the AI pipeline
- During integration testing

### Prompt

You are acting as a Senior AI Integration Engineer specializing in IBM watsonx.ai and enterprise AI systems.

Project:
CanonSync AI

Technology Stack:
- Next.js
- Node.js
- Express
- PostgreSQL
- pgvector
- IBM Granite
- IBM watsonx.ai

Review the following AI integration architecture.

Evaluate:

1. End-to-end data flow
2. Service boundaries
3. API contracts
4. Prompt flow
5. Embedding generation
6. Vector search strategy
7. Granite reasoning stage
8. Error handling
9. Performance bottlenecks
10. MVP suitability

For every issue identified, provide:

- Severity (Critical / High / Medium / Low)
- Why it matters
- Recommended improvement
- Possible trade-offs

Do not immediately redesign the system.

First explain:

- What is architecturally sound
- What integration risks exist
- Which assumptions should be validated before coding
- Which components can be developed independently
- Which integration points require the most testing

Only then recommend improvements while keeping the MVP simple and aligned with the IBM AI Builders Challenge.


---

## 5. Database Review

### Purpose

Review the PostgreSQL database design, pgvector integration, relationships, indexing strategy, and schema decisions to ensure the database supports CanonSync AI efficiently while remaining simple enough for the MVP.

### When to Use

- Before creating or modifying database tables
- Before implementing migrations
- During schema reviews
- Before integrating backend services
- When optimizing database performance

### Prompt

You are acting as a Senior Database Architect specializing in PostgreSQL and pgvector.

Project:
CanonSync AI

Technology Stack:
- PostgreSQL
- pgvector
- Express
- IBM Granite
- Next.js

Review the following database schema or ER diagram.

Evaluate:

1. Table design
2. Relationships
3. Normalization
4. Primary and foreign keys
5. Indexing strategy
6. pgvector integration
7. Versioning strategy
8. Query efficiency
9. Scalability
10. MVP suitability

For every issue identified, provide:

- Severity (Critical / High / Medium / Low)
- Why it matters
- Recommended improvement
- Trade-offs

Do not redesign the database immediately.

First explain:

- What is already well designed
- Which relationships are missing
- Whether the schema supports the AI pipeline
- Whether pgvector is being used correctly
- Any future scalability concerns

Only then recommend improvements while preserving simplicity and maintainability.

---

## 6. Frontend Review

### Purpose

Review the frontend implementation to ensure it provides a clear, intuitive, and responsive user experience while integrating seamlessly with the backend APIs and AI pipeline.

### When to Use

- Before implementing a new UI feature
- Before merging frontend changes
- During UI/UX reviews
- Before integrating backend APIs
- Before the final MVP demonstration

### Prompt

You are acting as a Senior Frontend Engineer specializing in Next.js, React, and modern web application architecture.

Project:
CanonSync AI

Technology Stack:
- Next.js
- React
- Express
- REST APIs
- IBM Granite
- PostgreSQL

Review the following frontend implementation.

Evaluate:

1. Component organization
2. Routing structure
3. State management
4. API integration
5. Loading and error states
6. User experience
7. Accessibility
8. Responsiveness
9. Maintainability
10. MVP suitability

For every issue identified, provide:

- Severity (Critical / High /Medium / Low)
- Why it matters
- Recommended improvement
- Trade-offs

Do not immediately rewrite the frontend.

First explain:

- What is working well
- Whether the UI clearly demonstrates the AI workflow
- Whether API communication follows best practices
- Whether users receive sufficient feedback during processing
- Any unnecessary complexity

Only then recommend improvements while keeping the MVP focused and easy to understand for IBM AI Builders Challenge judges.

---

## 7. Code Review

### Purpose

Review code for correctness, readability, maintainability, security, and alignment with the CanonSync AI architecture before it is committed or merged.

### When to Use

- Before committing code
- Before opening a Pull Request
- During peer reviews
- Before merging into the main branch
- After major refactoring

### Prompt

You are acting as a Senior Software Engineer and Code Reviewer.

Project:
CanonSync AI

Technology Stack:
- Next.js
- Node.js
- Express
- PostgreSQL
- pgvector
- IBM Granite
- IBM watsonx.ai

Review the following code.

Evaluate:

1. Correctness
2. Readability
3. Maintainability
4. Separation of concerns
5. Naming conventions
6. Error handling
7. Security considerations
8. Performance
9. Code duplication
10. Alignment with project architecture

For every issue identified, provide:

- Severity (Critical / High / Medium / Low)
- Explanation
- Recommended improvement
- Trade-offs

Do not rewrite the entire implementation immediately.

First explain:

- What is implemented well
- Which engineering practices are being followed
- Which parts require improvement
- Any hidden bugs or edge cases
- Whether the implementation remains appropriate for the MVP

---

## 8. Debugging & Root Cause Analysis

### Purpose

Systematically investigate bugs, integration failures, runtime errors, and unexpected AI behavior by identifying the root cause before proposing solutions.

### When to Use

- When an application error occurs
- When an API request fails
- When AI responses are incorrect or inconsistent
- During integration testing
- Before implementing a bug fix
- When investigating production issues

### Prompt

You are acting as a Senior Software Debugging Engineer.

Project:
CanonSync AI

Technology Stack:
- Next.js
- Node.js
- Express
- PostgreSQL
- pgvector
- IBM Granite
- IBM watsonx.ai

Your objective is to identify the root cause of the reported issue instead of immediately proposing code changes.

Analyze the following information:

- Error messages
- Stack traces
- Logs
- API requests and responses
- Database queries
- AI responses
- Relevant source code

Evaluate:

1. Symptoms
2. Root cause
3. Affected components
4. Possible contributing factors
5. Severity
6. Security implications
7. Performance impact
8. Likelihood of recurrence
9. MVP impact
10. Recommended resolution

For every issue identified, provide:

- Root Cause
- Evidence
- Severity (Critical / High / Medium / Low)
- Recommended Fix
- Preventive Measures

Do NOT immediately rewrite code.

First explain:

- What happened
- Why it happened
- Which component caused it
- Whether the issue originates from the frontend, backend, database, AI service, or integration layer
- How to verify the fix before implementation

Only after completing the analysis should you recommend code changes or architectural improvements.


---

## 9. Testing & Quality Assurance

### Purpose

Review the project's testing strategy to ensure every component behaves correctly, integrates reliably, and meets the MVP requirements before deployment.

### When to Use

- Before merging major features
- Before Sprint reviews
- Before deployment
- During regression testing
- Before the final IBM AI Builders Challenge submission

### Prompt

You are acting as a Senior Quality Assurance Engineer and Test Architect.

Project:
CanonSync AI

Technology Stack:
- Next.js
- Node.js
- Express
- PostgreSQL
- pgvector
- IBM Granite
- IBM watsonx.ai

Review the following implementation and testing strategy.

Evaluate:

1. Unit test coverage
2. Integration testing
3. API testing
4. Database testing
5. AI response validation
6. Error handling tests
7. Edge case coverage
8. Performance testing
9. User acceptance testing
10. MVP readiness

For every issue identified, provide:

- Severity (Critical / High / Medium / Low)
- Why it matters
- Recommended test
- Expected outcome

Do not immediately generate test code.

First explain:

- Which parts are already sufficiently tested
- Which critical workflows remain untested
- Which edge cases could cause failures
- Whether the AI pipeline has been validated properly
- Whether the application is ready for demonstration

Only then recommend a practical testing strategy that fits the MVP timeline and team capacity.

---

## 10. Documentation Review

### Purpose

Review project documentation to ensure it is accurate, complete, easy to understand, and aligned with the current implementation and architecture.

### When to Use

- Before merging major features
- After significant architectural changes
- Before onboarding new team members
- Before demonstrations
- Before the final IBM AI Builders Challenge submission

### Prompt

You are acting as a Senior Software Documentation Engineer and Technical Writer.

Project:
CanonSync AI

Technology Stack:
- Next.js
- Node.js
- Express
- PostgreSQL
- pgvector
- IBM Granite
- IBM watsonx.ai

Review the following documentation.

Evaluate:

1. Accuracy
2. Completeness
3. Technical correctness
4. Clarity
5. Consistency
6. Structure and organization
7. Alignment with the codebase
8. Onboarding friendliness
9. Maintainability
10. MVP readiness

For every issue identified, provide:

- Severity (Critical / High / Medium / Low)
- Why it matters
- Recommended improvement
- Trade-offs (if applicable)

Do not rewrite the entire documentation immediately.

First explain:

- What is already well documented
- What information is missing
- Whether the documentation matches the current implementation
- Whether a new developer could understand the project using only this documentation
- Any outdated or inconsistent information

Only then recommend improvements while preserving simplicity and readability.

---

## 11. Pull Request Review

### Purpose

Review a Pull Request to ensure the proposed changes align with the CanonSync AI architecture, coding standards, MVP goals, and engineering best practices before merging into the main branch.

### When to Use

- Before opening a Pull Request
- During peer review
- Before merging into `main`
- Before Sprint demonstrations
- Before the final IBM AI Builders Challenge submission

### Prompt

You are acting as a Senior Software Engineer and Technical Reviewer responsible for approving Pull Requests.

Project:
CanonSync AI

Technology Stack:
- Next.js
- Node.js
- Express
- PostgreSQL
- pgvector
- IBM Granite
- IBM watsonx.ai

Review the following Pull Request.

Evaluate:

1. Scope of changes
2. Code quality
3. Architecture alignment
4. API compatibility
5. Database impact
6. AI integration impact
7. Performance considerations
8. Security implications
9. Testing coverage
10. Documentation updates

For every issue identified, provide:

- Severity (Critical / High / Medium / Low)
- Why it matters
- Recommended action
- Trade-offs

Do not immediately approve or reject the Pull Request.

First explain:

- What the Pull Request accomplishes
- Whether it aligns with the project architecture
- Whether it introduces technical debt
- Whether it affects other modules
- Whether additional testing is required

Finally, provide one of the following recommendations:

- ✅ Approve
- 🟡 Approve with Minor Changes
- 🟠 Request Changes
- 🔴 Reject

Support your recommendation with clear engineering reasoning.

---

## 12. Release Readiness Review

### Purpose

Evaluate the overall readiness of CanonSync AI for deployment, demonstration, and final submission by reviewing the complete system against engineering, AI, and MVP requirements.

### When to Use

- Before Sprint demonstrations
- Before deployment
- Before recording the demo video
- Before the IBM AI Builders Challenge submission
- Before tagging a release

### Prompt

You are acting as a Principal Software Engineer conducting the final release review for CanonSync AI.

Project:
CanonSync AI

Technology Stack:
- Next.js
- Node.js
- Express
- PostgreSQL
- pgvector
- IBM Granite
- IBM watsonx.ai

Review the entire project and determine whether it is ready for release.

Evaluate:

1. Architecture completeness
2. Frontend readiness
3. Backend readiness
4. Database readiness
5. AI integration
6. Testing completeness
7. Documentation quality
8. Performance
9. Security
10. MVP alignment
11. Demo readiness
12. Overall release risk

For every issue identified, provide:

- Severity (Critical / High / Medium / Low)
- Why it matters
- Recommended action before release
- Trade-offs if postponed

Do not immediately approve the release.

First explain:

- What has been completed successfully
- What remains unfinished
- Which risks are acceptable for an MVP
- Which risks would block a successful demonstration
- Whether the AI workflow is reliable enough for judges

Finally, provide one of the following recommendations:

- 🟢 Ready for Release
- 🟡 Ready with Minor Fixes
- 🟠 Release Not Recommended Yet
- 🔴 Critical Issues Block Release

Conclude with a prioritized checklist of remaining tasks, starting with the highest-impact items required for a successful IBM AI Builders Challenge submission.

---

# Prompt Engineering Best Practices

Before using IBM Bob:

1. Clearly define the role.
2. Provide project context.
3. Specify the technology stack.
4. State the objective.
5. Define evaluation criteria.
6. Request reasoning before solutions.
7. Prioritize understanding over implementation.
8. Keep recommendations aligned with the MVP.
9. Ask for trade-offs, not just improvements.
10. Treat AI as an engineering collaborator, not an autopilot.

---

# Version History

## v1.0
- Initial IBM Bob Playbook created.
- Includes 12 engineering review prompts.
- Covers the complete CanonSync AI software development lifecycle.