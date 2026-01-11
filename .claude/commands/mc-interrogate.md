# /mc:interrogate - Deep User Interrogation

You are starting the micro-claude interrogation process to create a comprehensive plan for a new feature or task.

## Your Mission

Conduct a thorough interrogation of the user to extract every detail needed for implementation. You will ask questions in phases, building a complete picture before generating the plan.

## Phase 1: Core Identity

Ask the user:
1. **What is the name of this feature/task?** (This will be the folder name, use kebab-case)
2. **In one sentence, what problem does this solve?**
3. **Who are the primary users of this feature?**

Wait for answers before proceeding.

## Phase 2: Functional Requirements

Ask the user:
1. **What are the main user actions/flows?** (List each step the user takes)
2. **What data needs to be stored?** (Entities, fields, relationships)
3. **What are the inputs and outputs?**
4. **Are there any integrations with external services or existing systems?**

Wait for answers before proceeding.

## Phase 3: Technical Context

Ask the user:
1. **What tech stack constraints exist?** (Framework, language, database, etc.)
2. **Are there existing patterns in the codebase to follow?**
3. **What are the performance requirements?**
4. **What security considerations apply?**

Wait for answers before proceeding.

## Phase 4: Edge Cases & Validation

Ask the user:
1. **What happens when things go wrong?** (Error states, fallbacks)
2. **What are the validation rules?**
3. **What are the edge cases to handle?**
4. **What should NOT happen?** (Anti-requirements)

Wait for answers before proceeding.

## Phase 5: Success Criteria

Ask the user:
1. **How do we know this is done?** (Acceptance criteria)
2. **What does success look like?**
3. **Are there any metrics to track?**

Wait for answers before proceeding.

## Plan Generation

Once all phases are complete, generate a comprehensive `plan.md` file with this structure:

```markdown
# [Feature Name] - Implementation Plan

## Overview
[One paragraph summary of the feature]

## Problem Statement
[The problem being solved]

## Users & Personas
[Who uses this feature and how]

## Functional Requirements

### User Flows
[Detailed step-by-step flows]

### Data Model
[Entities, fields, relationships - be specific about types]

### API / Interfaces
[Endpoints, methods, request/response shapes]

### UI Components
[If applicable - screens, components, interactions]

## Technical Requirements

### Tech Stack
[Frameworks, libraries, constraints]

### Existing Patterns
[Patterns from codebase to follow]

### Performance
[Requirements and considerations]

### Security
[Authentication, authorization, data protection]

## Integrations
[External services, internal systems]

## Edge Cases & Error Handling
[What can go wrong and how to handle it]

## Validation Rules
[Input validation, business rules]

## Anti-Requirements
[What this feature should NOT do]

## Success Criteria
[Acceptance criteria checklist]

## Open Questions
[Any unresolved questions for later]
```

## File Operations

1. Create directory: `.micro-claude/[task-name]/`
2. Write the generated plan to: `.micro-claude/[task-name]/plan.md`
3. Initialize empty notes file: `.micro-claude/[task-name]/notes.md` with header
4. Confirm completion and suggest next step: `/mc:mini-explode` or `/mc:explode`

## Important Guidelines

- Ask questions in batches (per phase), don't overwhelm
- If user gives short answers, probe deeper with follow-up questions
- Capture technical details precisely (types, field names, etc.)
- Include line numbers in the plan for later reference by tasks
- Be thorough - this plan is the single source of truth for implementation
