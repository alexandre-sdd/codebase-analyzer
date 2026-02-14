# Product: Codebase Analyzer

## Problem
Newly onboarded engineers often receive a large codebase without enough context:
- Where to start reading
- Who owns what
- Why particular technical decisions were made
- How the system fits together (modules, data flow)

## Target User
- New engineer joining an existing team
- Tech lead onboarding new hires
- Anyone picking up an unfamiliar repo fast

## Core Outputs (MVP)
1. **Excalidraw diagram**: a coarse architecture map (modules + relationships)
2. **Podcast-style explanation**: 4–6 minute high-level narrative (Markdown script)
3. **Starter tasks**: 3 safe tasks that force “touching” the codebase
4. **Who/why signals** (best-effort): git head + top authors; hypotheses with evidence

## Non-Goals (MVP)
- Perfect call graph / runtime tracing
- Full “why” reconstruction without explicit docs or commit messages
- Security-hardened multi-tenant SaaS

## Inputs
- Local repo path (current implementation)
- Next: upload a zip, or clone a git URL (needs auth + sandboxing)

## Future Enhancements
- Render Excalidraw in-browser and allow edits + saving back
- Git blame based “owners by module”
- ADR detection and summary (docs/adr, decisions records)
- LLM “file picker” agent to focus on key entrypoints
- WebSocket/SSE streaming progress logs
- TTS: generate an actual audio file from the podcast script

