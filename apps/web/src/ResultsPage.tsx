import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiAlertCircle, FiArrowLeft, FiFileText } from "react-icons/fi";

type JobStatus = "queued" | "running" | "done" | "error";
type FlowStatus = "idle" | "running" | "done" | "error";

type JobResponse = {
  jobId: string;
  status: JobStatus;
  progressPct?: number;
  progressStage?: string;
  flowStatus?: FlowStatus;
  flowProgressPct?: number;
  flowProgressStage?: string;
  flowError?: string;
  error?: string;
  artifacts?: {
    name: string;
    contentType: string;
  }[];
};

type GenerateFlowchartResponse = {
  jobId: string;
  highLevelDescription: string;
  mermaidFlowchart: string;
};

type ResultsTab = "report" | "flowchart";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").trim() || "http://localhost:8787";

async function readErrorMessage(res: Response): Promise<string> {
  const fallback = `HTTP ${res.status}`;
  const raw = await res.text();
  if (!raw) return fallback;
  if (/^\s*<!doctype html>/i.test(raw) || /^\s*<html/i.test(raw)) {
    return `Received HTML instead of API JSON from ${res.url}. Check NEXT_PUBLIC_API_BASE (expected http://localhost:8787 in local dev).`;
  }
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string }; message?: string };
    return parsed.error?.message || parsed.message || raw;
  } catch {
    return raw;
  }
}

async function getJob(jobId: string): Promise<JobResponse> {
  const res = await fetch(`${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}`);
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as JobResponse;
}

async function fetchArtifactText(jobId: string, name: string): Promise<string> {
  const res = await fetch(
    `${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}/artifacts/${encodeURIComponent(name)}`,
  );
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return await res.text();
}

async function generateFlowchart(jobId: string): Promise<GenerateFlowchartResponse> {
  const res = await fetch(`${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}/flowchart`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as GenerateFlowchartResponse;
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

interface ResultsPageProps {
  jobId: string;
  onBack: () => void;
}

export default function ResultsPage({ jobId, onBack }: ResultsPageProps) {
  const [job, setJob] = useState<JobResponse | null>(null);
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const [flowDescription, setFlowDescription] = useState<string | null>(null);
  const [mermaidSource, setMermaidSource] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ResultsTab>("report");
  const [loading, setLoading] = useState(true);
  const [flowBusy, setFlowBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flowProgressPct = useMemo(() => {
    const n = Number(job?.flowProgressPct ?? 0);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }, [job?.flowProgressPct]);

  const flowProgressStage = job?.flowProgressStage ?? "Not started";

  async function loadFlowArtifactsIfPresent(next: JobResponse): Promise<void> {
    const names = new Set((next.artifacts ?? []).map((a) => a.name));
    if (!names.has("high-level-description.md") || !names.has("high-level-flow.mmd")) {
      return;
    }

    const [description, mmd] = await Promise.all([
      fetchArtifactText(jobId, "high-level-description.md"),
      fetchArtifactText(jobId, "high-level-flow.mmd"),
    ]);

    setFlowDescription(description);
    setMermaidSource(mmd);
  }

  useEffect(() => {
    let active = true;

    async function loadResults() {
      try {
        let next = await getJob(jobId);
        if (!active) return;
        setJob(next);

        while (next.status === "queued" || next.status === "running") {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 500));
          // eslint-disable-next-line no-await-in-loop
          next = await getJob(jobId);
          if (!active) return;
          setJob(next);
        }

        if (next.status === "error") {
          setError(next.error || "Failed to generate report");
          return;
        }

        const report = await fetchArtifactText(jobId, "structure-report.md");
        if (!active) return;
        setReportMarkdown(report);

        await loadFlowArtifactsIfPresent(next);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadResults();

    return () => {
      active = false;
    };
  }, [jobId]);

  async function handleGenerateFlowchart() {
    setError(null);
    setFlowBusy(true);

    const poll = window.setInterval(() => {
      void getJob(jobId)
        .then((next) => setJob(next))
        .catch(() => {
          // best-effort polling while request is active
        });
    }, 450);

    try {
      const generated = await generateFlowchart(jobId);
      setFlowDescription(generated.highLevelDescription);
      setMermaidSource(generated.mermaidFlowchart);
      setActiveTab("flowchart");
      const next = await getJob(jobId);
      setJob(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      window.clearInterval(poll);
      setFlowBusy(false);
    }
  }

  return (
    <div className="results-page">
      <header className="results-header">
        <div className="header-content">
          <div className="logo">Onboardy</div>
          <button className="back-button" onClick={onBack}>
            <FiArrowLeft className="back-icon" />
            Back to Home
          </button>
        </div>
      </header>

      <div className="results-container">
        {loading ? (
          <div className="loading-state">
            <FiFileText className="loading-icon" />
            <p>Loading your report...</p>
          </div>
        ) : null}

        {error ? (
          <div className="error-state">
            <FiAlertCircle className="error-icon" />
            <p>Error: {error}</p>
            <button onClick={onBack}>Go Back</button>
          </div>
        ) : null}

        {!loading && reportMarkdown ? (
          <div className="markdown-container">
            <div className="results-toolbar">
              <div className="results-tabs">
                <button
                  className={`results-tab ${activeTab === "report" ? "active" : ""}`}
                  onClick={() => setActiveTab("report")}
                >
                  Markdown Report
                </button>
                <button
                  className={`results-tab ${activeTab === "flowchart" ? "active" : ""}`}
                  onClick={() => setActiveTab("flowchart")}
                  disabled={!mermaidSource && !flowBusy}
                >
                  Mermaid Flowchart
                </button>
              </div>

              <button
                className="generate-flow-button"
                onClick={handleGenerateFlowchart}
                disabled={flowBusy}
              >
                {flowBusy ? "Generating..." : mermaidSource ? "Regenerate Flowchart" : "Generate Flowchart"}
              </button>
            </div>

            {activeTab === "report" ? (
              <article className="markdown-content markdown-rendered">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportMarkdown}</ReactMarkdown>
              </article>
            ) : (
              <div className="flowchart-panel">
                {(flowBusy || job?.flowStatus === "running" || job?.flowStatus === "error") && (
                  <div className="flow-progress">
                    <div className="flow-progress-head">
                      <span>Flowchart Generation</span>
                      <span>{flowProgressPct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${flowProgressPct}%` }} />
                    </div>
                    <p className="progress-text">
                      {job?.flowStatus === "error" && job.flowError
                        ? `${flowProgressStage} (${job.flowError})`
                        : flowProgressStage}
                    </p>
                  </div>
                )}

                {flowDescription ? (
                  <article className="markdown-content markdown-rendered">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{flowDescription}</ReactMarkdown>
                  </article>
                ) : null}

                {mermaidSource ? (
                  <div className="flowchart-render">
                    <MermaidDiagram chart={mermaidSource} />
                    <details>
                      <summary>View Mermaid Source</summary>
                      <pre>{mermaidSource}</pre>
                    </details>
                  </div>
                ) : (
                  <p className="flowchart-empty">Generate a Mermaid flowchart to view it here.</p>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
