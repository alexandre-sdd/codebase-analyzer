import { useMemo, useState } from "react";

type JobStatus = "queued" | "running" | "done" | "error";

type CreateJobResponse = {
  jobId: string;
};

type JobResponse = {
  jobId: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  repoPath?: string;
  error?: string;
  artifacts?: {
    name: string;
    contentType: string;
  }[];
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8787";

async function createJob(repoPath: string): Promise<CreateJobResponse> {
  const res = await fetch(`${API_BASE}/v1/jobs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ repoPath }),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as CreateJobResponse;
}

async function getJob(jobId: string): Promise<JobResponse> {
  const res = await fetch(`${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}`);
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as JobResponse;
}

async function downloadArtifact(jobId: string, name: string): Promise<void> {
  const res = await fetch(
    `${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}/artifacts/${encodeURIComponent(name)}`,
  );
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function fetchArtifactText(jobId: string, name: string): Promise<string> {
  const res = await fetch(
    `${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}/artifacts/${encodeURIComponent(name)}`,
  );
  if (!res.ok) throw new Error(await res.text());
  return await res.text();
}

async function fetchArtifactJson<T>(jobId: string, name: string): Promise<T> {
  const res = await fetch(
    `${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}/artifacts/${encodeURIComponent(name)}`,
  );
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

type AnalysisJson = {
  repo: { path: string; scannedAt: string };
  stats: {
    totalFiles: number;
    totalBytes: number;
    languages: { name: string; files: number; bytes: number }[];
    topLevelDirs: string[];
    manifests: string[];
  };
  graph: {
    modules: { id: string; label: string }[];
    edges: { from: string; to: string; weight: number }[];
  };
  git?: {
    isRepo: boolean;
    head?: { sha: string; message: string; author: string; date: string };
    topAuthors?: { name: string; emails: string[]; commits: number }[];
  };
  notes: string[];
};

type TaskJson = {
  title: string;
  goal: string;
  timeboxMinutes: number;
  acceptanceCriteria: string[];
  hints: string[];
};

export default function App() {
  const [repoPath, setRepoPath] = useState("");
  const [job, setJob] = useState<JobResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [podcast, setPodcast] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskJson[] | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisJson | null>(null);

  const statusPill = useMemo(() => {
    if (!job) return null;
    const label = job.status.toUpperCase();
    const showPulse = job.status === "queued" || job.status === "running";
    return (
      <span className="pill">
        {showPulse ? <span className="pulse" /> : null}
        <span>{label}</span>
      </span>
    );
  }, [job]);

  async function run() {
    setError(null);
    setBusy(true);
    setPodcast(null);
    setTasks(null);
    setAnalysis(null);
    try {
      const { jobId } = await createJob(repoPath.trim());
      let next = await getJob(jobId);
      setJob(next);
      while (next.status === "queued" || next.status === "running") {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 900));
        // eslint-disable-next-line no-await-in-loop
        next = await getJob(jobId);
        setJob(next);
      }

      if (next.status === "done") {
        const [p, t, a] = await Promise.all([
          fetchArtifactText(next.jobId, "podcast.md"),
          fetchArtifactJson<TaskJson[]>(next.jobId, "tasks.json"),
          fetchArtifactJson<AnalysisJson>(next.jobId, "analysis.json"),
        ]);
        setPodcast(p);
        setTasks(t);
        setAnalysis(a);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    if (!job) return;
    setError(null);
    setBusy(true);
    try {
      const next = await getJob(job.jobId);
      setJob(next);

      if (next.status === "done") {
        const [p, t, a] = await Promise.all([
          fetchArtifactText(next.jobId, "podcast.md"),
          fetchArtifactJson<TaskJson[]>(next.jobId, "tasks.json"),
          fetchArtifactJson<AnalysisJson>(next.jobId, "analysis.json"),
        ]);
        setPodcast(p);
        setTasks(t);
        setAnalysis(a);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shell">
      <div className="hero">
        <h1>Codebase Analyzer</h1>
        <p>
          Point it at a repo path, get an Excalidraw diagram, a short high-level
          explanation, and a first starter task list. Optional Claude agent
          enrichment if configured.
        </p>
      </div>

      <div className="grid">
        <div className="card">
          <h2>Run</h2>
          <div className="row">
            <label>
              Local repo path
              <input
                value={repoPath}
                placeholder="/path/to/repo"
                onChange={(e) => setRepoPath(e.target.value)}
              />
            </label>

            <div className="btns">
              <button onClick={run} disabled={busy || !repoPath.trim()}>
                Analyze
              </button>
              <button className="secondary" onClick={refresh} disabled={busy || !job}>
                Refresh
              </button>
            </div>

            {error ? (
              <div className="pill" style={{ borderColor: "rgba(255,107,107,0.45)" }}>
                <span style={{ color: "var(--danger)" }}>Error:</span>
                <span>{error}</span>
              </div>
            ) : null}

            {job ? (
              <div className="kvs">
                <div className="kv">
                  <div className="k">Job</div>
                  <div className="v">{job.jobId}</div>
                </div>
                <div className="kv">
                  <div className="k">Status</div>
                  <div className="v">{statusPill}</div>
                </div>
                <div className="kv">
                  <div className="k">Repo</div>
                  <div className="v">{job.repoPath ?? "(n/a)"}</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="card">
          <h2>Artifacts</h2>
          {job?.artifacts?.length ? (
            <div className="row">
              <div className="btns">
                {job.artifacts.map((a) => (
                  <button
                    key={a.name}
                    className="secondary"
                    onClick={() => downloadArtifact(job.jobId, a.name)}
                    disabled={busy}
                    title={a.contentType}
                  >
                    Download {a.name}
                  </button>
                ))}
              </div>
              <p style={{ margin: 0, color: "var(--muted)" }}>
                Tip: open `diagram.excalidraw.json` in Excalidraw to view/edit.
              </p>
            </div>
          ) : (
            <p style={{ margin: 0, color: "var(--muted)" }}>
              Run an analysis to generate artifacts.
            </p>
          )}
        </div>
      </div>

      {analysis ? (
        <div style={{ height: 14 }} />
      ) : null}

      {analysis ? (
        <div className="grid">
          <div className="card">
            <h2>Summary</h2>
            <div className="row">
              <div className="kvs">
                <div className="kv">
                  <div className="k">Scanned At</div>
                  <div className="v">{new Date(analysis.repo.scannedAt).toLocaleString()}</div>
                </div>
                <div className="kv">
                  <div className="k">Files</div>
                  <div className="v">{analysis.stats.totalFiles.toLocaleString()}</div>
                </div>
                <div className="kv">
                  <div className="k">Modules</div>
                  <div className="v">{analysis.graph.modules.length.toLocaleString()}</div>
                </div>
                <div className="kv">
                  <div className="k">Edges</div>
                  <div className="v">{analysis.graph.edges.length.toLocaleString()}</div>
                </div>
                {analysis.git?.isRepo && analysis.git.head ? (
                  <div className="kv">
                    <div className="k">Git Head</div>
                    <div className="v">
                      {analysis.git.head.sha.slice(0, 8)} {analysis.git.head.message}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Podcast</h2>
            {podcast ? <pre>{podcast}</pre> : <p style={{ margin: 0, color: "var(--muted)" }}>No podcast yet.</p>}
          </div>
        </div>
      ) : null}

      {tasks?.length ? (
        <>
          <div style={{ height: 14 }} />
          <div className="card">
            <h2>Starter Tasks</h2>
            <div className="row">
              {tasks.map((t) => (
                <div className="kv" key={t.title}>
                  <div className="k">{t.title}</div>
                  <div className="v" style={{ color: "var(--muted)" }}>
                    {t.goal} ({t.timeboxMinutes}m)
                  </div>
                  <pre>
                    Acceptance:
                    {"\n"}
                    {t.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}
                    {"\n\n"}
                    Hints:
                    {"\n"}
                    {t.hints.map((h) => `- ${h}`).join("\n")}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
