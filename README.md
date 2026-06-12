# DailyLearn

A frontend-only micro-learning PWA that turns a software engineering curriculum into bite-sized, AI-generated, interactive lessons — designed to be skimmed in under 5 minutes a day.

## Features

- **Daily / Random / Guided / Review learning modes** across a full software engineering curriculum (system design, architecture, databases, distributed systems, DevOps, security, and more).
- **AI-generated micro-lessons** with a consistent structure:
  - Challenge Question (think first, then reveal the AI's answer)
  - Core Idea
  - Visual Explanation (Mermaid diagrams)
  - Code Example
  - Real World Example
  - Common Mistake
  - Interview Question
  - Key Takeaway
  - Optional Quick Quiz, Flashcards, and an interactive code sandbox ("predict the output")
- **AI Mentor** — ask follow-up questions about the current lesson in a chat drawer (conversation stored locally).
- **Progress tracking** — streaks, completions, and a review list, all stored locally (localStorage + IndexedDB).
- **Multi-provider AI support** — OpenAI, Anthropic, or Google Gemini. Bring your own API key, or use the app's built-in server-side key (no key ever exposed to the browser).
- **PWA** — installable, works offline for previously generated lessons.

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and includes a local `/api/ai` middleware that emulates the production serverless function.

### AI Provider Setup

By default, lessons are generated through DailyLearn's built-in AI connection (no API key required from the user). To enable this locally, create a `.env.local` file (gitignored) based on `.env.example`:

```bash
cp .env.example .env.local
```

Then set at least one provider's key:

```
DEFAULT_AI_PROVIDER=anthropic

ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
```

These are **server-only** env vars (no `VITE_` prefix) — they're read by the `/api/ai` function and never bundled into the client.

Users can also turn off "use built-in AI" in Settings and provide their own API key, which is stored only in their browser and sent directly to the provider's API.

## Scripts

- `npm run dev` — start the Vite dev server (with `/api/ai` middleware)
- `npm run build` — type-check (`tsc -b`) and build for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

## Tech Stack

- React + TypeScript (strict) + Vite
- Tailwind CSS + shadcn/ui-style components
- React Router, Zustand, TanStack Query, Framer Motion
- Mermaid.js for diagrams
- IndexedDB for lesson/quiz/flashcard caching, localStorage for settings & progress
- Vercel serverless function (`/api/ai`) for the built-in AI proxy

## Project Structure

```
api/              # Vercel serverless function + shared AI proxy logic
src/
  data/           # Curriculum data and module registry
  features/       # Feature modules (learning, curriculum, ai, settings, progress)
  providers/      # AI provider implementations (OpenAI, Anthropic, Gemini, system proxy)
  stores/         # Zustand stores (settings, progress, curriculum, learning)
  pages/          # Route-level pages
  components/     # Shared UI components
  types/          # Shared TypeScript types
```

## Security Notes

- Never commit real API keys to `.env.example` or any tracked file — only `.env.local` (gitignored) should contain real secrets.
- The "bring your own key" option stores the key in the browser's localStorage and sends it directly to the chosen provider's API; it is never sent to or stored on DailyLearn's servers.
