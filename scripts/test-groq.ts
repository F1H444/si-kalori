import Groq from "groq-sdk";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function testGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY not found in .env.local");
    return;
  }

  const groq = new Groq({ apiKey });
  console.log("Testing Groq with model: meta-llama/llama-4-scout-17b-16e-instruct...");
  
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "user", content: "Say hello!" }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
    });
    console.log("Response:", completion.choices[0]?.message?.content);
    console.log("Groq is working!");
  } catch (err: any) {
    console.error("Groq Test Failed:", err.message);
    if (err.message.includes("404")) {
        console.log("Model might be incorrect. Trying llama-3.1-8b-instant...");
        try {
            const completion2 = await groq.chat.completions.create({
                messages: [{ role: "user", content: "Say hello!" }],
                model: "llama-3.1-8b-instant",
            });
            console.log("Response (Llama 3.1):", completion2.choices[0]?.message?.content);
        } catch (err2: any) {
            console.error("Llama 3.1 also failed:", err2.message);
        }
    }
  }
}

testGroq();
