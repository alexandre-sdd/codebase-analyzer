# Repository Structure Report: checkout

## Source
- Input: `https://github.com/Sripadkarne/Resume-Readiness-Intelligence-Engine`
- Resolved local path: `/Users/alexandresepulvedadedietrich/codebase-analyzer/apps/api/apps/api/.jobs/Rj6dN-KAqV_QmqP6JmRyS/checkout`
- Scanned at: `2026-02-14T22:15:18.306Z`

## Executive Summary
- Total files scanned: **52**
- Total bytes scanned: **86.5 MiB**
- Top-level directories: **7**
- Detected manifests/config files: **1**
- Module graph: **1 nodes / 0 edges**

## Language Breakdown
| Language | Files | Bytes |
|---|---:|---:|
| SQLITE3 | 1 | 67.7 MiB |
| BIN | 4 | 17.8 MiB |
| PICKLE | 1 | 572.9 KiB |
| PDF | 1 | 150.5 KiB |
| Markdown | 9 | 121.1 KiB |
| Python | 16 | 45.0 KiB |
| IPYNB | 3 | 41.1 KiB |
| XML | 9 | 33.4 KiB |
| HTML | 1 | 19.2 KiB |
| TXT | 4 | 10.9 KiB |
| Unknown | 2 | 1.2 KiB |
| Shell | 1 | 393 B |

## Top-Level Directory Analysis
### `VectorDB`
- Files: **7**
- Size: **86.1 MiB**
- Language mix: BIN: 4, IPYNB: 1, SQLITE3: 1, PICKLE: 1
- Largest files:
  - `VectorDB/chroma.sqlite3` (67.7 MiB)
  - `VectorDB/0196ea19-bdc7-442a-bc46-d4579bea13a6/data_level0.bin` (17.7 MiB)
  - `VectorDB/0196ea19-bdc7-442a-bc46-d4579bea13a6/index_metadata.pickle` (572.9 KiB)
  - `VectorDB/0196ea19-bdc7-442a-bc46-d4579bea13a6/link_lists.bin` (95.0 KiB)
  - `VectorDB/0196ea19-bdc7-442a-bc46-d4579bea13a6/length.bin` (43.2 KiB)
  - `VectorDB/VectorDB_Generation.ipynb` (7.0 KiB)
  - `VectorDB/0196ea19-bdc7-442a-bc46-d4579bea13a6/header.bin` (100 B)

### `demo`
- Files: **15**
- Size: **299.8 KiB**
- Language mix: XML: 8, TXT: 3, Markdown: 3, PDF: 1
- Largest files:
  - `demo/resume_parsing/Resume_ASDD_CSxCU.pdf` (150.5 KiB)
  - `demo/study_plan.md` (36.4 KiB)
  - `demo/experiments/20251205_222749/study_plan.md` (34.8 KiB)
  - `demo/experiments/20251205_222503/study_plan.md` (34.6 KiB)
  - `demo/experiments/20251205_222749/resume.xml` (6.9 KiB)
  - `demo/experiments/20251205_222503/resume.xml` (6.9 KiB)
  - `demo/resume_parsing/Resume_ASDD_CSxCU.xml` (5.8 KiB)
  - `demo/resume_parsing/STR_ML_CVIntern_Resume.xml` (5.4 KiB)

### `backend`
- Files: **18**
- Size: **46.2 KiB**
- Language mix: Python: 16, Markdown: 1, XML: 1
- Largest files:
  - `backend/app/services/resume_skill_eval.py` (9.7 KiB)
  - `backend/app/services/rag_agent.py` (8.2 KiB)
  - `backend/app/services/resume_parser.py` (5.2 KiB)
  - `backend/app/services/job_skill_eval.py` (4.0 KiB)
  - `backend/app/workflow/orchestrator.py` (3.7 KiB)
  - `backend/app/api/lovablescript.py` (3.2 KiB)
  - `backend/app/api/main.py` (3.1 KiB)
  - `backend/app/services/skill_gap_eval.py` (2.9 KiB)

### `notebooks`
- Files: **2**
- Size: **34.0 KiB**
- Language mix: IPYNB: 2
- Largest files:
  - `notebooks/parsing_demo.ipynb` (25.8 KiB)
  - `notebooks/RAGtest.ipynb` (8.2 KiB)

### `frontend`
- Files: **1**
- Size: **19.2 KiB**
- Language mix: HTML: 1
- Largest files:
  - `frontend/index.html` (19.2 KiB)

### `docs`
- Files: **4**
- Size: **9.6 KiB**
- Language mix: Markdown: 4
- Largest files:
  - `docs/PROJECT_STRUCTURE_README.md` (4.6 KiB)
  - `docs/technical_appendix.md` (2.2 KiB)
  - `docs/product_brief.md` (2.1 KiB)
  - `docs/deliverables.md` (683 B)

### `README.md`
- Files: **1**
- Size: **4.8 KiB**
- Language mix: Markdown: 1
- Largest files:
  - `README.md` (4.8 KiB)

### `Makefile`
- Files: **1**
- Size: **808 B**
- Language mix: Unknown: 1
- Largest files:
  - `Makefile` (808 B)

### `.gitignore`
- Files: **1**
- Size: **420 B**
- Language mix: Unknown: 1
- Largest files:
  - `.gitignore` (420 B)

### `scripts`
- Files: **1**
- Size: **393 B**
- Language mix: Other (.sh): 1
- Largest files:
  - `scripts/setup.sh` (393 B)

### `requirements.txt`
- Files: **1**
- Size: **386 B**
- Language mix: TXT: 1
- Largest files:
  - `requirements.txt` (386 B)

## Dependency and Module Graph
Modules are coarse buckets inferred from folder conventions (`src/*`, `apps/*`, `packages/*`, and top-level directories). Edges are relative-import counts, so this is a structural hint map, not an exact call graph.

### Most Connected Modules
- `backend`: connectivity=0, incoming=0, outgoing=0

### Strongest Edges

## Manifests and Build Signals
- `requirements.txt`

## Technical Intent Hypotheses
### Python Runtime
- Hypothesis: Python is likely part of the system (service, scripts, or tooling).
- Confidence: medium
- Evidence: Python files detected

## Git Ownership Signals
- HEAD: `51feebfcc014` by **Alexandre SEPULVEDA de DIETRICH** on `2026-01-25T13:56:14-05:00`
- HEAD message: Merge pull request #25 from Sripadkarne/alexandre-sdd-patch-1
- Top contributors (by commit count):
  - Alexandre SEPULVEDA de DIETRICH: 1 commits (152513095+alexandre-sdd@users.noreply.github.com)

## File Inventory (Alphabetical, first 260 files)
- `.gitignore` (420 B)
- `backend/__init__.py` (0 B)
- `backend/app/__init__.py` (131 B)
- `backend/app/api/__init__.py` (59 B)
- `backend/app/api/lovablescript.py` (3.2 KiB)
- `backend/app/api/main.py` (3.1 KiB)
- `backend/app/config.py` (1.8 KiB)
- `backend/app/data/sample_skill_taxonomy.xml` (495 B)
- `backend/app/prompts/sample_skill_extractor_prompt.md` (766 B)
- `backend/app/services/__init__.py` (471 B)
- `backend/app/services/job_skill_eval.py` (4.0 KiB)
- `backend/app/services/rag_agent.py` (8.2 KiB)
- `backend/app/services/resume_parser.py` (5.2 KiB)
- `backend/app/services/resume_skill_eval.py` (9.7 KiB)
- `backend/app/services/skill_gap_eval.py` (2.9 KiB)
- `backend/app/utils/__init__.py` (225 B)
- `backend/app/utils/xml_utils.py` (2.2 KiB)
- `backend/app/workflow/__init__.py` (151 B)
- `backend/app/workflow/orchestrator.py` (3.7 KiB)
- `demo/CVS_job_offer.txt` (4.6 KiB)
- `demo/experiments/20251205_222503/job_skills.xml` (1.4 KiB)
- `demo/experiments/20251205_222503/resume.xml` (6.9 KiB)
- `demo/experiments/20251205_222503/skill_gaps.xml` (2.6 KiB)
- `demo/experiments/20251205_222503/study_plan.md` (34.6 KiB)
- `demo/experiments/20251205_222749/job_skills.xml` (1.4 KiB)
- `demo/experiments/20251205_222749/resume.xml` (6.9 KiB)
- `demo/experiments/20251205_222749/skill_gaps.xml` (2.6 KiB)
- `demo/experiments/20251205_222749/study_plan.md` (34.8 KiB)
- `demo/jobdescription.txt` (4.4 KiB)
- `demo/resume_parsing/Resume_ASDD_CSxCU.pdf` (150.5 KiB)
- `demo/resume_parsing/Resume_ASDD_CSxCU.xml` (5.8 KiB)
- `demo/resume_parsing/STR_ML_CVIntern_Resume.xml` (5.4 KiB)
- `demo/resume.txt` (1.6 KiB)
- `demo/study_plan.md` (36.4 KiB)
- `docs/deliverables.md` (683 B)
- `docs/product_brief.md` (2.1 KiB)
- `docs/PROJECT_STRUCTURE_README.md` (4.6 KiB)
- `docs/technical_appendix.md` (2.2 KiB)
- `frontend/index.html` (19.2 KiB)
- `Makefile` (808 B)
- `notebooks/parsing_demo.ipynb` (25.8 KiB)
- `notebooks/RAGtest.ipynb` (8.2 KiB)
- `README.md` (4.8 KiB)
- `requirements.txt` (386 B)
- `scripts/setup.sh` (393 B)
- `VectorDB/0196ea19-bdc7-442a-bc46-d4579bea13a6/data_level0.bin` (17.7 MiB)
- `VectorDB/0196ea19-bdc7-442a-bc46-d4579bea13a6/header.bin` (100 B)
- `VectorDB/0196ea19-bdc7-442a-bc46-d4579bea13a6/index_metadata.pickle` (572.9 KiB)
- `VectorDB/0196ea19-bdc7-442a-bc46-d4579bea13a6/length.bin` (43.2 KiB)
- `VectorDB/0196ea19-bdc7-442a-bc46-d4579bea13a6/link_lists.bin` (95.0 KiB)
- `VectorDB/chroma.sqlite3` (67.7 MiB)
- `VectorDB/VectorDB_Generation.ipynb` (7.0 KiB)

## Notes and Caveats
- This is a best-effort static crawl. Enable LLM enrichment for better naming and explanations.
- Import parsing is heuristic and will miss dynamic/module-alias imports.
- Generated automatically by Codebase Analyzer crawler agent.
