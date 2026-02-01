import "dotenv/config";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
groq.models.list().then(m => {
    console.log("MODELS:");
    console.log(m.data.map(d => d.id).join(", "));
}).catch(e => console.error(e));
