import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  tool,
  createAgent,
} from "langchain";
import { ChatMistralAI } from "@langchain/mistralai";
import * as z from "zod";
import { searchWeb } from "./internet.service.js";
import { retrieveContext } from "./rag.service.js"; // 🔥 RAG

// =====================
// MODELS
// =====================

// Gemini (optional fallback or future use)
const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

// Mistral (main model)
const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

// =====================
// TOOLS (Internet Search)
// =====================

const searchInternetTool = tool(
  async ({ query }) => {
    const result = await searchWeb(query);
    return JSON.stringify(result);
  },
  {
    name: "search_web",
    description:
      "Use this tool to search the internet for real-time or unknown information",
    schema: z.object({
      query: z.string(),
    }),
  }
);

// =====================
// AGENT
// =====================

const agent = createAgent({
  model: mistralModel,
  tools: [searchInternetTool],
});

// =====================
// MAIN FUNCTION (RAG + AGENT)
// =====================

export async function generateResponse(messages, userId) {
  try {
    if (!messages || messages.length === 0) {
      return "No messages provided.";
    }

    const lastMessage = messages[messages.length - 1].content;

    // =====================
    // 🔥 STEP 1: RAG Retrieval
    // =====================
    let context = "";

    try {
      context = await retrieveContext(lastMessage, userId);
    } catch (err) {
      console.error("RAG error:", err);
      context = "";
    }

    console.log("Retrieved Context:", context);

    // =====================
    // 🔥 STEP 2: Build System Prompt
    // =====================
    const systemPrompt = `
You are a smart AI assistant.

You have access to:
1. Document knowledge (RAG context)
2. Internet search tool

-------------------------
DOCUMENT CONTEXT:
${context || "No relevant document context found."}
-------------------------

Rules:
- If answer is in document context → use it
- If not → answer normally
- If question needs latest info → use search tool
- If unsure → say "I don't know"
`;

    // =====================
    // 🔥 STEP 3: Convert Messages
    // =====================
    const formattedMessages = [
      new SystemMessage(systemPrompt),

      ...messages.map((msg) => {
        if (msg.role === "user") {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      }),
    ];

    // =====================
    // 🔥 STEP 4: Agent Execution
    // =====================
    const response = await agent.invoke({
      messages: formattedMessages,
    });

    const finalMessage =
      response.messages[response.messages.length - 1];

    return finalMessage.text;
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Something went wrong while generating response.";
  }
}

// =====================
// CHAT TITLE GENERATION
// =====================

export async function generateChatTitle(message) {
  try {
    const response = await mistralModel.invoke([
      new SystemMessage(`
You generate short and clear chat titles (2–4 words).
Make them meaningful and relevant.
      `),
      new HumanMessage(`Message: "${message}"`),
    ]);

    return response.text;
  } catch (error) {
    console.error("Title generation error:", error);
    return "New Chat";
  }
}