import Groq from "groq-sdk";

// Initialize Groq SDK with key from environment variables
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  // CORS setup (allow requests from the frontend)
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, tools, tool_choice } = req.body;

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array." });
    }

    // Call Groq securely from the server
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messages,
      tools: tools,
      tool_choice: tool_choice || "auto",
      temperature: 0.7,
      max_tokens: 350,
    });

    // Send result back to the frontend
    res.status(200).json(response);
    
  } catch (error) {
    console.error("Serverless Groq Error:", error);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
}
