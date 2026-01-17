
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
require("dotenv").config();

async function main() {
  let apiKey = process.env.GOOGLE_API_KEY;

  // Try to find API key in global Gemini CLI settings if not in env
  if (!apiKey) {
    try {
      const homeDir = require("os").homedir();
      // Check standard locations for gemini cli settings
      const settingsPaths = [
        path.join(homeDir, ".gemini", "settings.json"),
        path.join(homeDir, ".gemini", ".env") // Some versions might use .env
      ];

      for (const settingsPath of settingsPaths) {
        if (fs.existsSync(settingsPath)) {
          if (settingsPath.endsWith(".json")) {
            const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
            if (settings.apiKey) {
              apiKey = settings.apiKey;
              break;
            }
          } else if (settingsPath.endsWith(".env")) {
             // Simple fallback for .env parsing
             const content = fs.readFileSync(settingsPath, "utf-8");
             const match = content.match(/GOOGLE_API_KEY=(.*)/);
             if (match && match[1]) {
               apiKey = match[1].trim();
               break;
             }
          }
        }
      }
    } catch (e) {
      // Ignore errors reading global settings
    }
  }

  if (!apiKey) {
    console.error("Error: GOOGLE_API_KEY not found.");
    console.error("Please set it in .env, or run 'gemini auth' using the official CLI.");
    process.exit(1);
  }

  const commandName = process.argv[2];
  if (!commandName) {
    console.error("Usage: node gemini-interact.js <command_name>");
    console.error("Example: node gemini-interact.js interrogate");
    process.exit(1);
  }

  // Map "interrogate" -> "mc-interrogate.md"
  // Map "mc:interrogate" -> "mc-interrogate.md"
  const cleanName = commandName.replace("mc:", "").replace("mc-", ""); 
  const filename = `mc-${cleanName}.md`;
  const promptsDir = path.join(process.cwd(), ".claude", "commands");
  const promptPath = path.join(promptsDir, filename);

  if (!fs.existsSync(promptPath)) {
    console.error(`Error: Command file not found at ${promptPath}`);
    process.exit(1);
  }

  const systemInstruction = fs.readFileSync(promptPath, "utf-8");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro", 
      systemInstruction: systemInstruction
  });

  const chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 8000,
    },
  });

  console.log(`\x1b[36mStarting interactive session for: ${cleanName}\x1b[0m`);
  console.log(`\x1b[90m(Type 'exit' or 'quit' to stop)\x1b[0m\n`);

  // Initial turn if needed, or just wait for user? 
  // Most Micro-Claude prompts act as a persona that waits for user input or greeting.
  // But usually, the user invokes it and then says "Hi" or the system starts.
  // In Claude Code CLI, the prompt is the system prompt. 
  // Let's send an empty message or "Start" to kick it off if it's the very first turn?
  // Actually, usually the user types `/mc:interrogate` and then the CLI uses that as context.
  // In a pure chat, typically the USER speaks first.
  // Let's print a message saying "Ready. Type your first message (e.g. 'Start')."

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\x1b[32mYou: \x1b[0m'
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      rl.close();
      return;
    }

    if (input) {
      try {
        process.stdout.write('\x1b[33mGemini: \x1b[0mThinking...');
        const result = await chat.sendMessage(input);
        const response = await result.response;
        const text = response.text();
        
        // Clear "Thinking..." line
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        
        console.log(`\x1b[33mGemini: \x1b[0m${text}\n`);
      } catch (error) {
        console.error(`\nError: ${error.message}\n`);
      }
    }
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\nSession ended.');
    process.exit(0);
  });
}

main();
