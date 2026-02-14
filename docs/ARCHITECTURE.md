# Architecture

## High Level
- `apps/api` crawls a repo and writes job artifacts to disk
- `apps/web` starts a job, polls status, then displays/downloads artifacts

## Backend Pipeline
1. `scanRepo()` walks the filesystem (with ignore rules and limits) and computes:
   - language breakdown, file stats
   - top-level dirs
   - manifest/config presence
2. `buildModuleGraph()` heuristically parses imports to produce a coarse module graph
3. `generateExcalidraw()` renders the module graph to Excalidraw JSON
4. Fallback outputs:
   - `podcast.md` (draft onboarding script)
   - `tasks.json` (3 starter tasks)
5. Optional enrichment (“Claude agents”):
   - if `LLM_PROVIDER=anthropic`, an LLM is used to produce:
     - improved diagram spec (nodes/edges) which is still rendered locally to Excalidraw
     - a better podcast script
     - better starter tasks

## API Endpoints
- `POST /v1/jobs` `{ "repoPath": "/abs/path" }` -> `{ jobId }`
- `GET /v1/jobs/:jobId` -> job status + artifact list
- `GET /v1/jobs/:jobId/artifacts/:name` -> raw artifact file

## Artifact Files
Written under `apps/api/.jobs/<jobId>/artifacts/`:
- `analysis.json` crawl summary + graph + git signals
- `diagram.excalidraw.json` diagram importable into Excalidraw
- `podcast.md` onboarding script (or LLM-enriched)
- `tasks.json` starter tasks (or LLM-enriched)

