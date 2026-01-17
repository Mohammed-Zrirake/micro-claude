# Gemini Support for Micro-Claude

This project has been adapted to support **Google Gemini** models as an alternative to Claude. This allows users to leverage Gemini's large context window and free tier for the "Micro-Claude" workflow.

## 🚀 How to Use Gemini

You can now switch between Claude and Gemini at any time.

### 1. Authentication
The project integrates with the official `@google/gemini-cli`.

**Option A: Official CLI (Recommended)**
1. Install the official CLI: `npm install -g @google/gemini-cli`
2. Login: `gemini auth`
3. The project will automatically detect your credentials in `~/.gemini/settings.json`.

**Option B: Environment Variable**
1. Copy `.env.example` to `.env`.
2. Add your key: `GOOGLE_API_KEY=your_key_here`.

### 2. Interactive Commands
Instead of using the Claude-specific slash commands (like `/mc:interrogate`), use the new Node.js wrapper:

```bash
# Instead of /mc:interrogate
node gemini-interact.js interrogate

# Instead of /mc:explode
node gemini-interact.js explode
```

### 3. Autonomous Loop (Ralph)
To run the `ralph.sh` autonomous implementation loop with Gemini:

```bash
# Set the provider to Gemini for this session
export MC_PROVIDER=gemini

# Run Ralph as usual
./ralph.sh <task-name>
```
*(To switch back to Claude, just unset the variable or set it to `claude`)*

---

## 🛠️ Migration & Technical Details

The following changes were implemented to enable "Micro-Gemini" without breaking existing Claude functionality.

### New Components

#### 1. `gemini-runner.js`
A lightweight, automation-friendly CLI runner designed for the `ralph.sh` loop.
- **Purpose**: Replaces `claude -p` for autonomous tasks.
- **Features**: 
  - Reads prompts from `stdin`.
  - Outputs raw model text to `stdout` (no "Thinking..." artifacts).
  - Handles Gemini Free Tier rate limits (429 errors) with automatic backoff/retry.

#### 2. `gemini-interact.js`
A wrapper script to simulate the "Slash Command" experience.
- **Purpose**: Host for interactive tasks like Interrogation and Planning.
- **Functionality**:
  - Reads the system prompts from `.claude/commands/mc-*.md`.
  - Starts a persistent `GoogleGenerativeAI` chat session.
  - Mimics the persona defined in the markdown files.

### Modified Components

#### 3. `ralph.sh`
Updated the shell script to support a Dual Provider architecture.
- **Logic**: Checks `MC_PROVIDER` environment variable.
- **Branching**:
  - If `gemini`: Pipes prompt to `node gemini-runner.js`.
  - If `claude`: Pipes prompt to `claude -p` (original behavior).
- **Safety**: Includes provider-specific dependency checks (checks for `node` vs `claude` CLI).

#### 4. `.gitignore`
Updated to exclude sensitive files:
- `.env` / `.env.local`
- `.gemini/` (local settings folder)

#### 5. `package.json`
- Added `@google/generative-ai` and `dotenv` to dependencies.
- Kept `node >= 14` engine requirement (compatible with existing project).

## 🔮 Future Improvements
- Create a unified `bin/micro-ai` CLI to wrap both `gemini-interact.js` and the Claude CLI commands into a single entry point (e.g. `micro-ai interrogate`).
