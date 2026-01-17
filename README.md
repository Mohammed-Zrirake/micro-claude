# Micro-Claude

A structured AI-driven development method for Claude Code that interrogates, plans, and implements features through task decomposition.

## Philosophy

Micro-Claude transforms vague feature requests into well-structured implementation plans:

1. **Interrogate** - Deep questioning to extract comprehensive requirements
2. **Explode** - Break down plans into trackable tasks with line references
3. **Implement** - Execute tasks while maintaining detailed notes

The model can loop and pick any task it sees fit based on context and dependencies.

## Why Detailed Plans Matter

The quality of your implementation depends entirely on the quality of your plan. During `/mc:interrogate`:

- **Be thorough** - Answer every question with specific details
- **Include examples** - Show expected inputs, outputs, edge cases
- **Define data models precisely** - Field names, types, constraints
- **Specify integrations** - APIs, services, existing code patterns

A detailed plan means fewer mistakes, less back-and-forth, and better results.

## Ralph Loop (Autonomous Implementation)

Micro-Claude includes `ralph.sh` - an autonomous implementation loop based on the [Ralph Wiggum technique](https://ghuntley.com/ralph/). Unlike `/mc:implement` which runs in a single session, Ralph runs each task in a **fresh context window**, avoiding the quality degradation that comes from context accumulation.

### Why Ralph?

| `/mc:implement` | `ralph.sh` |
|-----------------|------------|
| Single context window | Fresh context per task |
| Quality degrades over time | Stays in "smart zone" |
| Interactive (requires approval) | Fully autonomous |
| Good for small task sets | Great for 20+ tasks |

### Usage

```bash
# List available tasks
./ralph.sh

# Run autonomous loop on a specific task
./ralph.sh my-feature

# Limit to 20 iterations
./ralph.sh my-feature 20
```

### How It Works

```
┌─────────────────────────────────────────────────┐
│  ./ralph.sh my-feature                          │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Check: Any pending tasks in prd.json?          │
│  ├─ No  → Exit with success                     │
│  └─ Yes → Continue                              │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Run Claude with fresh context                  │
│  → Picks next pending task                      │
│  → Implements it                                │
│  → Updates notes.md and prd.json                │
│  → Exits                                        │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Loop restarts → Fresh context for next task    │
└─────────────────────────────────────────────────┘
```

### Requirements

- `jq` - JSON processor (`brew install jq` or `apt install jq`)
- `claude` CLI - (`npm install -g @anthropic-ai/claude-code`)

## Installation

```bash
npx micro-claude
```

This installs the slash commands in your project's `.claude/commands/` directory.

## 🤖 Gemini Support (New!)

Micro-Claude now supports **Google Gemini** as a drop-in replacement for Claude.

**Comparison:**
- **Claude** (Default): Requires `claude` CLI and paid Anthropic API.
- **Gemini**: Can use Free Tier, official `gemini` CLI integration, and huge context window.

### Setup for Gemini

1. **Install Official CLI**: `npm install -g @google/gemini-cli`
2. **Configure Auth**:
   - **Option A (Recommended)**: Run `gemini auth` to login globally.
   - **Option B**: Copy `.env.example` to `.env` and add your `GOOGLE_API_KEY`.
3. **Run**: Use the Gemini wrappers instead of Claude commands.

```bash
# Interactive Mode
node gemini-interact.js interrogate

# Autonomous Loop (Ralph)
export MC_PROVIDER=gemini
./ralph.sh <task-name>
```

See [Gemini_Support.md](Gemini_Support.md) for full documentation.

## Commands

### `/mc:interrogate`

Starts a deep interrogation session to create a comprehensive plan.

**Flow:**
1. Asks for feature/task name
2. Phases of questions: Core Identity, Functional Requirements, Technical Context, Edge Cases, Success Criteria
3. Generates `plan.md` with all specifications

**Output:** `.micro-claude/[task-name]/plan.md`

### `/mc:mini-explode`

Explodes the plan into high-level tasks (bigger chunks).

**Output:** `.micro-claude/[task-name]/prd.json` with ~5-15 tasks

### `/mc:explode`

Explodes the plan into fine-grained atomic tasks.

**Output:** `.micro-claude/[task-name]/prd.json` with ~20-50 tasks

### `/mc:implement`

Implements tasks in a loop while maintaining notes.

**Flow:**
1. Reads `prd.json` and `notes.md` for context
2. Picks or suggests next task
3. Reads relevant section from `plan.md` (using `from`/`to` line numbers)
4. Implements the task
5. Updates `notes.md` with implementation details
6. Marks task as `done` in `prd.json`
7. Loops or exits

### `/mc:mutate`

Extends, modifies, or fixes an existing plan and PRD through interactive dialogue.

**Use when:**
- You forgot to include something in the original plan
- Requirements changed and you need to update the spec
- You discovered a mistake that needs correction
- A section needs more detail or clarification

**Flow:**
1. Loads existing `plan.md`, `prd.json`, and `notes.md`
2. Shows current state summary
3. Asks what you want to change (add/modify/remove/fix/clarify)
4. Asks targeted follow-up questions based on change type
5. Shows proposed changes with before/after comparison
6. Applies changes to all artifacts
7. Logs mutation in `notes.md` for traceability
8. Loops until you're done making changes

## File Structure

```
.micro-claude/
└── [task-name]/
    ├── plan.md     # Comprehensive specifications from interrogation
    ├── prd.json    # Task definitions with line references
    └── notes.md    # Implementation notes by task ID
```

### prd.json Format

```json
{
  "project": "feature-name",
  "document": "plan.md",
  "granularity": "full",
  "tasks": [
    {
      "id": 1,
      "title": "Create database schema",
      "description": "Add tables for the feature",
      "from": 45,
      "to": 62,
      "done": false
    }
  ]
}
```

### notes.md Format

```markdown
# Implementation Notes - Feature Name

## Task #1: Create database schema
**Status**: Completed
**Files**: db/schema.ts
**Notes**:
- Added stores table with JSONB content
- Used uuid for primary key
```

## Workflow Example

```bash
# 1. Start interrogation
/mc:interrogate
# Answer all questions about your feature
# → Creates .micro-claude/my-feature/plan.md

# 2. Explode into tasks
/mc:explode
# → Creates .micro-claude/my-feature/prd.json

# 3. Implement (choose one)
./ralph.sh my-feature     # Autonomous (recommended for 20+ tasks)
/mc:implement             # Interactive (good for small task sets)

# 4. Forgot something? Mutate the plan
/mc:mutate
# → Add/modify/remove requirements interactively
# → Updates plan.md, prd.json, and notes.md
```

## License

MIT
