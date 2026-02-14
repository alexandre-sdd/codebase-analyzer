import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type JobStatus = "queued" | "running" | "done" | "error";
type FlowStatus = "idle" | "running" | "done" | "error";
type ResultTab = "report" | "flowchart";

type CreateJobResponse = {
  jobId: string;
};

type GenerateFlowchartResponse = {
  jobId: string;
  artifacts: {
    name: string;
    contentType: string;
  }[];
  highLevelDescription: string;
  mermaidFlowchart: string;
};

type JobResponse = {
  jobId: string;
  status: JobStatus;
  progressPct?: number;
  progressStage?: string;
  flowStatus?: FlowStatus;
  flowProgressPct?: number;
  flowProgressStage?: string;
  flowError?: string;
  createdAt: string;
  updatedAt: string;
  sourceType?: "local" | "github";
  repoPath?: string;
  repoUrl?: string;
  repoRef?: string;
  error?: string;
  artifacts?: {
    name: string;
    contentType: string;
  }[];
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8787";

async function createJob(input: { repoPath?: string; repoUrl?: string; repoRef?: string }): Promise<CreateJobResponse> {
  const res = await fetch(`${API_BASE}/v1/jobs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as CreateJobResponse;
}

async function getJob(jobId: string): Promise<JobResponse> {
  const res = await fetch(`${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}`);
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as JobResponse;
}

async function generateFlowchart(jobId: string): Promise<GenerateFlowchartResponse> {
  const res = await fetch(`${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}/flowchart`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as GenerateFlowchartResponse;
}

async function fetchArtifactText(jobId: string, name: string): Promise<string> {
  const res = await fetch(
    `${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}/artifacts/${encodeURIComponent(name)}`,
  );
  if (!res.ok) throw new Error(await res.text());
  return await res.text();
}

function MermaidDiagram({ chart }: { chart: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function render() {
      if (!hostRef.current) return;
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "strict",
        });
        const id = `flow-${Math.random().toString(36).slice(2, 10)}`;
        const { svg } = await mermaid.render(id, chart);
        if (!active || !hostRef.current) return;
        hostRef.current.innerHTML = svg;
        setRenderError(null);
      } catch (err) {
        if (!active || !hostRef.current) return;
        hostRef.current.innerHTML = "";
        setRenderError(err instanceof Error ? err.message : String(err));
      }
    }

    void render();
    return () => {
      active = false;
    };
  }, [chart]);

  return (
    <div className="mermaid-wrap">
      {renderError ? <div className="mermaid-error">Mermaid render failed: {renderError}</div> : null}
      <div className="mermaid-host" ref={hostRef} />
    </div>
  );
}

function MarkdownView({ content }: { content: string }) {
  return (
    <div className="markdown-view">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

export default function App() {
  const [repoPath, setRepoPath] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoRef, setRepoRef] = useState("");
  const [job, setJob] = useState<JobResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [flowBusy, setFlowBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [structureReport, setStructureReport] = useState<string | null>(null);
  const [highLevelDescription, setHighLevelDescription] = useState<string | null>(null);
  const [mermaidFlowchart, setMermaidFlowchart] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>("report");

  const analysisProgressPct = useMemo(() => {
    const n = Number(job?.progressPct ?? 0);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }, [job?.progressPct]);

  const flowProgressPct = useMemo(() => {
    const n = Number(job?.flowProgressPct ?? 0);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }, [job?.flowProgressPct]);

  const analysisStage = job?.progressStage ?? "Waiting";
  const flowStage = job?.flowProgressStage ?? "Not started";

  const hasResults = Boolean(structureReport || mermaidFlowchart || highLevelDescription);

  async function loadFlowArtifactsIfPresent(next: JobResponse): Promise<void> {
    const artifactNames = new Set((next.artifacts ?? []).map((a) => a.name));
    if (!artifactNames.has("high-level-description.md") || !artifactNames.has("high-level-flow.mmd")) {
      return;
    }

    try {
      const [description, mermaid] = await Promise.all([
        fetchArtifactText(next.jobId, "high-level-description.md"),
        fetchArtifactText(next.jobId, "high-level-flow.mmd"),
      ]);
      setHighLevelDescription(description);
      setMermaidFlowchart(mermaid);
    } catch {
      // Optional flow artifacts; no-op if unavailable.
    }
  }

  async function run() {
    const trimmedPath = repoPath.trim();
    const trimmedUrl = repoUrl.trim();
    const trimmedRef = repoRef.trim();
    const hasPath = Boolean(trimmedPath);
    const hasUrl = Boolean(trimmedUrl);

    if (hasPath === hasUrl) {
      setError("Provide exactly one source: local repo path OR GitHub URL.");
      return;
    }

    setError(null);
    setBusy(true);
    setFlowBusy(false);
    setJob(null);
    setStructureReport(null);
    setHighLevelDescription(null);
    setMermaidFlowchart(null);
    setActiveTab("report");

    try {
      const { jobId } = await createJob(
        hasPath
          ? { repoPath: trimmedPath }
          : {
              repoUrl: trimmedUrl,
              repoRef: trimmedRef || undefined,
            },
      );

      let next = await getJob(jobId);
      setJob(next);

      while (next.status === "queued" || next.status === "running") {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 450));
        // eslint-disable-next-line no-await-in-loop
        next = await getJob(jobId);
        setJob(next);
      }

      if (next.status === "done") {
        const report = await fetchArtifactText(next.jobId, "structure-report.md");
        setStructureReport(report);
        await loadFlowArtifactsIfPresent(next);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function generateFlowchartFromMarkdown() {
    if (!job) return;

    setError(null);
    setFlowBusy(true);

    const timer = window.setInterval(() => {
      void getJob(job.jobId)
        .then((next) => setJob(next))
        .catch(() => {
          // Polling is best-effort while generation request is in-flight.
        });
    }, 450);

    try {
      const generated = await generateFlowchart(job.jobId);
      setHighLevelDescription(generated.highLevelDescription);
      setMermaidFlowchart(generated.mermaidFlowchart);
      setActiveTab("flowchart");

      const next = await getJob(job.jobId);
      setJob(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      window.clearInterval(timer);
      setFlowBusy(false);
    }
  }

  return (
    <div className="shell">
      <div className="hero">
        <h1>Codebase Analyzer</h1>
        <p>
          Analyze a repository, get a detailed markdown report, then generate a high-level Mermaid flowchart.
        </p>
      </div>

      <div className="grid">
        <div className="card">
          <h2>Analyze</h2>
          <div className="row">
            <label>
              Local repo path
              <input
                value={repoPath}
                placeholder="/path/to/repo"
                onChange={(e) => setRepoPath(e.target.value)}
              />
            </label>
            <label>
              GitHub repo URL
              <input
                value={repoUrl}
                placeholder="https://github.com/owner/repo"
                onChange={(e) => setRepoUrl(e.target.value)}
              />
            </label>
            <label>
              Branch or tag (optional)
              <input
                value={repoRef}
                placeholder="main"
                onChange={(e) => setRepoRef(e.target.value)}
              />
            </label>

            <div className="btns">
              <button
                onClick={run}
                disabled={busy || flowBusy || (Boolean(repoPath.trim()) === Boolean(repoUrl.trim()))}
              >
                {busy ? "Analyzing..." : "Analyze Repository"}
              </button>
              <button
                className="secondary"
                onClick={generateFlowchartFromMarkdown}
                disabled={busy || flowBusy || !job || job.status !== "done" || !structureReport}
              >
                {flowBusy ? "Generating Flowchart..." : "Generate Mermaid Flowchart"}
              </button>
            </div>

            {error ? (
              <div className="pill" style={{ borderColor: "rgba(255,107,107,0.45)" }}>
                <span style={{ color: "var(--danger)" }}>Error:</span>
                <span>{error}</span>
              </div>
            ) : null}

            {job ? (
              <>
                <div className="progress-block">
                  <div className="progress-head">
                    <span>Repository Analysis</span>
                    <span>{analysisProgressPct}%</span>
                  </div>
                  <div className="progress-stage">{analysisStage}</div>
                  <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={analysisProgressPct}>
                    <div className="progress-fill" style={{ width: `${analysisProgressPct}%` }} />
                  </div>
                </div>

                <div className="progress-block">
                  <div className="progress-head">
                    <span>Mermaid Flowchart</span>
                    <span>{flowProgressPct}%</span>
                  </div>
                  <div className="progress-stage">
                    {job.flowStatus === "error" && job.flowError ? `${flowStage} (${job.flowError})` : flowStage}
                  </div>
                  <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={flowProgressPct}>
                    <div className="progress-fill" style={{ width: `${flowProgressPct}%` }} />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {hasResults ? (
        <>
          <div style={{ height: 14 }} />
          <div className="card">
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === "report" ? "active" : ""}`}
                onClick={() => setActiveTab("report")}
              >
                Report
              </button>
              <button
                className={`tab-btn ${activeTab === "flowchart" ? "active" : ""}`}
                onClick={() => setActiveTab("flowchart")}
                disabled={!mermaidFlowchart}
              >
                Flowchart
              </button>
            </div>

            {activeTab === "report" ? (
              structureReport ? (
                <MarkdownView content={structureReport} />
              ) : (
                <p style={{ color: "var(--muted)", margin: 0 }}>Run an analysis to view the report.</p>
              )
            ) : (
              <div className="row">
                {highLevelDescription ? (
                  <>
                    <h3 className="section-title">High-Level Description</h3>
                    <MarkdownView content={highLevelDescription} />
                  </>
                ) : null}

                {mermaidFlowchart ? (
                  <>
                    <h3 className="section-title">Mermaid Diagram</h3>
                    <MermaidDiagram chart={mermaidFlowchart} />
                    <details>
                      <summary>View Mermaid Source</summary>
                      <pre>{mermaidFlowchart}</pre>
                    </details>
                  </>
                ) : (
                  <p style={{ color: "var(--muted)", margin: 0 }}>
                    Generate a Mermaid flowchart to view this tab.
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
