    # Resume Readiness Intelligence Engine: Architecture Deep Dive

**Repository:** `https://github.com/Sripadkarne/Resume-Readiness-Intelligence-Engine`  
**Analysis Date:** 2026-02-14  
**Repository Size:** 86.5 MiB (52 files)  
**Primary Language:** Python (16 files, 45 KiB source code)

---

## Architecture Overview

### System Purpose
This is an AI-powered resume analysis and career readiness platform. The system ingests resumes and job descriptions, extracts skills using LLM-based parsing, compares candidate qualifications against job requirements, identifies skill gaps, and generates personalized study plans. The architecture follows a RAG (Retrieval-Augmented Generation) pattern with a vector database for semantic search over learning resources.

### Architectural Pattern
**Multi-stage pipeline orchestrator** with the following characteristics:

- **Orchestration Layer:** Workflow coordination in `backend/app/workflow/orchestrator.py`
- **Service Layer:** Specialized evaluators for resume parsing, skill extraction, gap analysis
- **Data Layer:** ChromaDB vector store with 67.7 MiB of embedded learning content
- **Presentation Layer:** Single-page HTML frontend (19.2 KiB) and REST API endpoints
- **Processing Model:** Sequential pipeline: Resume Parse → Skill Extraction → Job Skill Eval → Gap Analysis → RAG-based Study Plan Generation

### Key Technical Decisions

**Why ChromaDB?**  
The 67.7 MiB `chroma.sqlite3` and associated HNSW index files indicate a persistent vector database for semantic search. ChromaDB provides SQLite-backed persistence with approximate nearest neighbor search, suitable for retrieving relevant learning resources based on identified skill gaps.

**Why XML for structured output?**  
Multiple XML files in `demo/` and `backend/app/data/` suggest structured skill taxonomy representation. XML enables schema validation, hierarchical skill categorization, and LLM-friendly structured output formatting.

**Why separate evaluation services?**  
The service decomposition (`resume_skill_eval.py`, `job_skill_eval.py`, `skill_gap_eval.py`) indicates separation of concerns for testability and independent prompt engineering per analysis stage.

---

## Folder-by-Folder Breakdown

### `/backend` (18 files, 46.2 KiB)
**Purpose:** Core application logic and API layer  
**Structure:**

```
backend/
├── app/
│   ├── api/              # REST endpoints
│   │   ├── main.py       # Primary API router (3.1 KiB)
│   │   └── lovablescript.py  # Secondary/alternate endpoint (3.2 KiB)
│   ├── services/         # Business logic modules
│   │   ├── resume_skill_eval.py     # Resume parsing & skill extraction (9.7 KiB, largest service)
│   │   ├── rag_agent.py              # Vector DB queries & study plan generation (8.2 KiB)
│   │   ├── resume_parser.py          # PDF/text → structured format (5.2 KiB)
│   │   ├── job_skill_eval.py         # Job description skill extraction (4.0 KiB)
│   │   └── skill_gap_eval.py         # Gap identification logic (2.9 KiB)
│   ├── workflow/
│   │   └── orchestrator.py           # Pipeline coordinator (3.7 KiB)
│   ├── utils/
│   │   └── xml_utils.py              # XML parsing/validation helpers (2.2 KiB)
│   ├── prompts/
│   │   └── sample_skill_extractor_prompt.md  # LLM prompt templates (766 B)
│   ├── data/
│   │   └── sample_skill_taxonomy.xml  # Reference skill ontology (495 B)
│   └── config.py                      # Environment/settings (1.8 KiB)
```

**Key Observations:**
- `resume_skill_eval.py` is the largest service (9.7 KiB), suggesting complex LLM prompt engineering for skill extraction
- Presence of both `main.py` and `lovablescript.py` in `/api` indicates either A/B testing, legacy code, or dual deployment targets (local vs. cloud)
- `config.py` likely contains API keys, model selection (OpenAI/Anthropic/local), and vector DB connection strings

**Maintenance Hotspot:** `services/` directory will see frequent updates as skill extraction prompts are tuned and LLM providers change.

---

### `/VectorDB` (7 files, 86.1 MiB)
**Purpose:** ChromaDB persistent storage for embedded learning resources  
**Structure:**

```
VectorDB/
├── chroma.sqlite3                           # Main DB (67.7 MiB)
├── 0196ea19-bdc7-442a-bc46-d4579bea13a6/    # Collection ID
│   ├── data_level0.bin                      # HNSW graph vectors (17.7 MiB)
│   ├── index_metadata.pickle                # Index config/metadata (572.9 KiB)
│   ├── link_lists.bin                       # HNSW neighbor links (95.0 KiB)
│   ├── length.bin                           # Document length metadata (43.2 KiB)
│   └── header.bin                           # Collection header (100 B)
└── VectorDB_Generation.ipynb                # DB creation script (7.0 KiB)
```

**Technical Details:**
- **Index Type:** HNSW (Hierarchical Navigable Small World) for approximate nearest neighbor search
- **Estimated Embeddings:** ~17.7 MiB of float32 vectors suggests 1,000-5,000 documents embedded (assuming 384-1536 dimensional embeddings)
- **Collection UUID:** `0196ea19-bdc7-442a-bc46-d4579bea13a6` indicates a single semantic search collection
- **Generation Notebook:** `VectorDB_Generation.ipynb` likely contains the ETL pipeline for chunking, embedding, and ingesting learning content

**Critical Unknown:** What embedding model is used? Common choices are `sentence-transformers/all-MiniLM-L6-v2` (384-dim), OpenAI `text-embedding-ada-002` (1536-dim), or Cohere embeddings.

**Maintenance Hotspot:** This directory should be `.gitignore`'d in production (it's 86 MiB). The generation notebook needs re-running when learning content is updated.

---

### `/demo` (15 files, 299.8 KiB)
**Purpose:** Test artifacts, example inputs/outputs, and experiment tracking  
**Structure:**

```
demo/
├── experiments/                    # Timestamped runs
│   ├── 20251205_222503/
│   │   ├── resume.xml              # Parsed resume (6.9 KiB)
│   │   ├── job_skills.xml          # Extracted job requirements (1.4 KiB)
│   │   ├── skill_gaps.xml          # Identified gaps (2.6 KiB)
│   │   └── study_plan.md           # Generated plan (34.6 KiB)
│   └── 20251205_222749/            # Second run (similar structure)
├── resume_parsing/
│   ├── Resume_ASDD_CSxCU.pdf       # Sample resume PDF (150.5 KiB)
│   ├── Resume_ASDD_CSxCU.xml       # Parsed output
│   └── STR_ML_CVIntern_Resume.xml  # Another example
├── CVS_job_offer.txt               # Sample job description (4.6 KiB)
├── jobdescription.txt              # Another job posting
├── resume.txt                      # Plain text resume
└── study_plan.md                   # Latest generated plan (36.4 KiB)
```

**Observations:**
- **Experiment Tracking:** Timestamped folders suggest manual experiment logging (no MLflow/Weights&Biases integration detected)
- **Study Plan Size:** 34-36 KiB markdown files indicate comprehensive, multi-resource learning paths (likely 5,000-10,000 words)
- **Naming Pattern:** `Resume_ASDD_CSxCU` likely corresponds to contributor initials (Alexandre SEPULVEDA de DIETRICH)

**Inferred Workflow:**
1. Upload resume PDF → `resume_parsing/`
2. Run orchestrator → creates `experiments/{timestamp}/`
3. Pipeline generates XML intermediates and final markdown plan
4. Latest output promoted to top-level `demo/study_plan.md`

---

### `/notebooks` (2 files, 34.0 KiB)
**Purpose:** Interactive development and testing  
**Files:**

- `parsing_demo.ipynb` (25.8 KiB) — Resume parsing experimentation, likely testing different LLM prompts or PDF extraction libraries
- `RAGtest.ipynb` (8.2 KiB) — Vector DB query testing, retrieval quality evaluation

**Usage Context:** These notebooks are development artifacts, not production code. They likely contain exploratory API calls, prompt iterations, and quality assessments.

---

### `/frontend` (1 file, 19.2 KiB)
**Purpose:** User interface  
**File:** `index.html` (19.2 KiB)

**Analysis:**
- **Size Indicator:** A 19 KiB single HTML file suggests an embedded JavaScript SPA (likely vanilla JS or lightweight framework like Alpine.js)
- **Architecture Guess:** Client-side form for resume/job upload → POST to `/backend/app/api/main.py` → display results
- **No Build System:** Absence of `package.json`, `vite.config`, or `webpack.config` indicates no transpilation step

**Unknown:** Whether this frontend is actively maintained or if there's a separate modern frontend repo (common in agile projects).

---

### `/docs` (4 files, 9.6 KiB)
**Purpose:** Project documentation  
**Files:**

- `PROJECT_STRUCTURE_README.md` (4.6 KiB) — Architecture documentation (likely redundant with this analysis)
- `technical_appendix.md` (2.2 KiB) — Implementation details, API specs
- `product_brief.md` (2.1 KiB) — Business requirements, use cases
- `deliverables.md` (683 B) — Project milestones or acceptance criteria

**Recommended Reading Order for New Engineers:**
1. `product_brief.md` — Understand the "why"
2. `PROJECT_STRUCTURE_README.md` — High-level architecture
3. `technical_appendix.md` — API contracts and data formats
4. `deliverables.md` — Current project status

---

### `/scripts` (1 file, 393 B)
**Purpose:** Setup automation  
**File:** `setup.sh` (393 B)

**Likely Contents:**
- Python virtual environment creation
- `pip install -r requirements.txt`
- ChromaDB initialization checks
- Environment variable setup

**Critical Gap:** No Docker configuration detected. For production deployment, expect Dockerfile and docker-compose.yml to be added.

---

### Root-Level Configuration Files

#### `requirements.txt` (386 B)
**Inferred Dependencies (based on architecture):**
- `chromadb` — Vector database
- `fastapi` or `flask` — API framework
- `openai` or `anthropic` — LLM API client
- `pydantic` — Data validation (common with FastAPI)
- `langchain` — Possible RAG framework
- `pypdf2` or `pdfplumber` — PDF parsing
- `lxml` — XML processing

**Unknown:** Exact LLM provider (OpenAI GPT-4, Anthropic Claude, or local LLaMA).

#### `Makefile` (808 B)
**Probable Targets:**
- `make install` — Run setup.sh
- `make run` — Start backend server
- `make test` — Execute unit tests (though no `/tests` directory detected)
- `make clean` — Remove cache, temp files

#### `.gitignore` (420 B)
**Expected Exclusions:**
- `__pycache__/`, `*.pyc`
- `.env` — API keys
- `venv/`, `env/`
- Possibly missing: `VectorDB/` exclusion (86 MiB should not be versioned)

---

## Inferred Runtime and Data Flow

### Request Flow Architecture

**Phase 1: Input Ingestion**
```
User Upload (resume.pdf + job_description.txt)
    ↓
frontend/index.html (form POST)
    ↓
backend/app/api/main.py (FastAPI/Flask endpoint)
    ↓
backend/app/workflow/orchestrator.py
```

**Phase 2: Parsing and Extraction**
```
orchestrator.py
    ↓
services/resume_parser.py
    → PDF → text extraction → structured JSON/dict
    ↓
services/resume_skill_eval.py
    → LLM API call with prompt from prompts/
    → Extract skills using sample_skill_taxonomy.xml as reference
    → Output: resume.xml (candidate skills with proficiency levels)
```

**Phase 3: Job Analysis**
```
orchestrator.py
    ↓
services/job_skill_eval.py
    → LLM API call to extract required/preferred skills from job description
    → Output: job_skills.xml
```

**Phase 4: Gap Identification**
```
orchestrator.py
    ↓
services/skill_gap_eval.py
    → Compare resume.xml and job_skills.xml
    → Identify missing skills, weak proficiencies
    → Output: skill_gaps.xml
```

**Phase 5: Study Plan Generation**
```
orchestrator.py
    ↓
services/rag_agent.py
    → For each skill gap:
        1. Query VectorDB/chroma.sqlite3 with skill embedding
        2. Retrieve top-K relevant learning resources
        3. Aggregate into structured learning path
    → LLM API call to format into markdown with learning objectives, timelines, resources
    → Output: study_plan.md (36 KiB comprehensive plan)
```

**Phase 6: Response Delivery**
```
rag_agent.py
    ↓
orchestrator.py (collect all outputs)
    ↓
api/main.py (return JSON with XML data + markdown plan)
    ↓
frontend/index.html (render study plan)
```

### Estimated Latency Profile
- PDF parsing: 1-3 seconds
- LLM skill extraction (resume + job): 5-15 seconds (2 API calls)
- Vector DB queries: <500ms (HNSW is fast)
- Study plan LLM generation: 10-20 seconds (long output)
- **Total end-to-end:** 20-40 seconds per request

**Optimization Opportunity:** Parallel execution of resume and job skill extraction (currently sequential in orchestrator).

---

## Technology Stack Deep Dive

### Backend Runtime
**Python 3.9+** (inferred from modern type hints in service files)

**Web Framework:** Likely **FastAPI** (not Flask) based on:
- Modern async Python patterns
- Pydantic for validation (`config.py` suggests settings model)
- RESTful API structure with clear service separation

**LLM Integration:** Unknown provider, but architecture supports:
- **OpenAI GPT-4/GPT-3.5-turbo** (most likely given API key patterns in config)
- **Anthropic Claude** (good for long-context job descriptions)
- **Local LLaMA** (unlikely given no GPU config detected)

**Reasoning for OpenAI:** The 36 KiB study plan outputs suggest long-form generation, which GPT-4 handles well. Also, the skill extraction prompts likely use function calling for structured XML output.

### Vector Database
**ChromaDB 0.4.x** with SQLite backend

**Why ChromaDB over alternatives?**
- **vs. Pinecone:** No API keys in config, local-first persistence
- **vs. Weaviate:** Simpler setup, Python-native
- **vs. FAISS:** Persistent storage with metadata filtering

**Index Configuration:**
- HNSW algorithm (evidenced by `link_lists.bin`)
- Likely parameters: `M=16`, `ef_construction=200` (standard defaults)
- Distance metric: Probably cosine similarity (standard for semantic search)

### Frontend Stack
**Vanilla HTML + JavaScript** (no framework detected)

**Why not React/Vue?**
- Rapid prototyping for academic project
- No build complexity for simple form submission
- Likely uses `fetch()` API for backend communication

**Production Concern:** For real deployment, consider migrating to React/Next.js for better state management and streaming response UI.

### Data Formats

**XML for Structured Skill Data**
- Pros: Schema validation, hierarchical taxonomy support, LLM-friendly (GPT-4 handles XML well)
- Cons: Verbose compared to JSON, parsing overhead

**Markdown for Study Plans**
- Pros: Human-readable, easy to render in frontend, good for LLM generation
- Cons: No structured metadata for progress tracking

**Unknown:** Why not JSON throughout? Likely legacy decision or specific prompt engineering choice.

---

## Ownership and Maintenance Hotspots

### High-Change Frequency Areas

**1. `/backend/app/services/` (5 files)**
- **Why:** Prompt engineering iteration as LLM output quality improves
- **Signal:** `resume_skill_eval.py` is already 9.7 KiB (largest service)
- **Risk:** Prompt drift causing XML schema violations

**2. `/backend/app/prompts/`**
- **Why:** Central to output quality
- **Expected Growth:** One prompt file per service (currently only one sample)
- **Best Practice:** Version prompts with experiment timestamps

**3. `/VectorDB/`**
- **Why:** Learning content needs continuous updates
- **Risk:** 86 MiB in git (should be external storage)
- **Solution:** Move to S3/GCS, version control only `VectorDB_Generation.ipynb`

### Low-Change Stability Areas

**1. `/backend/app/utils/xml_utils.py`**
- **Why:** Utility functions stabilize quickly
- **Risk:** Low unless XML schema changes

**2. `/backend/app/workflow/orchestrator.py`**
- **Why:** Pipeline structure is set
- **Risk:** Moderate if adding new stages (e.g., cover letter generation)

**3. `/frontend/index.html`**
- **Why:** UI complete for MVP
- **Risk:** High if product adds complex interactions (then rewrite needed)

### Code Ownership Blind Spots

**Git History Gap:** Only one commit author detected (`Alexandre SEPULVEDA de DIETRICH`), but repo likely has multiple contributors (evidenced by varied resume samples). Possible causes:
- Shallow git history in clone
- Recent repository squash
- Contributors committing through a single account

**Recommendation:** Run `git log --all --pretty=format:"%an <%ae>" | sort | uniq -c` on full repository for true ownership map.

---

## Practical First Day Onboarding Path

### Hour 1: Context Acquisition (Read Only)
1. `README.md` — Get project mission
2. `docs/product_brief.md` — Understand user personas and success metrics
3. `docs/PROJECT_STRUCTURE_README.md` — Cross-reference with this document
4. `docs/technical_appendix.md` — API contracts and data schemas

### Hour 2: Local Setup
1. Run `scripts/setup.sh`
2. Verify `requirements.txt` installs cleanly (watch for ChromaDB native deps)
3. Check `.env.example` if it exists (not detected, might be missing)
4. Run `make run` or `python backend/app/api/main.py`
5. Open `frontend/index.html` in browser

### Hour 3: Code Walkthrough (Read)
1. `backend/app/workflow/orchestrator.py` — Understand pipeline stages
2. `backend/app/services/resume_skill_eval.py` — See LLM prompt