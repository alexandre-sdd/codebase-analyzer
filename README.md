# Codebase Analyzer (WIP)

Goal: help a newly onboarded engineer understand an unfamiliar codebase by generating:
- An Excalidraw architecture diagram (JSON)
- A short "podcast-style" high-level explanation (Markdown for now; TTS can be added later)
- A small, concrete starter task list
- Basic "who/why" signals from git history (best-effort)

This repo is structured as a small monorepo:
- `apps/api`: Fastify backend that crawls/analyzes a repo and produces artifacts
- `apps/web`: Minimal UI to run an analysis job and view/download artifacts

## Quickstart

1. Install deps (requires Node 20+):

```bash
npm install
```

2. Start the API:

```bash
cp .env.example .env
npm run dev:api
```

3. Start the web app (in another terminal):

```bash
npm run dev:web
```

Open the UI at the URL Vite prints (usually `http://localhost:5173`).

If your API isn't on `http://localhost:8787`, set `VITE_API_BASE` for the web app (example):

```bash
VITE_API_BASE=http://localhost:8787 npm run dev:web
```

## Claude agents (optional)

The backend can optionally call an LLM provider for richer explanations and better diagrams.

Set either:
- `LLM_PROVIDER=mock` (default, deterministic local output)
- `LLM_PROVIDER=anthropic` and `ANTHROPIC_API_KEY=...`

See `apps/api/src/llm/anthropicClient.ts` for details and knobs.
