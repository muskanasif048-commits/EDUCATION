import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Helper to initialize Gemini SDK safely and lazy-loaded
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured or uses placeholder. Using simulated responses.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Check server health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: AI English Teacher Chatbot Proxy
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userProfile } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages structure" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return beautiful educational mockup response
      const lastMsg = messages[messages.length - 1]?.content || "hello";
      let echoAnswer = "Assalam-o-Alaikum! I am **EnglishMate AI**, your dedicated English language teacher. (Note: Gemini API key is currently not configured, so I am running in Offline sandbox mode!).\n\nTo learn English effectively, keep practicing! For example, try asking me to correct a sentence or translate standard Urdu phrases like: *'How do we say main school ja raha hoon in English?'*";
      if (lastMsg.toLowerCase().includes("how") || lastMsg.toLowerCase().includes("translate")) {
        echoAnswer = "That's a fantastic question! In English, we translate that as:\n\n**'I am going to school.'**\n\n*Grammar Tip:* We use 'am' with 'I' and add '-ing' to the action verb 'go' for actions happening right now (Present Continuous tense). Would you like to practice another sentence?";
      }
      return res.json({ text: echoAnswer, simulated: true });
    }

    // Construct history for Gemini
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const systemPrompt = `You are a professional, supportive, and patient English Teacher named "EnglishMate AI".
Your target students are from Pakistan and international backgrounds.
You must be extremely friendly and positive. Frequently use bilingual English and Urdu explanations where appropriate to help Urdu-speaking learners grasp concepts faster (e.g. explain tenses, articles, and grammar rules clearly).
Encourage active output. Correct any grammatical mistakes they make politely and provide a quick translation where useful.
User profile context: level: ${userProfile?.level || "A1/Beginner"}, target: ${userProfile?.targetLanguage || "Urdu & English"}.`;

    const chatHistory = messages.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: m.content }]
    }));

    // Generate output
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...chatHistory,
        { role: "user", parts: [{ text: lastUserMessage }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text || "Please say that again." });
  } catch (error: any) {
    console.error("Express Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with AI Teacher." });
  }
});

// API: Grammar Checker with step-by-step corrections
app.post("/api/grammar", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required for grammar analysis" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Simulated response
      const hasMistake = !text.toLowerCase().includes("i am going") && (text.toLowerCase().includes("i going") || text.toLowerCase().includes("i is") || text.toLowerCase().includes("he go"));
      const simulation = {
        original: text,
        corrected: hasMistake ? text.replace(/i going/gi, "I am going").replace(/i is/gi, "I am").replace(/he go/gi, "he goes") : text,
        score: hasMistake ? 75 : 100,
        mistakes: hasMistake ? [
          {
            error: "Incorrect Helping Verb / Main Verb Verb Agreement",
            correction: "Make sure to write 'I am going' or use correct third-person form.",
            urduExplanation: "اسم (Noun) اور فعل (Verb) کی مطابقت درست نہیں ہے۔ 'I' کے ساتھ 'am' اور '-ing' استعمال کریں یا 'he/she' کے ساتھ فعل میں 's/es' لگائیں۔"
          }
        ] : [],
        explanation: "Great job! If there are errors here, they have been refined. Keep practicing simple grammatical structures.",
        simulated: true
      };
      return res.json(simulation);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Please proofread and analyze the grammar of this English passage: "${text}". Provide accurate corrections, educational explanation, and a specific focus on Urdu-speaking learner mistakes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            corrected: { type: Type.STRING },
            score: { type: Type.INTEGER, description: "Grammar score out of 100" },
            mistakes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  error: { type: Type.STRING, description: "Description of the mistake" },
                  correction: { type: Type.STRING, description: "Corrected form" },
                  urduExplanation: { type: Type.STRING, description: "Urdu translation explaining why it was wrong" }
                },
                required: ["error", "correction", "urduExplanation"]
              }
            },
            explanation: { type: Type.STRING, description: "Overall educational advice" }
          },
          required: ["original", "corrected", "score", "mistakes", "explanation"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Express Grammar Error:", error);
    res.status(500).json({ error: "Failed to analyze grammar." });
  }
});

// API: Translate English <-> Urdu
app.post("/api/translate", async (req, res) => {
  try {
    const { text, direction } = req.body; // direction: "en_to_ur" | "ur_to_en" | "auto"
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Mock translations
      const isUrdu = text.match(/[\u0600-\u06FF]/);
      const translated = isUrdu ? "I am learning English with EnglishMate AI." : "میں انگلش میٹ اے آئی کے ساتھ انگریزی سیکھ رہا ہوں۔";
      const romanized = isUrdu ? "Mein EnglishMate AI ke sath Angrezi seekh raha hoon." : "Learn English step by step.";
      return res.json({
        original: text,
        translated,
        romanized,
        grammarTips: "Continuous training builds durable memory tags. Try writing daily notes!",
        simulated: true
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Translate the following statement: "${text}". Direction is: ${direction || "auto"}. Return both Urdu translations, Romanized Urdu (Urdu written in English script), and a helpful English learning tip.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            translated: { type: Type.STRING, description: "The direct translated equivalent" },
            romanized: { type: Type.STRING, description: "Romanized Urdu pronounciation script or romanized english" },
            grammarTips: { type: Type.STRING, description: "Educational tip or word breakdown for students" }
          },
          required: ["original", "translated", "romanized", "grammarTips"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Express Translate Error:", error);
    res.status(500).json({ error: "Failed to perform translation." });
  }
});

// API: Quiz Generator (Multiple Choice MCQs)
app.post("/api/quizzes", async (req, res) => {
  try {
    const { topic, level } = req.body; // help customize topic (e.g. tenses, modal verbs, prepositions)
    const activeTopic = topic || "Prepositions and Common Idioms";
    const activeLevel = level || "Intermediate";

    const ai = getGeminiClient();
    if (!ai) {
      // Mock quiz generator
      const simulation = {
        quizTitle: `${activeLevel} Quiz: ${activeTopic}`,
        questions: [
          {
            id: "q1",
            question: "Choose the correct sentence: She is married _____ a doctor (and he is nice).",
            options: ["with", "to", "by", "for"],
            correctIndex: 1,
            explanation: "In English we say 'married TO' someone, not 'married with'.",
            urduExplanation: "انگریزی میں کسی سے شادی شدہ ہونے کے لیے 'married to' کا استعمال کیا جاتا ہے، 'married with' بولنا غلط ہے۔"
          },
          {
            id: "q2",
            question: "Complete the phrase: 'I look forward to ______ you soon.'",
            options: ["see", "seeing", "seen", "saw"],
            correctIndex: 1,
            explanation: "The preposition 'to' here is followed by a gerund (-ing form), not simple infinitive.",
            urduExplanation: "'look forward to' کے بعد ہمیشہ ورب کی 'ing' والی شکل (gerund) آتی ہے۔"
          },
          {
            id: "q3",
            question: "Translate this correctly: 'وہ دو گھنٹوں سے پڑھ رہا ہے۔'",
            options: [
              "He is reading from two hours.",
              "He has been reading for two hours.",
              "He was reading since two hours.",
              "He reads for two hours."
            ],
            correctIndex: 1,
            explanation: "We use Present Perfect Continuous ('has been + reading') with 'for' for a length of time.",
            urduExplanation: "وقت کے دورانیے (for two hours) کے لیے 'has been' اور ورب کے ساتھ '-ing' کا استعمال کیا جاتا ہے۔"
          }
        ],
        simulated: true
      };
      return res.json(simulation);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a high-quality MCQ quiz with exactly 5 multiple choice questions in JSON about: "${activeTopic}" at a "${activeLevel}" difficulty. Include explanations in both English and Urdu.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options"
                  },
                  correctIndex: { type: Type.INTEGER, description: "0-based index of correct option" },
                  explanation: { type: Type.STRING, description: "Detailed english grammatical reason" },
                  urduExplanation: { type: Type.STRING, description: "Concept explained clearly in Urdu" }
                },
                required: ["id", "question", "options", "correctIndex", "explanation", "urduExplanation"]
              }
            }
          },
          required: ["quizTitle", "questions"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Express Quiz Error:", error);
    res.status(500).json({ error: "Failed to generate quiz." });
  }
});

// API: Speech Pronunciation Guide (Text to Speech proxy using TTS)
app.post("/api/speech", async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required for audio pronunciation" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured. Speech synthesis requires a live API key connect.", simulated: true });
    }

    // TTS execution using gemini-3.1-flash-tts-preview
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say clearly and slowly for English students to repeat: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || "Kore" } // Kore, Charon, Fenrir, Zephyr, Puck
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio payload returned from Gemini TTS API.");
    }

    res.json({ audio: base64Audio, format: "pcm", sampleRate: 24000 });
  } catch (error: any) {
    console.error("Express Speech Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate pronunciation guide." });
  }
});


// Serve static frontend files in production, or mount Vite dev server in development
async function startViteMiddleware() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static production assets active on dist/.");
  }
}

startViteMiddleware().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}/`);
  });
});
