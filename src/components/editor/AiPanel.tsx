"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  ArrowRight,
  Check,
  Languages,
  ListChecks,
  PenLine,
  Sparkles,
  SpellCheck,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface AiTool {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const AI_TOOLS: AiTool[] = [
  {
    id: "improve",
    label: "Improve writing",
    description: "Polish clarity, flow, and tone.",
    icon: <Wand2 className="h-4 w-4" />,
  },
  {
    id: "summarize",
    label: "Summarize",
    description: "Condense the document into key points.",
    icon: <ListChecks className="h-4 w-4" />,
  },
  {
    id: "continue",
    label: "Continue writing",
    description: "Let Nopal AI draft what comes next.",
    icon: <PenLine className="h-4 w-4" />,
  },
  {
    id: "grammar",
    label: "Fix spelling & grammar",
    description: "Catch mistakes across the document.",
    icon: <SpellCheck className="h-4 w-4" />,
  },
  {
    id: "translate",
    label: "Translate",
    description: "Convert your text into another language.",
    icon: <Languages className="h-4 w-4" />,
  },
];

/**
 * The AI Assistant side panel.
 *
 * The generative tools are presented as honest placeholders — they explain that
 * they connect to a Nopal AI backend that isn't wired up yet. The "Document
 * insights" section is fully functional and reads live stats from the editor.
 */
export function AiPanel({
  editor,
  open,
  onClose,
}: {
  editor: Editor | null;
  open: boolean;
  onClose: () => void;
}) {
  const [activeTool, setActiveTool] = useState<AiTool | null>(null);

  const characters = editor?.storage.characterCount.characters() ?? 0;
  const words = editor?.storage.characterCount.words() ?? 0;
  const readingMinutes = Math.max(1, Math.round(words / 200));

  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex w-80 max-w-[88vw] flex-col border-l border-ink-200 bg-white shadow-xl transition-transform duration-300 lg:shadow-none",
        open ? "translate-x-0" : "translate-x-full",
      )}
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-nopal-500 to-nopal-700 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink-950">AI Assistant</h2>
            <p className="text-[11px] text-ink-400">Powered by Nopal AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
          aria-label="Close AI panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Insights — fully functional */}
        <section className="mb-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Document insights
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Words" value={words.toLocaleString()} />
            <Stat label="Characters" value={characters.toLocaleString()} />
            <Stat label="Read time" value={`${readingMinutes}m`} />
          </div>
        </section>

        {/* AI tools */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Writing tools
          </h3>
          <div className="space-y-1.5">
            {AI_TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-left transition hover:border-nopal-300 hover:bg-nopal-50",
                  activeTool?.id === tool.id && "border-nopal-300 bg-nopal-50",
                )}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-nopal-100 text-nopal-700">
                  {tool.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink-900">
                    {tool.label}
                  </span>
                  <span className="block truncate text-xs text-ink-400">
                    {tool.description}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-nopal-600" />
              </button>
            ))}
          </div>
        </section>

        {/* Selected tool — placeholder result */}
        {activeTool && (
          <section className="mt-4 animate-fade-in rounded-xl border border-nopal-200 bg-nopal-50/60 p-3">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-nopal-800">
              {activeTool.icon}
              {activeTool.label}
            </div>
            <p className="text-xs leading-relaxed text-ink-600">
              {activeTool.label} will run here once your workspace is connected to
              Nopal AI. The editor, document data, and selection are already wired
              up — only the model endpoint needs to be plugged in.
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-nopal-700 ring-1 ring-nopal-200">
              <Check className="h-3 w-3" />
              Coming soon
            </div>
          </section>
        )}
      </div>

      <div className="border-t border-ink-100 p-3">
        <p className="text-[11px] leading-relaxed text-ink-400">
          AI features are previews. Connect a Nopal AI workspace to enable
          generation, editing suggestions, and translation.
        </p>
      </div>
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/60 px-2 py-2 text-center">
      <div className="text-sm font-semibold text-ink-900">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-ink-400">
        {label}
      </div>
    </div>
  );
}
