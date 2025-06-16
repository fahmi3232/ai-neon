import express from "express";
import cors from "cors";
import { GoogleGenAI, Modality } from "@google/genai";
import * as dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { addWatermark } from "./watermark.js";
import fetch  from "node-fetch"



dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// GENERATOR IMAGE
app.post("/generate-image", async (req, res) => {
  try {
    const { prompt, size } = req.body;

    let aspectNote = "";
    if (size === "landscape") aspectNote = "in 16:9 landscape format";
    else if (size === "portrait") aspectNote = "in 9:16 portrait format";
    else if (size === "square") aspectNote = "in 1:1 square format";

    const finalPrompt = `${prompt} ${aspectNote}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: finalPrompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const parts = response.candidates[0].content.parts;
    let result = { text: "", image: "" };

    for (const part of parts) {
      if (part.text) result.text = part.text;
      else if (part.inlineData) result.image = part.inlineData.data;
    }

    // Buffer dan watermark
    const imageBuffer = Buffer.from(result.image, "base64");
    const logoPath = path.join(__dirname,"public", "images", "logo.png");
    const watermarkedBuffer = await addWatermark(imageBuffer, logoPath);
    result.image = watermarkedBuffer.toString("base64");

    res.json(result);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

// GENERATE BLOG
app.post('/generate-blog', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
// 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
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.YOUR_SITE_URL,
        "X-Title": process.env.YOUR_SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-distill-qwen-14b:free",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    console.log('data', data)
    const result = data.choices?.[0]?.message?.content || "No content generated.";

    res.json({ blog: result });
  } catch (error) {
    console.error("Error fetching from OpenRouter:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Generate Keyword dan SEO
app.post("/generate-extra", async (req, res) => {
  const { type, title } = req.body;

  if (!title || !type) {
    return res.status(400).json({ error: "Title and type are required" });
  }

  const prompt = type === "cta"
    ? `Buat satu kalimat ajakan (Call to Action) yang menarik untuk menutup artikel berjudul "${title}".`
    : `Berikan 3 keyword SEO yang relevan untuk artikel berjudul "${title}". Pisahkan dengan koma.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY_DUA}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-distill-qwen-14b:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    console.log('data', data)
    const generated = data.choices?.[0]?.message?.content || "";

    res.json({ result: generated.trim() });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate." });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
