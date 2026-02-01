import Groq from "groq-sdk";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function listModels() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY not found in .env.local");
    return;
  }

  const groq = new Groq({ apiKey });
  
  try {
    const models = await groq.models.list();
    console.log("Available Models on Groq:");
    models.data.forEach(m => {
        console.log(`- ${m.id} (Created: ${new Date(m.created * 1000).toLocaleDateString()})`);
    });
  } catch (err: any) {
    console.error("Failed to list models:", err.message);
  }
}

listModels();
