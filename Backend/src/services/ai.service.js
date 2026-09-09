import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage, tool, createAgent } from "langchain";
import * as z from "zod";
import { searchInternet } from "./internet.service.js";
import env from "../config/env.js";

/**
 * Create a configured Gemini chat model.
 * Throws a clear error if the API key is missing so you know exactly what
 * needs to be set in the deployment environment.
 */
function getGeminiModel(modelName = env.geminiModel) {
    if (!env.geminiApiKey) {
        throw new Error(
            "GEMINI_API_KEY is not configured. Set it in your environment variables (.env) before using chat."
        );
    }

    return new ChatGoogleGenerativeAI({
        model: modelName,
        apiKey: env.geminiApiKey,
    });
}

/**
 * Fallback chain of Gemini models. If the configured model's free-tier quota
 * is exhausted (429 / RESOURCE_EXHAUSTED), we automatically retry with the
 * next model in the list so the chat keeps working instead of failing.
 */
const FALLBACK_MODELS = [
    process.env.GEMINI_MODEL || "gemini-3.6-flash",
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-flash-latest",
];

const searchInternetTool = tool(
    searchInternet,
    {
        name: "searchInternet",
        description: "Use this tool to get the latest information from the internet.",
        schema: z.object({
            query: z.string().describe("The search query to look up on the internet.")
        })
    }
)

/**
 * Invoke the agent, automatically retrying with a different model when the
 * current model hits a quota / rate-limit error. Returns the model's text.
 */
async function invokeWithFallback(messages, systemPrompt) {
    let lastError = null;

    for (const modelName of FALLBACK_MODELS) {
        try {
            const agent = createAgent({
                model: getGeminiModel(modelName),
                tools: [searchInternetTool],
            });

            const response = await agent.invoke({
                messages: [new SystemMessage(systemPrompt), ...messages],
            });

            const lastMessage = response.messages[response.messages.length - 1];
            const content = typeof lastMessage?.text === "string"
                ? lastMessage.text
                : String(lastMessage?.content ?? "");

            if (content.trim()) {
                return content.trim();
            }

            lastError = new Error(`Model ${modelName} returned an empty response`);
        } catch (err) {
            lastError = err;
            const msg = err?.message || "";
            const isQuota = /quota|resource_exhausted|429|rate/i.test(msg);
            console.error(`AI model "${modelName}" failed${isQuota ? " (quota/rate limit)" : ""}: ${msg.slice(0, 300)}`);
            if (!isQuota) {
                // Only fall through on quota/rate-limit errors; other errors
                // (bad key, model removed...) should bubble up immediately.
                throw err;
            }
        }
    }

    throw lastError || new Error("All AI models failed");
}

export async function generateResponse(messages) {
    // Coerce mongoose documents into the plain shapes LangChain expects
    const history = messages
        .filter(msg => msg && (msg.role === "user" || msg.role === "ai"))
        .map(msg => msg.role === "user"
            ? new HumanMessage(String(msg.content ?? ""))
            : new AIMessage(String(msg.content ?? "")));

    const systemPrompt = `
        You are a helpful and precise assistant for answering questions.
        If you don't know the answer, say you don't know. 
        If the question requires up-to-date information, use the "searchInternet" tool to get the latest information from the internet and then answer based on the search results.
    `;

    const content = await invokeWithFallback(history, systemPrompt);

    return content || "I couldn't generate a response. Please try again.";
}

export async function generateTitle(message) {
    const titleSystemPrompt = `
You are an expert at generating short, clear titles.
Rules:
- ONE title only
- Under 8 words
- No emojis, no quotes, no explanation
- Just the title text
`;

    // Try each model; on quota errors fall through to the next one.
    for (const modelName of FALLBACK_MODELS) {
        try {
            const response = await getGeminiModel(modelName).invoke([
                new SystemMessage(titleSystemPrompt),
                new HumanMessage(`Generate a title for: "${message}"`),
            ]);

            const title = typeof response.content === "string"
                ? response.content.trim()
                : String(response.content ?? "").trim();

            if (title) return title;
        } catch (err) {
            const msg = err?.message || "";
            const isQuota = /quota|resource_exhausted|429|rate/i.test(msg);
            if (!isQuota) throw err; // Non-quota errors bubble up.
            console.error(`Title model "${modelName}" quota exceeded, trying next...`);
        }
    }

    // Fallback so a title-generation failure never blocks the whole chat.
    return message.slice(0, 50);
}