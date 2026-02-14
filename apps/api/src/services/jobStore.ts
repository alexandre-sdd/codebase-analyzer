import fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { ensureDir, pathExists } from "../lib/fsUtil";

export type JobStatus = "queued" | "running" | "done" | "error";
export type JobSourceType = "local" | "github";

export type Job = {
  jobId: string;
  status: JobStatus;
  progressPct: number;
  progressStage: string;
  sourceType: JobSourceType;
  repoPath?: string;
  repoUrl?: string;
  repoRef?: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
};

export type CreateJobInput =
  | {
      sourceType: "local";
      repoPath: string;
    }
  | {
      sourceType: "github";
      repoUrl: string;
      repoRef?: string;
    };

export type ArtifactMeta = {
  name: string;
  contentType: string;
};

function jobDir(jobsDir: string, jobId: string): string {
  return path.join(jobsDir, jobId);
}

function artifactsDir(jobsDir: string, jobId: string): string {
  return path.join(jobDir(jobsDir, jobId), "artifacts");
}

function jobJsonPath(jobsDir: string, jobId: string): string {
  return path.join(jobDir(jobsDir, jobId), "job.json");
}

export async function createJob(jobsDir: string, input: CreateJobInput): Promise<Job> {
  const jobId = nanoid();
  const now = new Date().toISOString();

  await ensureDir(artifactsDir(jobsDir, jobId));
  const base: Omit<Job, "sourceType"> = {
    jobId,
    status: "queued",
    progressPct: 0,
    progressStage: "Queued",
    createdAt: now,
    updatedAt: now,
  };
  const job: Job =
    input.sourceType === "local"
      ? {
          ...base,
          sourceType: "local",
          repoPath: input.repoPath,
        }
      : {
          ...base,
          sourceType: "github",
          repoUrl: input.repoUrl,
          repoRef: input.repoRef,
        };

  await fs.writeFile(jobJsonPath(jobsDir, jobId), JSON.stringify(job, null, 2), "utf8");
  return job;
}

export async function getJob(jobsDir: string, jobId: string): Promise<Job | null> {
  const p = jobJsonPath(jobsDir, jobId);
  if (!(await pathExists(p))) return null;
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw) as Job;
}

export async function updateJob(
  jobsDir: string,
  jobId: string,
  patch: Partial<Omit<Job, "jobId" | "createdAt">>,
): Promise<Job> {
  const job = await getJob(jobsDir, jobId);
  if (!job) throw new Error("job not found");
  const next: Job = {
    ...job,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(jobJsonPath(jobsDir, jobId), JSON.stringify(next, null, 2), "utf8");
  return next;
}

export async function writeArtifact(
  jobsDir: string,
  jobId: string,
  name: string,
  contentType: string,
  content: string | Buffer,
): Promise<void> {
  const dir = artifactsDir(jobsDir, jobId);
  await ensureDir(dir);
  const p = path.join(dir, name);
  await fs.writeFile(p, content);

  const metaPath = path.join(dir, "_meta.json");
  const existing: Record<string, ArtifactMeta> = (await pathExists(metaPath))
    ? (JSON.parse(await fs.readFile(metaPath, "utf8")) as Record<string, ArtifactMeta>)
    : {};
  existing[name] = { name, contentType };
  await fs.writeFile(metaPath, JSON.stringify(existing, null, 2), "utf8");
}

export async function listArtifacts(jobsDir: string, jobId: string): Promise<ArtifactMeta[]> {
  const metaPath = path.join(artifactsDir(jobsDir, jobId), "_meta.json");
  if (!(await pathExists(metaPath))) return [];
  const raw = await fs.readFile(metaPath, "utf8");
  const meta = JSON.parse(raw) as Record<string, ArtifactMeta>;
  return Object.values(meta).sort((a, b) => a.name.localeCompare(b.name));
}

export async function readArtifact(
  jobsDir: string,
  jobId: string,
  name: string,
): Promise<{ contentType: string; content: Buffer } | null> {
  const metaPath = path.join(artifactsDir(jobsDir, jobId), "_meta.json");
  if (!(await pathExists(metaPath))) return null;
  const meta = JSON.parse(await fs.readFile(metaPath, "utf8")) as Record<string, ArtifactMeta>;
  const entry = meta[name];
  if (!entry) return null;

  const p = path.join(artifactsDir(jobsDir, jobId), name);
  if (!(await pathExists(p))) return null;
  const content = await fs.readFile(p);
  return { contentType: entry.contentType, content };
}
