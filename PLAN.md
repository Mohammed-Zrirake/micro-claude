# Micro-Claude Method - Implementation Plan

## Philosophy

Micro-claude is a structured AI-driven development method that:
1. **Interrogates** the user deeply to extract a comprehensive plan
2. **Explodes** the plan into structured JSON tasks at different granularity levels
3. **Implements** tasks autonomously while maintaining detailed notes

The model can loop and pick any task it sees fit based on dependencies and context.

---

## Directory Structure

```
.micro-claude/
└── [task-name]/              # e.g., ai-store, auth-system
    ├── plan.md               # Comprehensive plan from interrogation
    ├── prd.json              # Task definitions (mini or full exploded)
    └── notes.md              # Implementation notes referencing task IDs
```

---

## Slash Commands

### 1. `/mc:interrogate`

**Purpose**: Deep user interrogation to create comprehensive plan

**Flow**:
1. Ask user for the feature/task name
2. Ask series of structured questions:
   - What is the core problem being solved?
   - Who are the users/personas?
   - What are the expected outcomes?
   - What are the constraints (tech stack, time, dependencies)?
   - What integrations are needed?
   - What's the data model?
   - What are the edge cases?
   - What's the success criteria?
3. Generate comprehensive `plan.md` with all gathered information
4. Create `.micro-claude/[task-name]/` directory
5. Save `plan.md` to the task folder

**Output**: `.micro-claude/[task-name]/plan.md`

---

### 2. `/mc:mini-explode`

**Purpose**: Explode plan into high-level PRD tasks (bigger chunks)

**Flow**:
1. Ask which task to explode (or detect from context)
2. Read `.micro-claude/[task-name]/plan.md`
3. Analyze and break down into major components:
   - Database/Schema tasks
   - Backend/API tasks
   - Frontend/UI tasks
   - Integration tasks
   - Testing tasks
4. Generate `prd.json` with high-level tasks

**JSON Structure**:
```json
{
  "project": "Task Name",
  "plan": "plan.md",
  "granularity": "mini",
  "tasks": [
    {
      "id": 1,
      "title": "Database Schema & Models",
      "description": "Full description of what this encompasses",
      "category": "backend",
      "dependencies": [],
      "status": "pending"
    }
  ]
}
```

**Output**: `.micro-claude/[task-name]/prd.json` (mini granularity)

---

### 3. `/mc:explode`

**Purpose**: Decompose into fine-grained tasks with line references (like zinpage)

**Flow**:
1. Ask which task to explode (or detect from context)
2. Read `.micro-claude/[task-name]/plan.md`
3. Break down into atomic implementation tasks
4. Each task references specific sections in `plan.md` (from/to lines)
5. Generate detailed `prd.json`

**JSON Structure**:
```json
{
  "project": "Task Name",
  "plan": "plan.md",
  "granularity": "full",
  "tasks": [
    {
      "id": 1,
      "title": "Create stores table schema",
      "description": "Define the database schema for stores",
      "category": "database",
      "from": 45,
      "to": 62,
      "dependencies": [],
      "status": "pending",
      "files": []
    }
  ]
}
```

**Output**: `.micro-claude/[task-name]/prd.json` (full granularity)

---

### 4. `/mc:implement`

**Purpose**: Implement tasks autonomously with notes tracking

**Flow**:
1. Ask which task to work on (or auto-select based on dependencies)
2. Read `prd.json` to get task list and statuses
3. Read `plan.md` section referenced by task (from/to lines)
4. Read `notes.md` for context from previous implementations
5. Implement the task
6. Update `notes.md` with:
   - Task ID reference
   - What was implemented
   - Files created/modified
   - Key decisions made
   - Gotchas for future tasks
7. Update `prd.json` task status to "done"
8. Optionally continue to next task or ask user

**Notes Structure** (`notes.md`):
```markdown
# Implementation Notes - [Task Name]

## Task #1: Create stores table schema
**Status**: Completed
**Files**: db/schema.ts
**Notes**:
- Added stores table with JSONB content column
- Used uuid for primary key
- Added unique constraint on userId

## Task #2: Define TypeScript types
**Status**: Completed
**Files**: types/store.ts
**Notes**:
- Created StoreContent interface
- Used Zod for runtime validation
- Exports both type and schema
```

---

## File Specifications

### plan.md
- Comprehensive feature specification
- Sections for: Overview, Users, Requirements, Data Model, API, UI, Edge Cases, Success Criteria
- Line numbers are important (referenced by tasks)

### prd.json
- Machine-readable task list
- Two granularity levels: "mini" (high-level) and "full" (atomic)
- Status tracking: "pending", "in_progress", "done", "blocked"
- Dependency tracking between tasks
- Line references to plan.md for context

### notes.md
- Human and AI readable implementation notes
- Organized by task ID
- Contains: files modified, decisions, gotchas, learnings
- Model reads this before implementing related tasks

---

## Implementation Steps

1. **Create directory structure**
   - `.micro-claude/` base directory
   - Slash commands in `.claude/commands/`

2. **Implement `/mc:interrogate`** (`.claude/commands/mc-interrogate.md`)
   - Question flow logic
   - Plan generation template
   - File creation

3. **Implement `/mc:mini-explode`** (`.claude/commands/mc-mini-explode.md`)
   - Plan parsing
   - High-level task extraction
   - PRD JSON generation

4. **Implement `/mc:explode`** (`.claude/commands/mc-explode.md`)
   - Detailed plan parsing
   - Atomic task extraction with line references
   - Fine-grained PRD JSON generation

5. **Implement `/mc:implement`** (`.claude/commands/mc-implement.md`)
   - Task selection logic
   - Context loading (plan section + notes)
   - Implementation workflow
   - Notes updating
   - Status tracking

---

## Key Design Decisions

1. **Separate granularity levels** - Mini for overview, Full for implementation
2. **Line references** - Tasks point to exact plan sections for context
3. **Notes as memory** - Model reads notes before implementing related tasks
4. **Flexible task selection** - Model can pick any ready task (dependencies resolved)
5. **Single folder per feature** - All files for a feature in one place
6. **Status in JSON** - Machine-readable progress tracking
