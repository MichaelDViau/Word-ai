/**
 * Client-safe AI helpers.
 *
 * This module contains only metadata and a thin fetch wrapper that talks to our
 * OWN backend (`/api/ai`). The OpenRouter API key and prompt engineering live
 * exclusively on the server (`src/app/api/ai/route.ts`) and are never shipped to
 * the browser.
 */

/** Identifiers for every supported AI action. Mirrored on the server. */
export type AiActionId =
  | "rewrite"
  | "correct"
  | "clarity"
  | "translate"
  | "summarize"
  | "expand"
  | "shorten"
  | "formal"
  | "friendly"
  | "ideas"
  | "outline"
  | "continue"
  | "facts"
  | "references"
  | "custom";

export interface AiAction {
  id: AiActionId;
  label: string;
  description: string;
  /** Whether the action needs a target language (translation). */
  needsLanguage?: boolean;
  /** Whether the action can run with no selected/typed text (uses the doc). */
  worksWithoutSelection?: boolean;
}

/** The catalog of AI actions surfaced in the UI. */
export const AI_ACTIONS: AiAction[] = [
  {
    id: "rewrite",
    label: "Rewrite professionally",
    description: "Polish tone, flow, and word choice.",
  },
  {
    id: "correct",
    label: "Fix spelling & grammar",
    description: "Correct mistakes without changing meaning.",
  },
  {
    id: "clarity",
    label: "Improve clarity",
    description: "Make the writing clearer and easier to read.",
  },
  {
    id: "shorten",
    label: "Make shorter",
    description: "Tighten the text while keeping the message.",
  },
  {
    id: "expand",
    label: "Expand",
    description: "Add helpful detail and depth.",
  },
  {
    id: "formal",
    label: "More formal",
    description: "Raise the register for professional contexts.",
  },
  {
    id: "friendly",
    label: "More friendly",
    description: "Warm, approachable, conversational tone.",
  },
  {
    id: "summarize",
    label: "Summarize",
    description: "Condense into the key points.",
    worksWithoutSelection: true,
  },
  {
    id: "translate",
    label: "Translate",
    description: "Convert text into another language.",
    needsLanguage: true,
  },
  {
    id: "continue",
    label: "Continue writing",
    description: "Draft what naturally comes next.",
    worksWithoutSelection: true,
  },
  {
    id: "ideas",
    label: "Generate ideas",
    description: "Brainstorm angles and talking points.",
    worksWithoutSelection: true,
  },
  {
    id: "outline",
    label: "Create an outline",
    description: "Structure the topic into sections.",
    worksWithoutSelection: true,
  },
  {
    id: "facts",
    label: "Add dates & facts",
    description: "Include verified historical context.",
    worksWithoutSelection: true,
  },
  {
    id: "references",
    label: "Find references",
    description: "Suggest books and sources to cite.",
    worksWithoutSelection: true,
  },
];

/** Common target languages for the translate action. */
export const TRANSLATE_LANGUAGES = [
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
  "Chinese (Simplified)",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Russian",
  "English",
];

export interface AiRequest {
  action: AiActionId;
  /** The selected / target text the action should operate on. */
  text?: string;
  /** A free-form user instruction (used by the "custom" action, or as extra guidance). */
  instruction?: string;
  /** Target language for translation. */
  language?: string;
  /** Optional surrounding document text for context (continue/summarize). */
  documentContext?: string;
}

export interface AiResult {
  text: string;
}

/** Maximum characters we will send in a single request (matches the server). */
export const AI_MAX_INPUT = 20000;

/**
 * Call our own backend AI endpoint. Throws a friendly Error on failure so the
 * caller can surface it in the UI. Never talks to OpenRouter directly.
 */
export async function runAi(
  req: AiRequest,
  signal?: AbortSignal,
): Promise<AiResult> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    signal,
  });

  let data: { text?: string; error?: string } = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON response (e.g. proxy/network error page).
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        data.error || "You're sending requests too quickly. Please wait a moment.",
      );
    }
    if (res.status === 503) {
      throw new Error(
        data.error ||
          "The AI service isn't configured. Add OPENROUTER_API_KEY to your environment.",
      );
    }
    throw new Error(data.error || "The AI request failed. Please try again.");
  }

  if (!data.text) {
    throw new Error("The AI returned an empty response. Please try again.");
  }
  return { text: data.text };
}
