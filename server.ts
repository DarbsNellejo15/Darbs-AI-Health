import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", name: "Darbs AI Assistant API" });
});

// Main Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, persona, temperature, enableWebSearch } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();

    // Healthcare Persona System Instructions
    let systemInstruction = `You are Darbs, a dedicated, empathetic, and knowledgeable Healthcare AI Assistant.
Your primary role is to help users understand health concepts, explain medical terminology, provide general wellness and nutrition advice, clarify symptoms, and offer healthy lifestyle tips.

CRITICAL MEDICAL DISCLAIMER RULES:
1. You are an AI assistant, NOT a licensed doctor or healthcare medical provider.
2. ALWAYS include a brief, respectful medical disclaimer when providing health or symptom analysis, reminding the user to consult a qualified physician or healthcare provider for medical diagnosis, treatment, or emergencies.
3. If the user describes emergency symptoms (e.g., severe chest pain, sudden difficulty breathing, severe bleeding, stroke symptoms), URGE THEM IMMEDIATELY to call emergency services (like 911) or go to the nearest emergency room.

FORMATTING RULES:
- Provide clean, easy-to-read Markdown with bullet points, bold key terms, and clear sections.
- Keep explanations simple, reassuring, empathetic, and patient-centered.`;

    if (persona === "symptom_guide") {
      systemInstruction += " Focus on structured symptom breakdown, potential non-diagnostic questions to ask a doctor, and red-flag symptoms requiring immediate medical evaluation.";
    } else if (persona === "medical_explainer") {
      systemInstruction += " Focus on demystifying complex medical jargon, lab test results, and drug classifications into plain, easy-to-understand everyday language.";
    } else if (persona === "wellness_coach") {
      systemInstruction += " Focus on preventive health, balanced nutrition, sleep hygiene, daily physical activity, and stress management guidance.";
    } else if (persona === "mental_health") {
      systemInstruction += " Focus on supportive, compassionate mental well-being techniques, mindfulness practices, stress reduction, and professional counseling resources.";
    }

    // Convert message history to Gemini contents format
    // Each message object in Gemini format: { role: 'user' | 'model', parts: [{ text: '...' }] }
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const config: any = {
      systemInstruction,
      temperature: typeof temperature === "number" ? temperature : 0.7,
    };

    if (enableWebSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config,
    });

    const replyText = response.text || "I'm sorry, I couldn't generate a response.";

    // Extract search grounding metadata if present
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web.title || chunk.web.uri,
        url: chunk.web.uri,
      }));

    res.json({
      reply: replyText,
      sources: webSources,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: error.message || "Failed to communicate with Darbs AI.",
    });
  }
});

// Image Generation Endpoint
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Image prompt is required." });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    let imageUrl: string | null = null;
    let caption: string | null = null;

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || "image/png";
        imageUrl = `data:${mimeType};base64,${base64Data}`;
      } else if (part.text) {
        caption = part.text;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: "No image was generated by model." });
    }

    res.json({ imageUrl, caption });
  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    res.status(500).json({
      error: error.message || "Failed to generate image.",
    });
  }
});

// Text-To-Speech Endpoint
app.post("/api/text-to-speech", async (req, res) => {
  try {
    const { text, voiceName = "Kore" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    // Truncate long text to prevent TTS overload
    const cleanText = text.slice(0, 1000);

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Read cleanly: ${cleanText}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: "Failed to generate audio output." });
    }

    res.json({ audioBase64: base64Audio });
  } catch (error: any) {
    console.error("Error in /api/text-to-speech:", error);
    res.status(500).json({
      error: error.message || "Failed to generate text-to-speech.",
    });
  }
});

// Smart Analysis / Prompt Polish Tool Endpoint
app.post("/api/smart-tool", async (req, res) => {
  try {
    const { toolType, input } = req.body;
    if (!input) return res.status(400).json({ error: "Input text required." });

    const ai = getGeminiClient();
    let prompt = "";

    if (toolType === "enhance_prompt") {
      prompt = `Enhance and optimize the following prompt for an AI model to produce maximum quality, detail, and clarity: "${input}"`;
    } else if (toolType === "summarize") {
      prompt = `Provide a concise executive summary, key takeaways, and action items for the following text:\n\n${input}`;
    } else if (toolType === "code_explain") {
      prompt = `Analyze and explain this code in plain English. Breakdown key functions, potential edge cases, and optimization ideas:\n\n${input}`;
    } else if (toolType === "flashcards") {
      prompt = `Generate 5 high-yield study flashcards based on this text. Return as JSON array of objects with "question" and "answer" properties:\n\n${input}`;
    } else {
      prompt = `Analyze the following content and provide helpful key insights:\n\n${input}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Error in /api/smart-tool:", error);
    res.status(500).json({ error: error.message || "Smart tool execution failed." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Darbs AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
