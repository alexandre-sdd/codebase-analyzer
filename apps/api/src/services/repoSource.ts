import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Env } from "../lib/env";
import type { Job } from "./jobStore";
import { ensureDir, pathExists } from "../lib/fsUtil";

const execFileAsync = promisify(execFile);

export type ParsedGitHubRepo = {
  owner: string;
  repo: string;
  canonicalUrl: string;
  cloneUrl: string;
};

export function parseGitHubRepoUrl(input: string): ParsedGitHubRepo {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("repoUrl must be a valid URL");
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname !== "github.com" && hostname !== "www.github.com") {
    throw new Error("repoUrl must point to github.com");
  }

  const segments = url.pathname
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length < 2) {
    throw new Error("repoUrl must include owner and repo: https://github.com/<owner>/<repo>");
  }

  const owner = segments[0];
  const rawRepo = segments[1];
  const repo = rawRepo.replace(/\.git$/i, "");
  const valid = /^[A-Za-z0-9._-]+$/;

  if (!valid.test(owner) || !valid.test(repo)) {
    throw new Error("repoUrl contains unsupported owner/repo characters");
  }

  const canonicalUrl = `https://github.com/${owner}/${repo}`;
  return {
    owner,
    repo,
    canonicalUrl,
    cloneUrl: `${canonicalUrl}.git`,
  };
}

export async function resolveJobRepoPath(
  jobsDir: string,
  job: Job,
  env: Env,
): Promise<{ repoPath: string; sourceLabel: string }> {
  if (job.sourceType === "local") {
    if (!job.repoPath) throw new Error("local job missing repoPath");
    const absRepoPath = path.resolve(job.repoPath);
    if (env.ALLOWED_REPO_ROOT) {
      const root = path.resolve(env.ALLOWED_REPO_ROOT);
      const rel = path.relative(root, absRepoPath);
      if (rel.startsWith("..") || path.isAbsolute(rel)) {
        throw new Error("repoPath is outside ALLOWED_REPO_ROOT");
      }
    }
    const stat = await fs.stat(absRepoPath);
    if (!stat.isDirectory()) throw new Error("repoPath must be a directory");
    return { repoPath: absRepoPath, sourceLabel: absRepoPath };
  }

  if (!job.repoUrl) {
    throw new Error("github job missing repoUrl");
  }
  const parsed = parseGitHubRepoUrl(job.repoUrl);
  const checkoutPath = path.join(jobsDir, job.jobId, "checkout");
  await ensureDir(path.dirname(checkoutPath));

  if (!(await pathExists(checkoutPath))) {
    const cloneArgs = ["clone", "--depth", "1"];
    if (job.repoRef) {
      cloneArgs.push("--branch", job.repoRef);
    }
    cloneArgs.push(parsed.cloneUrl, checkoutPath);

    await execFileAsync("git", cloneArgs, {
      maxBuffer: 10 * 1024 * 1024,
    });
  }

  return { repoPath: checkoutPath, sourceLabel: parsed.canonicalUrl };
}

