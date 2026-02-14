import { useEffect, useState } from "react";

type JobResponse = {
  jobId: string;
  status: "queued" | "running" | "done" | "error";
  error?: string;
  artifacts?: {
    name: string;
    contentType: string;
  }[];
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8787";

async function getJob(jobId: string): Promise<JobResponse> {
  const res = await fetch(`${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: { message: await res.text() } }));
    throw new Error(errorData?.error?.message || `HTTP ${res.status}`);
  }
  return (await res.json()) as JobResponse;
}

async function fetchArtifactText(jobId: string, name: string): Promise<string> {
  const res = await fetch(
    `${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}/artifacts/${encodeURIComponent(name)}`,
  );
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: { message: await res.text() } }));
    throw new Error(errorData?.error?.message || `HTTP ${res.status}`);
  }
  return await res.text();
}

interface ResultsPageProps {
  jobId: string;
  onBack: () => void;
}

export default function ResultsPage({ jobId, onBack }: ResultsPageProps) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      try {
        const job = await getJob(jobId);
        if (job.status === "done" && job.artifacts) {
          const report = await fetchArtifactText(jobId, "structure-report.md");
          setMarkdown(report);
        } else if (job.status === "error") {
          setError(job.error || "Failed to generate report");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [jobId]);

  return (
    <div className="results-page">
      <header className="results-header">
        <div className="header-content">
          <div className="logo">Onboardy</div>
          <button className="back-button" onClick={onBack}>
            ← Back to Home
          </button>
        </div>
      </header>

      <div className="results-container">
        {loading && (
          <div className="loading-state">
            <p>Loading your report...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={onBack}>Go Back</button>
          </div>
        )}

        {markdown && (
          <div className="markdown-container">
            <div className="markdown-content">
              <pre>{markdown}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
