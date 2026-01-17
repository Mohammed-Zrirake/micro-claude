
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
require("dotenv").config();

async function main() {
  let apiKey = process.env.GOOGLE_API_KEY;
  
  // Try to find API key in global Gemini CLI settings if not in env
  if (!apiKey) {
    try {
      const path = require("path");
      const homeDir = require("os").homedir();
      const settingsPath = path.join(homeDir, ".gemini", "settings.json");
      
      if (fs.existsSync(settingsPath)) {
        const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
        if (settings.apiKey) {
          apiKey = settings.apiKey;
        }
      }
    } catch (e) {
      // Ignore errors
    }
  }

  if (!apiKey) {
    console.error("Error: GOOGLE_API_KEY not found.");
    console.error("Please set it in .env, or run 'gemini auth' using the official CLI.");
    process.exit(1);
  }

  // Read prompt from stdin
  const prompt = fs.readFileSync(0, "utf-8");

  if (!prompt || prompt.trim().length === 0) {
    console.error("Error: Empty prompt received from stdin.");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    // Simple retry logic for rate limits (Free Tier has RPM limits)
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Output raw text to stdout
        console.log(text);
        process.exit(0);
        
      } catch (error) {
        if (error.status === 429) { // Too Many Requests
          attempts++;
          console.error(`Rate limit hit (429). Retrying in ${attempts * 2}s...`);
          await new Promise(resolve => setTimeout(resolve, attempts * 2000));
        } else {
          throw error;
        }
      }
    }
    
    console.error("Error: Failed after max retries due to rate limits.");
    process.exit(1);

  } catch (error) {
    console.error("Error generating content:", error.message);
    process.exit(1);
  }
}

main();
