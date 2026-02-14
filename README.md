# Codebase Analyzer (WIP)

Goal: help a newly onboarded engineer understand an unfamiliar codebase by generating:
- An Excalidraw architecture diagram (JSON)
- A long markdown structure report
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

Open the UI at the URL Vite prints (usually `http://localhost:5173`), then provide either:
- a local `repoPath`
- or a GitHub `repoUrl` on `github.com` (optional `repoRef` branch/tag)

If your API isn't on `http://localhost:8787`, set `VITE_API_BASE` for the web app (example):

```bash
VITE_API_BASE=http://localhost:8787 npm run dev:web
```

## Claude Agents (Required)

The backend is wired to Anthropic Claude only.

Required env:
- `LLM_PROVIDER=anthropic`
- `ANTHROPIC_API_KEY=...`

Optional knobs:
- `ANTHROPIC_MODEL` (example: `claude-sonnet-4-5-20250929`)
- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_VERSION`

See `apps/api/src/llm/anthropicClient.ts` for details.

## API input (create job)

`POST /v1/jobs` accepts exactly one source:

```json
{ "repoPath": "/absolute/path/to/repo" }
```

or

```json
{ "repoUrl": "https://github.com/owner/repo", "repoRef": "main" }
```
