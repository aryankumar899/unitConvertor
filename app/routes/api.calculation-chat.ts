import type { ActionFunctionArgs } from "react-router";

type ChatRole = "user" | "assistant";

interface IncomingChatMessage {
  role: ChatRole;
  content: string;
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

interface GeminiErrorResponse {
  error?: {
    code?: number;
    status?: string;
    message?: string;
  };
}

const MAX_HISTORY = 12;
const DEFAULT_FREE_MODEL = "gemini-2.5-flash-lite";
const CALCULATION_KEYWORDS =
  /\b(convert|conversion|calculate|calc|solve|equation|formula|percentage|percent|ratio|average|mean|sum|difference|multiply|divide|subtract|add|interest|discount|tax|tip|speed|distance|time|unit|meter|kilometer|centimeter|millimeter|mile|inch|foot|yard|kg|g|lb|celsius|fahrenheit|kelvin|second|minute|hour|day|area|volume|perimeter)\b/i;

const isCalculationRelated = (text: string): boolean => {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return false;
  }

  if (/[0-9]/.test(normalizedText) && /[+\-*/%=^]/.test(normalizedText)) {
    return true;
  }

  return CALCULATION_KEYWORDS.test(normalizedText);
};

const sanitizeMessages = (messages: unknown): IncomingChatMessage[] => {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((message): message is IncomingChatMessage => {
      return (
        typeof message === "object" &&
        message !== null &&
        ((message as IncomingChatMessage).role === "user" ||
          (message as IncomingChatMessage).role === "assistant") &&
        typeof (message as IncomingChatMessage).content === "string"
      );
    })
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-MAX_HISTORY);
};

const extractGeminiReply = (payload: GeminiGenerateContentResponse): string => {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  return parts.map((part) => part.text ?? "").join("").trim();
};

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  const apiKey =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_API_KEY ??
    process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error:
          "Server is missing GEMINI_API_KEY (or GOOGLE_API_KEY / VITE_GEMINI_API_KEY).",
      },
      { status: 500 },
    );
  }

  let payload: { messages?: unknown };

  try {
    payload = (await request.json()) as { messages?: unknown };
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const normalizedMessages = sanitizeMessages(payload.messages);
  const messages = [...normalizedMessages];

  while (messages[0]?.role === "assistant") {
    messages.shift();
  }

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");

  if (!latestUserMessage) {
    return Response.json({ error: "No user message provided." }, { status: 400 });
  }

  if (!isCalculationRelated(latestUserMessage.content)) {
    return Response.json({
      reply:
        "I can only help with calculation-related questions. Ask math, formulas, or unit conversions.",
    });
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_FREE_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const geminiResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text: "You are a strict calculation assistant. Only answer calculation-related queries. For each response: provide short steps, formula used, and final answer. If user asks non-calculation topics, respond with: 'I can only help with calculation-related questions.'",
          },
        ],
      },
      contents: messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
      generationConfig: {
        temperature: 0.2,
      },
    }),
  });

  const responseText = await geminiResponse.text();

  if (!geminiResponse.ok) {
    let parsedError: GeminiErrorResponse | null = null;

    try {
      parsedError = JSON.parse(responseText) as GeminiErrorResponse;
    } catch {
      parsedError = null;
    }

    const errorStatus = parsedError?.error?.status;
    const errorCode = parsedError?.error?.code;
    const errorMessage = parsedError?.error?.message;

    if (errorStatus === "RESOURCE_EXHAUSTED" || errorCode === 429) {
      return Response.json(
        {
          error:
            "Gemini free-tier quota exceeded. Wait for the quota reset in AI Studio, or enable billing for higher limits.",
        },
        { status: 502 },
      );
    }

    if (errorStatus === "UNAUTHENTICATED" || errorCode === 401) {
      return Response.json(
        {
          error:
            "Invalid Gemini API key. Update GEMINI_API_KEY in your .env and restart the dev server.",
        },
        { status: 502 },
      );
    }

    if (errorStatus === "NOT_FOUND") {
      return Response.json(
        {
          error:
            `Model '${model}' is not available. Set GEMINI_MODEL to a valid model, e.g. ${DEFAULT_FREE_MODEL} or gemini-2.5-flash.`,
        },
        { status: 502 },
      );
    }

    return Response.json(
      {
        error:
          errorMessage ??
          "Gemini request failed. Check API key, model, and billing settings.",
      },
      { status: 502 },
    );
  }

  let geminiData: GeminiGenerateContentResponse;

  try {
    geminiData = JSON.parse(responseText) as GeminiGenerateContentResponse;
  } catch {
    return Response.json(
      { error: "Gemini returned an unreadable response." },
      { status: 502 },
    );
  }

  const reply = extractGeminiReply(geminiData);

  if (!reply) {
    return Response.json(
      { error: "Gemini returned an empty response." },
      { status: 502 },
    );
  }

  return Response.json({ reply });
}
