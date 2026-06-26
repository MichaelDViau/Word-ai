/**
 * Secure server-side AI endpoint.
 *
 * The browser only ever calls THIS route. The OpenRouter API key is read from
 * the server environment and never leaves the server. We validate input, apply
 * a small in-memory rate limit, build the prompt here (so prompt logic stays
 * server-side), and translate OpenRouter errors into friendly messages.
 *
 * We deliberately never log document content or the API key.
 */

import { NextRequest, NextResponse } from "next/server";
import type { AiActionId } from "@/lib/ai";

export const runtime = "nodejs";
// Always run dynamically — never cache AI responses.
export const dynamic = "force-dynamic";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_INPUT = 20000;

// ---- Basic in-memory rate limiting (best-effort abuse protection) ----------
// Resets on cold start; good enough to blunt accidental floods without a DB.
const RATE_LIMIT = 20; // requests
const RATE_WINDOW_MS = 60_000; // per minute
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  // Opportunistic cleanup so the map can't grow unbounded.
  if (hits.size > 5000) {
    for (const [key, value] of hits) {
      if (now > value.resetAt) hits.delete(key);
    }
  }
  return entry.count > RATE_LIMIT;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "anonymous";
}

// ---- Prompt construction (server-only) -------------------------------------

const SYSTEM_PROMPT = `You are Nopal AI, a precise, professional writing assistant inside a document editor.

Core rules:
- Return ONLY the resulting text the user asked for. Do not add greetings, explanations, or commentary, and do not wrap the result in quotes or code fences unless the user explicitly asks for code.
- Preserve the user's original meaning, intent, and language unless they ask you to translate or change it.
- Match the formatting that makes sense for the task (e.g. plain paragraphs for prose, a bulleted or numbered list for outlines and idea lists).
- Keep a clean, premium, professional tone.

Accuracy and honesty rules (very important):
- When asked for historical dates, references, books, statistics, or other factual claims, do NOT invent sources or facts.
- Only provide a book title, author, or citation when you are reasonably confident it is real and relevant.
- If you are not certain, clearly say the information should be independently verified, and avoid fabricating specifics.
- Never present a guess as a confirmed fact.`;

function buildMessages(body: {
  action: AiActionId;
  text?: string;
  instruction?: string;
  language?: string;
  documentContext?: string;
}): { role: "system" | "user"; content: string }[] {
  const text = (body.text || "").trim();
  const instruction = (body.instruction || "").trim();
  const language = (body.language || "").trim();
  const context = (body.documentContext || "").trim();

  const extra = instruction
    ? `\n\nAdditional instruction from the user: ${instruction}`
    : "";

  let userPrompt: string;

  switch (body.action) {
    case "rewrite":
      userPrompt = `Rewrite the following text so it is professional, polished, and clear. Keep the original meaning and language.\n\nText:\n${text}`;
      break;
    case "correct":
      userPrompt = `Correct the spelling, grammar, and punctuation of the following text. Do not change the meaning, tone, or wording beyond what is needed for correctness.\n\nText:\n${text}`;
      break;
    case "clarity":
      userPrompt = `Rewrite the following text to maximize clarity and readability while preserving meaning and language. Prefer plain, direct phrasing.\n\nText:\n${text}`;
      break;
    case "shorten":
      userPrompt = `Make the following text shorter and more concise while keeping the essential meaning and language.\n\nText:\n${text}`;
      break;
    case "expand":
      userPrompt = `Expand the following text with relevant detail, examples, and depth, keeping the same voice and language.\n\nText:\n${text}`;
      break;
    case "formal":
      userPrompt = `Rewrite the following text in a more formal, professional register, keeping the meaning and language.\n\nText:\n${text}`;
      break;
    case "friendly":
      userPrompt = `Rewrite the following text in a warmer, friendlier, more conversational tone, keeping the meaning and language.\n\nText:\n${text}`;
      break;
    case "summarize":
      userPrompt = `Summarize the following text into its key points. Use a short bulleted list if there are multiple distinct points; otherwise a tight paragraph.\n\nText:\n${text || context}`;
      break;
    case "translate":
      userPrompt = `Translate the following text into ${language || "English"}. Return only the translation, preserving meaning, tone, and formatting.\n\nText:\n${text}`;
      break;
    case "continue":
      userPrompt = `Continue writing naturally from where the following text leaves off. Match the existing tone, style, and language. Write the next 1-3 paragraphs only.\n\nText so far:\n${text || context}`;
      break;
    case "ideas":
      userPrompt = `Generate a concise, useful list of ideas for the following topic or text. Return a bulleted list.\n\nTopic / text:\n${text || context || instruction}`;
      break;
    case "outline":
      userPrompt = `Create a clear, well-structured outline for the following topic or text. Use headings and nested bullet points.\n\nTopic / text:\n${text || context || instruction}`;
      break;
    case "facts":
      userPrompt = `Provide relevant, accurate dates and historical facts related to the following topic or text. Only include facts you are reasonably confident are correct, and flag anything uncertain as needing verification.\n\nTopic / text:\n${text || context || instruction}`;
      break;
    case "references":
      userPrompt = `Suggest a short list of real, relevant references (book titles with authors, and well-known sources) for the following topic or text. Only include references you are reasonably confident exist. If unsure, say the suggestion should be verified. Briefly note why each is relevant.\n\nTopic / text:\n${text || context || instruction}`;
      break;
    case "custom":
    default:
      userPrompt = instruction
        ? text
          ? `${instruction}\n\nText:\n${text}`
          : instruction
        : text;
      break;
  }

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `${userPrompt}${extra}`.slice(0, MAX_INPUT + 4000) },
  ];
}

const VALID_ACTIONS: AiActionId[] = [
  "rewrite", "correct", "clarity", "translate", "summarize", "expand",
  "shorten", "formal", "friendly", "ideas", "outline", "continue",
  "facts", "references", "custom",
];

export async function POST(req: NextRequest) {
  // 1) Rate limit.
  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { error: "Too many AI requests. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  // 2) Config check — fail clearly if the key is missing (never expose it).
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI is not configured on the server. Set OPENROUTER_API_KEY in your environment.",
      },
      { status: 503 },
    );
  }

  // 3) Parse & validate input.
  let body: {
    action?: AiActionId;
    text?: string;
    instruction?: string;
    language?: string;
    documentContext?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const action = body.action;
  if (!action || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Unknown AI action." }, { status: 400 });
  }

  const text = (body.text || "").toString();
  const instruction = (body.instruction || "").toString();
  const context = (body.documentContext || "").toString();

  if ((text + instruction + context).length > MAX_INPUT) {
    return NextResponse.json(
      { error: "That's too much text for one request. Please select a smaller section." },
      { status: 413 },
    );
  }

  if (!text.trim() && !instruction.trim() && !context.trim()) {
    return NextResponse.json(
      { error: "Nothing to work with — select some text or type an instruction." },
      { status: 400 },
    );
  }

  const messages = buildMessages({
    action,
    text,
    instruction,
    language: body.language,
    documentContext: context,
  });

  // 4) Call OpenRouter with a timeout.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_APP_URL || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME || "Nopal AI Docs",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free",
        messages,
        temperature: 0.7,
        max_tokens: 1200,
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      // Surface a friendly, non-leaky message based on status.
      const status = upstream.status;
      // Pull OpenRouter's own error wording (which never contains our key) so
      // misconfiguration — bad key, no credits, blocked model — is obvious.
      let detail = "";
      try {
        const errBody = await upstream.json();
        detail =
          errBody?.error?.message ||
          errBody?.error?.metadata?.raw ||
          errBody?.message ||
          (typeof errBody?.error === "string" ? errBody.error : "");
      } catch {
        try {
          detail = (await upstream.text()).slice(0, 200);
        } catch {
          /* ignore unreadable bodies */
        }
      }
      const friendly =
        status === 401 || status === 403
          ? "The AI service rejected the request. Check your API key."
          : status === 429
            ? "The AI service is rate limiting requests. Please try again shortly."
            : "The AI service is temporarily unavailable. Please try again.";
      const message = detail
        ? `${friendly} (OpenRouter ${status}: ${detail})`
        : `${friendly} (HTTP ${status})`;
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const data = await upstream.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "The AI returned an empty response. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ text: content.trim() });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      {
        error: aborted
          ? "The AI request timed out. Please try again."
          : "Couldn't reach the AI service. Check your connection and try again.",
      },
      { status: 504 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
