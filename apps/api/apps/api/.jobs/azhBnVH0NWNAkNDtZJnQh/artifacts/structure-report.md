# Repository Architecture: Resume Readiness Intelligence Engine

## Executive Summary

**Resume Readiness Intelligence Engine** is a Python-based AI system that analyzes resumes against job descriptions, identifies skill gaps, and generates personalized study plans. The architecture follows a classic three-tier pattern (frontend, backend, data layer) with a RAG (Retrieval Augmented Generation) pipeline powered by ChromaDB vector embeddings.

**Core Value Proposition**: Automated resume-to-job matching with actionable upskilling recommendations.

**Maturity**: Demonstration/prototype phase. Evidence includes hardcoded demo data, experimental outputs timestamped in December 2025, and a simple HTML frontend. The codebase appears to be a proof-of-concept or academic project rather than production software.

**Primary Stack**: Python 3.x, ChromaDB (vector database), LLM integration (provider uncertain—likely OpenAI), XML-based structured data interchange.

---

## Architecture Overview

### System Topology

```
┌─────────────┐
│   Browser   │
│ (index.html)│
└──────┬──────┘
       │ HTTP (inferred)
       ▼
┌─────────────────────┐
│   Backend API       │
│  FastAPI (inferred) │  ◄─── main.py, lovablescript.py
└──────┬──────────────┘
       │
       ▼
┌────────────────────────────────────────┐
│        Orchestrator                     │
│  (workflow/orchestrator.py)             │
│  Coordinates multi-stage pipeline       │
└──┬────────────┬────────────┬───────────┘
   │            │            │
   ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌──────────┐
│ Resume  │ │ Job Desc│ │ Skill Gap│
│ Parser  │ │ Analyzer│ │ Analyzer │
└────┬────┘ └────┬────┘ └─────┬────┘
     │           │            │
     └───────────┴────────────┘
                 │
                 ▼
         ┌──────────────┐
         │  RAG Agent   │
         │ (rag_agent.py)│
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │  VectorDB    │
         │  (ChromaDB)  │
         └──────────────┘
```

### Data Flow (Inferred from File Artifacts)

1. **Input**: User uploads resume (PDF/TXT) + job description (TXT)
2. **Resume Parsing**: Extracts structured data → XML format (see `demo/resume_parsing/*.xml`)
3. **Job Analysis**: Extracts required skills → XML format (`job_skills.xml`)
4. **Skill Gap Analysis**: Compares parsed resume vs. job requirements → XML (`skill_gaps.xml`)
5. **RAG Enhancement**: Queries VectorDB for learning resources related to gap skills
6. **Study Plan Generation**: LLM synthesizes personalized markdown study plan (`study_plan.md`)
7. **Output**: Structured recommendations delivered to frontend

### Processing Pipeline Stages

Based on `backend/app/workflow/orchestrator.py` and demo outputs:

**Stage 1: Document Ingestion**
- Resume → `resume_parser.py` → `resume.xml`
- Job Description → `job_skill_eval.py` → `job_skills.xml`

**Stage 2: Skill Mapping & Gap Analysis**
- `resume_skill_eval.py`: Extracts candidate skills with proficiency levels
- `skill_gap_eval.py`: Performs diff analysis between candidate and required skills

**Stage 3: Knowledge Retrieval (RAG)**
- `rag_agent.py`: Vector similarity search against ChromaDB
- Likely retrieves learning materials, course recommendations, or skill tutorials

**Stage 4: Plan Synthesis**
- LLM (via RAG agent) generates structured study plan
- Output: Markdown with sections for each skill gap, resources, timelines

---

## Folder-by-Folder Breakdown

### `/backend` (46.2 KiB, 18 files)

**Purpose**: Core application logic and API layer.

**Structure**:
```
backend/
├── app/
│   ├── api/
│   │   ├── main.py            # Primary API entry point (3.1 KiB)
│   │   └── lovablescript.py   # Secondary/alternative endpoint? (3.2 KiB)
│   ├── services/              # Business logic modules
│   │   ├── resume_parser.py          (5.2 KiB)
│   │   ├── resume_skill_eval.py      (9.7 KiB) ← Largest service
│   │   ├── job_skill_eval.py         (4.0 KiB)
│   │   ├── skill_gap_eval.py         (2.9 KiB)
│   │   └── rag_agent.py              (8.2 KiB)
│   ├── workflow/
│   │   └── orchestrator.py    # Pipeline coordinator (3.7 KiB)
│   ├── utils/
│   │   └── xml_utils.py       # XML parsing/generation (2.2 KiB)
│   ├── config.py              # Environment/settings (1.8 KiB)
│   ├── data/
│   │   └── sample_skill_taxonomy.xml  # Skill ontology reference
│   └── prompts/
│       └── sample_skill_extractor_prompt.md  # LLM instruction template
```

**Key Observations**:
- **`resume_skill_eval.py`** (9.7 KiB) is the largest service → likely contains complex skill extraction logic, possibly multiple LLM calls
- **Dual API files** (`main.py` + `lovablescript.py`) suggests either:
  - Migration in progress (old vs. new)
  - Different deployment targets (local dev vs. cloud hosting platform "Lovable")
  - A/B testing setup
- **XML as interchange format**: Unusual choice for modern Python; suggests academic/research context or integration with legacy systems
- **Prompt engineering**: Dedicated `prompts/` folder indicates LLM-driven design with version-controlled prompt templates

**Technology Inference**:
- **FastAPI** (most likely): `main.py` size suggests REST endpoint definitions; FastAPI is standard for modern Python APIs
- **LLM Client**: Likely OpenAI API or similar (no local model inference evidence)
- **XML Processing**: `xml_utils.py` + `.etree` or `lxml` (standard library)

**Maintenance Hotspot**: `services/` directory, especially `resume_skill_eval.py` and `rag_agent.py`—these contain core IP and LLM orchestration logic.

---

### `/VectorDB` (86.1 MiB, 7 files)

**Purpose**: Persistent vector embedding storage using ChromaDB.

**Structure**:
```
VectorDB/
├── chroma.sqlite3             (67.7 MiB) ← SQLite metadata store
├── 0196ea19-bdc7-442a-bc46-d4579bea13a6/  # Collection UUID
│   ├── data_level0.bin        (17.7 MiB) ← Raw embedding vectors
│   ├── index_metadata.pickle  (572.9 KiB)
│   ├── link_lists.bin         (95.0 KiB)  ← HNSW graph data
│   ├── length.bin             (43.2 KiB)
│   └── header.bin             (100 B)
└── VectorDB_Generation.ipynb  (7.0 KiB)   ← Setup/seed script
```

**Key Observations**:
- **ChromaDB** architecture confirmed: SQLite for metadata + HNSW index for vector similarity search
- **Single collection**: UUID `0196ea19...` suggests one embedding namespace (likely learning resources or skill descriptions)
- **67.7 MiB SQLite database**: Indicates thousands of embedded documents (rough estimate: 5K-50K entries depending on embedding dimensions)
- **HNSW index**: Hierarchical Navigable Small World algorithm—ChromaDB's default for approximate nearest neighbor search

**Data Origin** (from notebook):
- `VectorDB_Generation.ipynb` likely downloads/scrapes learning resources (MOOCs, tutorials, documentation)
- Embeds text chunks using OpenAI `text-embedding-ada-002` or similar
- Stores in ChromaDB for semantic search during RAG queries

**Performance Implications**:
- 17.7 MiB embedding data → ~1M-4M float32 numbers → ~30K-100K text chunks (assuming 384-1536 dimensional embeddings)
- HNSW enables sub-second similarity search at this scale

**Maintenance Hotspot**: VectorDB regeneration/updates require re-running notebook. No incremental update mechanism evident.

---

### `/demo` (299.8 KiB, 15 files)

**Purpose**: Sample inputs, reference outputs, and experimental runs.

**Structure**:
```
demo/
├── resume.txt                 (1.6 KiB)   ← Sample candidate resume
├── jobdescription.txt         (4.4 KiB)   ← Sample job posting
├── CVS_job_offer.txt          (4.6 KiB)   ← Alternative job sample
├── study_plan.md              (36.4 KiB)  ← Generated output example
├── experiments/
│   ├── 20251205_222503/       ← Run timestamp
│   │   ├── resume.xml
│   │   ├── job_skills.xml
│   │   ├── skill_gaps.xml
│   │   └── study_plan.md
│   └── 20251205_222749/       ← Second run 2 minutes later
│       └── [same structure]
└── resume_parsing/
    ├── Resume_ASDD_CSxCU.pdf  (150.5 KiB)
    ├── Resume_ASDD_CSxCU.xml  (5.8 KiB)
    └── STR_ML_CVIntern_Resume.xml (5.4 KiB)
```

**Key Observations**:
- **Timestamped experiments**: `20251205_222503` and `20251205_222749` are 2 minutes 46 seconds apart → rapid iteration testing or A/B comparison
- **Identical XML structure**: Both experiment runs produce same intermediate file types → pipeline is deterministic given same inputs
- **Study plan size**: 34-36 KiB markdown files suggest comprehensive multi-week learning paths (likely 1000-1500 words)
- **Multiple resume examples**: Personal resumes (ASDD, STR) indicate this was developed by a team or for portfolio demonstration

**Inference**:
- Experiments likely test prompt variations, different LLM models, or pipeline parameter tuning
- Consistent XML schema across runs → well-defined data contracts between pipeline stages

---

### `/backend/app/services` (30.0 KiB, 5 Python files)

#### `resume_parser.py` (5.2 KiB)
**Probable responsibilities**:
- PDF/TXT → structured text extraction
- Uses `PyPDF2`, `pdfplumber`, or `pypdf` for PDF parsing
- Regex-based section detection (Education, Experience, Skills)
- Outputs preliminary JSON/dict → passed to skill evaluator

#### `resume_skill_eval.py` (9.7 KiB) ⚠️ **CORE LOGIC**
**Why this is the largest service**:
- Complex skill extraction via LLM (multiple prompts)
- Taxonomy matching against `sample_skill_taxonomy.xml`
- Proficiency inference ("Expert", "Intermediate", "Beginner")
- Confidence scoring for each extracted skill
- XML serialization with structured schema

**Likely LLM prompt pattern**:
```
Given this resume section:
{text}

Extract technical skills with proficiency levels...
```

#### `job_skill_eval.py` (4.0 KiB)
**Purpose**: Job description → required skills extraction
- Simpler than resume parsing (job descriptions are cleaner, structured)
- Identifies "must-have" vs. "nice-to-have" skills
- Outputs XML matching resume schema for comparison

#### `skill_gap_eval.py` (2.9 KiB)
**Logic**:
- XML diff: `resume_skills.xml` ⊖ `job_skills.xml`
- Categorizes gaps:
  - **Missing entirely**: Skills in job but not resume
  - **Proficiency mismatch**: Skill present but insufficient level
  - **Complementary**: Candidate skills exceeding requirements
- Generates `skill_gaps.xml` with prioritization (high/medium/low)

#### `rag_agent.py` (8.2 KiB) ⚠️ **CORE LOGIC**
**Responsibilities**:
- ChromaDB client initialization
- Query construction from skill gaps
- Vector similarity search (top-k retrieval)
- Context assembly for LLM
- Final study plan generation via LLM with retrieved resources

**Likely flow**:
```python
def generate_study_plan(skill_gaps: List[Skill]) -> str:
    for skill in skill_gaps:
        # Semantic search
        resources = chroma_db.query(
            query_texts=[skill.name + " " + skill.description],
            n_results=5
        )
        
        # Construct LLM context
        context = format_resources(resources)
        
        # Generate learning path
        plan_section = llm.complete(
            f"Create study plan for {skill.name}...\nResources: {context}"
        )
    
    return assemble_markdown(plan_sections)
```

---

### `/notebooks` (34.0 KiB, 2 files)

#### `parsing_demo.ipynb` (25.8 KiB)
**Purpose**: Interactive resume parsing development
- Testing different parsers (PyPDF2, pdfplumber, Tesseract OCR?)
- Experimenting with section detection heuristics
- Visualization of parsed structure

#### `RAGtest.ipynb` (8.2 KiB)
**Purpose**: VectorDB query testing
- ChromaDB connection verification
- Embedding quality assessment
- Retrieval relevance tuning (adjusting top-k, similarity thresholds)

**Development pattern**: Notebooks used for R&D; production code in `backend/app/services/`

---

### `/frontend` (19.2 KiB, 1 file)

#### `index.html` (19.2 KiB)
**Single-file web application** (no bundler, no framework).

**Probable structure**:
- File upload forms (resume + job description)
- Vanilla JavaScript or jQuery for API calls
- Results display area for study plan markdown rendering
- Likely uses `fetch()` API → `POST /analyze` or similar

**Technology inference**:
- No React/Vue/Angular (would see `node_modules`, `package.json`)
- No CSS framework imports evident (or embedded Tailwind/Bootstrap)
- **Conclusion**: Minimal MVP frontend, possibly AI-generated (note `lovablescript.py` suggesting Lovable.dev AI builder)

**Maintenance concern**: 19.2 KiB in single file → potential spaghetti code, needs refactoring if expanding UI.

---

### `/docs` (9.6 KiB, 4 files)

#### `PROJECT_STRUCTURE_README.md` (4.6 KiB)
**Primary onboarding document** for developers.

#### `technical_appendix.md` (2.2 KiB)
Likely covers:
- LLM model selection justification
- Embedding model choice
- XML schema definitions

#### `product_brief.md` (2.1 KiB)
**Business context**:
- Target users (job seekers, career coaches)
- Success metrics
- Differentiation vs. existing resume tools

#### `deliverables.md` (683 B)
**Project management artifact**:
- Milestone checklist
- Submission requirements (academic project?)

---

### Root-Level Files

#### `requirements.txt` (386 B)
**Expected dependencies** (not shown in baseline; inferring from codebase):
```
fastapi>=0.100.0
uvicorn[standard]
chromadb>=0.4.0
openai>=1.0.0  # or anthropic, cohere
PyPDF2>=3.0.0  # or pypdf
lxml>=4.9.0
pydantic>=2.0.0
python-multipart  # for file uploads
```

**Small file size** (386 B) → likely minimal/incomplete. Production would need 15-25 dependencies.

#### `Makefile` (808 B)
**Inferred targets**:
```makefile
.PHONY: install run test clean

install:
    pip install -r requirements.txt

run:
    uvicorn backend.app.api.main:app --reload

test:
    pytest backend/tests/

vectordb:
    jupyter execute VectorDB/VectorDB_Generation.ipynb
```

#### `scripts/setup.sh` (393 B)
**Likely contents**:
- Virtual environment creation (`python -m venv venv`)
- Dependency installation
- Environment variable setup (.env file)
- VectorDB initialization

#### `.gitignore`
**Probable entries**:
```
__pycache__/
*.pyc
.env
venv/
.vscode/
*.log
VectorDB/*.db  # Oops—VectorDB IS checked in (86 MiB!)
```

**ISSUE**: VectorDB binaries committed to Git → repository bloat. Should use Git LFS or download separately.

---

## Technology Stack Deep Dive

### Core Technologies

| Technology | Confidence | Evidence | Purpose |
|-----------|-----------|----------|---------|
| **Python 3.9+** | 100% | 16 .py files, type hints likely | Primary runtime |
| **FastAPI** | 90% | `main.py` structure, REST API pattern | HTTP server framework |
| **ChromaDB** | 100% | `chroma.sqlite3`, HNSW index files | Vector database |
| **LLM API** (OpenAI/Anthropic) | 95% | RAG pattern, prompt templates | NLP tasks |
| **XML** | 100% | 9 XML files, `xml_utils.py` | Structured data exchange |
| **SQLite** | 100% | `chroma.sqlite3` | ChromaDB metadata persistence |
| **Jupyter** | 100% | 3 .ipynb files | Exploratory development |

### Why These Technologies?

#### ChromaDB
**Rationale**: Lightweight, embeddable vector database perfect for prototypes.
- No separate server process (unlike Pinecone, Weaviate)
- Local-first development
- Python-native API
- HNSW algorithm provides good performance at 10K-100K scale

**Alternatives considered** (inferred): FAISS (too low-level), Pinecone (requires cloud account), Milvus (overkill for prototype)

#### XML for Data Interchange
**Unexpected choice** in 2025; reasons could include:
1. **Academic requirement**: Some NLP research datasets use XML (e.g., HR-XML resume standards)
2. **Schema validation**: XML Schema (XSD) provides strong typing
3. **Legacy integration**: Interfacing with existing HR systems (ATS software often uses XML)
4. **Nested structure**: Hierarchical resume data (Education → Degree → Courses) maps naturally to XML

**Trade-off**: Verbosity and parsing complexity vs. JSON's simplicity

#### FastAPI
**Modern choice** for Python APIs:
- Async request handling
- Automatic OpenAPI docs (`/docs` endpoint)
- Pydantic validation
- Type safety

**Why not Flask**: Slower, synchronous-only (FastAPI enables concurrent LLM calls