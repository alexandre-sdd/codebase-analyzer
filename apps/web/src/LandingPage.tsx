import { useState } from "react";

type CreateJobResponse = {
  jobId: string;
};

type JobStatus = "queued" | "running" | "done" | "error";

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

async function createJob(input: { repoPath?: string; repoUrl?: string; repoRef?: string }): Promise<CreateJobResponse> {
  const res = await fetch(`${API_BASE}/v1/jobs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as CreateJobResponse;
}

async function getJob(jobId: string): Promise<JobResponse> {
  const res = await fetch(`${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}`);
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as JobResponse;
}

interface LandingPageProps {
  onResultsReady: (jobId: string) => void;
}

export default function LandingPage({ onResultsReady }: LandingPageProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ pct: number; stage: string } | null>(null);

  const handleSearch = async () => {
    const trimmedUrl = repoUrl.trim();
    if (!trimmedUrl) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    // Basic validation for GitHub URL
    if (!trimmedUrl.includes("github.com")) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }

    setError(null);
    setBusy(true);
    setProgress({ pct: 0, stage: "Starting..." });

    try {
      const { jobId } = await createJob({
        repoUrl: trimmedUrl,
      });

      // Poll for job completion
      let next = await getJob(jobId);
      setProgress({ pct: next.progressPct || 0, stage: next.progressStage || "Processing..." });

      while (next.status === "queued" || next.status === "running") {
        await new Promise((r) => setTimeout(r, 450));
        next = await getJob(jobId);
        setProgress({ pct: next.progressPct || 0, stage: next.progressStage || "Processing..." });
      }

      if (next.status === "done") {
        onResultsReady(jobId);
      } else if (next.status === "error") {
        setError(next.error || "An error occurred while analyzing the repository");
        setBusy(false);
        setProgress(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
      setProgress(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !busy) {
      handleSearch();
    }
  };

  const whatsappNumber = "+1 646 421 7138";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`;
  const whatsappCallUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi! I'd like to book a call about Onboardy.`;

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">Onboardy</div>
          <nav className="header-nav">
            <a href="#problem">Problem</a>
            <a href="#solution">Solution</a>
            <a href="#onboarding">Onboarding</a>
          </nav>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="contact-link">
            Contact
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Improve your onboarding process.</h1>
        <p className="hero-subtitle">Enter your repo github project to see how it works</p>
        
        <div className="search-container">
          <input
            type="text"
            className="repo-input"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={busy}
          />
          <button className="search-button" onClick={handleSearch} disabled={busy}>
            {busy ? "Analyzing..." : "Search"}
          </button>
        </div>

        {progress && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress.pct}%` }} />
            </div>
            <p className="progress-text">{progress.pct}% - {progress.stage}</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </section>

      {/* Problem Section */}
      <section id="problem" className="problem-section">
        <h2 className="section-title">The Problem</h2>
        <div className="problem-grid">
          <div className="problem-card">
            <h3>Week-long ramp-up times</h3>
            <p>deciphering legacy code.</p>
          </div>
          <div className="problem-card">
            <h3>Overwhelmed mentors</h3>
            <p>sacrificing productivity.</p>
          </div>
          <div className="problem-card">
            <h3>Traditional knowledge transfer</h3>
            <p>is inefficient.</p>
          </div>
          <div className="problem-card">
            <h3>Critical context is trapped</h3>
            <p>in "knowledge silos" while new hires face "silent struggles," afraid to ask basic questions.</p>
          </div>
        </div>
      </section>

      {/* Solution Visualization Section */}
      <section id="solution" className="solution-section">
        <h2 className="section-title">The Solution</h2>
        
        <div className="solution-visualization">
          <div className="solution-card main-card">
            <h3>We instantly map the territory.</h3>
            <p>The AI agent analyzes the entire codebase to visualize project structure, file relationships, and function calls.</p>
          </div>

          <div className="learning-styles">
            <div className="learning-intro">
              <h3>Engineers learn differently. Onboardy adapts the content to the user's preferred learning style.</h3>
            </div>

            <div className="learning-cards">
              <div className="learning-card">
                <h4>Visual Learners</h4>
                <p>Interactive diagrams with clickable files.</p>
              </div>
              <div className="learning-card">
                <h4>Code Readers</h4>
                <p>Split-view with raw code alongside plain-English logic translations.</p>
              </div>
              <div className="learning-card">
                <h4>Auditory Learners</h4>
                <p>AI Podcasts (ElevenLabs) that walk you through the repo verbally.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="onboarding" className="cta-section">
        <h2 className="section-title">Ready to Transform Your Onboarding?</h2>
        <p className="cta-subtitle">Book a call with us to see how Onboardy can help your team</p>
        <a href={whatsappCallUrl} target="_blank" rel="noopener noreferrer" className="cta-button">
          Book a Call
        </a>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2026 Onboardy. All rights reserved.</p>
      </footer>
    </div>
  );
}
