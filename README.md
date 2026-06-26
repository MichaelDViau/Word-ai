# Nopal AI Docs

A professional, web-based document editor — think Google Docs / Microsoft Word, reimagined with a clean, premium **Nopal AI** identity. Create, format, import, export, and manage rich documents entirely in the browser.

Built with **Next.js (App Router) · TypeScript · Tailwind CSS · TipTap**.

![Editor](docs/editor.png)

## Features

### Rich document editor
A real WYSIWYG editor (not a textarea) powered by [TipTap](https://tiptap.dev) / ProseMirror:

- Document title editing with an auto-save status indicator
- A professional **top menu bar** (File · Edit · View · Insert · Format · Tools · Help) like Google Docs / Word
- Undo / redo
- **Font selection** from a large library of professional fonts (Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Merriweather, Playfair Display, Garamond, and more)
- Font size selector
- **Bold**, _italic_, underline, ~~strikethrough~~, subscript/superscript
- Text color & highlight color pickers
- Block styles: **Title**, **Subtitle**, Heading 1–3, Body text
- Bulleted lists, numbered lists, and interactive **checklists**
- **Images and tables**, links, dates, horizontal lines, and page breaks
- Text alignment: left / center / right / justify
- Line spacing presets
- Indent / outdent (list nesting)
- Block quotes, code blocks, horizontal dividers, links
- **Find & replace** (⌘/Ctrl + F)
- **Page sizes** — Letter (default 8.5 × 11 in), Legal, A4, or a custom size
- A Google-Docs-style **ruler** (toggle from the View menu) and **zoom** controls
- A premium **dark mode** with a saved preference (moon/sun toggle)
- Page-style writing area with a real "sheet of paper" feel
- Full-screen / focus writing mode
- A clean, native-feeling **mobile experience** — simplified bottom toolbar with slide-up tool sheets
- Fully responsive (desktop, tablet, mobile)

### Import
Open files straight from your device — formatting is preserved as faithfully as possible:

| Format | Engine |
| ------ | ------ |
| `.docx` | [mammoth](https://github.com/mwilliamson/mammoth.js) |
| `.md` / `.markdown` | [marked](https://marked.js.org) |
| `.html` / `.htm` | native (body extraction) |
| `.txt` | native |

### Export
Save your document to your device in multiple formats:

| Format | Engine |
| ------ | ------ |
| **PDF** | native print-to-PDF (crisp, selectable, vector text) |
| **Word `.docx`** | [html-docx-js-typescript](https://www.npmjs.com/package/html-docx-js-typescript) |
| **Markdown `.md`** | [turndown](https://github.com/mixmark-io/turndown) |
| **Text `.txt`** | native |
| **HTML `.html`** | native (self-contained, styled) |

### Document dashboard
- Grid of all your documents with live previews
- Create, **rename**, **duplicate**, and **delete**
- **Search** by title/content
- **Sort** by last modified, title (A–Z), or date created
- Click to reopen in the editor

### AI assistant (OpenRouter)
A fully functional AI writing assistant, integrated **securely**:

- Live **document insights** (word count, character count, reading time)
- Select text (or type a custom instruction) and run: **Rewrite professionally**, **Fix spelling & grammar**, **Improve clarity**, **Make shorter / Expand**, **More formal / More friendly**, **Summarize**, **Translate**, **Continue writing**, **Generate ideas**, **Create an outline**, **Add dates & facts**, **Find references**, and free-form requests
- Each result offers **Copy**, **Replace**, **Insert below**, and **Try again**, with clear loading and error states — the editor never freezes while the AI is working
- The model is steered to **avoid inventing facts or sources** and to flag anything that should be verified

> 🔒 **The API key never touches the browser.** The frontend only calls our own backend route (`/api/ai`), which talks to OpenRouter server-side. Input is validated, requests are rate-limited, and document content / keys are never logged.

#### AI setup

1. Copy `.env.example` to `.env.local` (already gitignored).
2. Add your [OpenRouter](https://openrouter.ai/keys) API key:

   ```bash
   OPENROUTER_API_KEY=your_api_key_here
   OPENROUTER_MODEL=openai/gpt-oss-20b:free
   ```

3. Restart the dev server. That's it — the AI tools are live.

## Architecture

The app is structured so the current **localStorage** persistence can later be swapped for a real backend (accounts, cloud sync, sharing, version history, collaboration) without touching the UI.

```
src/
├── app/
│   ├── layout.tsx            # Root layout, fonts, theme bootstrap, metadata
│   ├── page.tsx              # Dashboard page
│   ├── editor/[id]/page.tsx  # Editor route (loads a document)
│   ├── api/ai/route.ts       # Secure server-side OpenRouter proxy
│   ├── globals.css           # Tailwind + ProseMirror + dark-mode styles
│   └── icon.svg              # App icon
├── components/
│   ├── Logo.tsx              # Nopal AI wordmark (original artwork)
│   ├── ui/Modal.tsx
│   ├── ui/BottomSheet.tsx        # Mobile slide-up sheet
│   ├── dashboard/DocumentCard.tsx
│   └── editor/
│       ├── DocumentEditor.tsx    # Editor shell: header, autosave, layout, fullscreen
│       ├── MenuBar.tsx           # Top menu bar (File/Edit/View/Insert/Format/Tools/Help)
│       ├── Toolbar.tsx           # Full formatting toolbar
│       ├── ToolbarPrimitives.tsx # Reusable buttons / dropdowns
│       ├── MobileToolbar.tsx     # Mobile bottom toolbar + tool sheets
│       ├── ThemeToggle.tsx       # Dark/light toggle
│       ├── Ruler.tsx             # Google-Docs-style ruler
│       ├── FindReplace.tsx       # Find & replace panel
│       ├── PageSetupDialog.tsx   # Page size chooser
│       ├── InfoDialogs.tsx       # Word count / shortcuts / about
│       └── AiPanel.tsx           # AI assistant side panel (calls /api/ai)
└── lib/
    ├── types.ts              # Domain types + DocumentStore interface
    ├── store.ts              # localStorage implementation of DocumentStore
    ├── useDocuments.ts       # Dashboard data hook
    ├── theme.tsx             # Theme provider + persistence
    ├── ai.ts                 # Client-safe AI actions + fetch wrapper
    ├── pageSettings.ts       # Per-document page size / ruler / zoom
    ├── import.ts             # File import (docx/md/html/txt → HTML)
    ├── export.ts             # File export (pdf/docx/md/txt/html)
    ├── editorExtensions.ts   # TipTap extension set
    ├── fontSize.ts           # Custom font-size extension
    ├── lineHeight.ts         # Custom line-height extension
    ├── headingStyle.ts       # Title/Subtitle heading variants
    ├── pageBreak.ts          # Custom page-break node
    └── constants.ts          # Fonts, sizes, colors, spacings
```

### Swapping in a backend

Every data operation goes through the `DocumentStore` interface in `src/lib/types.ts`. All methods are already `async`, so providing an API-backed implementation (and pointing the hooks at it) is the only change required:

```ts
export interface DocumentStore {
  list(): Promise<DocumentRecord[]>;
  get(id: string): Promise<DocumentRecord | null>;
  create(input?: NewDocumentInput): Promise<DocumentRecord>;
  update(id: string, patch: DocumentPatch): Promise<DocumentRecord>;
  duplicate(id: string): Promise<DocumentRecord>;
  remove(id: string): Promise<void>;
}
```

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

## Notes

- Documents are stored in your browser's `localStorage`. They are private to that browser/device and are not uploaded anywhere.
- PDF export uses the browser's native print dialog (choose **Save as PDF**) for the highest fidelity and selectable text.
- AI features require `OPENROUTER_API_KEY` to be set (see **AI setup** above). The key is read only on the server; if it's missing, the AI panel shows a clear, friendly message instead of failing silently.
- Your theme preference and per-document page settings (size, ruler, zoom) are stored locally in your browser.
