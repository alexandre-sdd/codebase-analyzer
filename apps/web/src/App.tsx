import { useMemo, useState } from "react";

type JobStatus = "queued" | "running" | "done" | "error";

type CreateJobResponse = {
  jobId: string;
};

type JobResponse = {
  jobId: string;
  status: JobStatus;
  progressPct?: number;
  progressStage?: string;
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

export default function App() {
  const [repoPath, setRepoPath] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoRef, setRepoRef] = useState("");
  const [job, setJob] = useState<JobResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [structureReport, setStructureReport] = useState<string | null>(null);

  const progressPct = useMemo(() => {
    const n = Number(job?.progressPct ?? 0);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }, [job?.progressPct]);

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
    setStructureReport(null);
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
        await new Promise((r) => setTimeout(r, 900));
        // eslint-disable-next-line no-await-in-loop
        next = await getJob(jobId);
        setJob(next);
      }

      if (next.status === "done") {
        const report = await fetchArtifactText(next.jobId, "structure-report.md");
        setStructureReport(report);
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
        const report = await fetchArtifactText(next.jobId, "structure-report.md");
        setStructureReport(report);
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
          Analyze a local repo path or GitHub URL and get one output: a detailed
          markdown report explaining code structure, technologies used, and likely
          architecture boundaries.
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
                disabled={busy || (Boolean(repoPath.trim()) === Boolean(repoUrl.trim()))}
              >
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
                  <div className="k">Stage</div>
                  <div className="v">{job.progressStage ?? "Waiting"}</div>
                </div>
                <div className="kv">
                  <div className="k">Progress</div>
                  <div className="v">{progressPct}%</div>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progressPct}%` }} />
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
                Primary output is `structure-report.md`.
              </p>
            </div>
          ) : (
            <p style={{ margin: 0, color: "var(--muted)" }}>
              Run an analysis to generate the markdown report.
            </p>
          )}
        </div>
      </div>

      {structureReport ? (
        <>
          <div style={{ height: 14 }} />
          <div className="card">
            <h2>Detailed Markdown Report</h2>
            <pre>{structureReport}</pre>
          </div>
        </>
      ) : null}
    </div>
  );
}

