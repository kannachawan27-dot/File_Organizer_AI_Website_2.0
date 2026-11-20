
require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "1mb" }));

// Display the existing website
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/app.js", (req, res) => {
  res.sendFile(path.join(__dirname, "app.js"));
});

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, "style.css"));
});

// AI assistant endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: "OpenAI API key is not configured."
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6.2-astra",
      instructions:
        "You are File Organizer AI, a helpful assistant. Help users understand, search, and organize files. Never claim to have moved, deleted, or modified files. Give clear and simple instructions.",
      input: message
    });

    res.json({
      reply: response.output_text
    });

  } catch (error) {
    console.error("AI Error:", error.message);

    res.status(500).json({
      error: "Sorry, the AI assistant could not respond. Please try again."
    });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`File Organizer AI server running at http://localhost:${PORT}`);
});
