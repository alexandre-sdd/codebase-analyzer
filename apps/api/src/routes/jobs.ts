import fs from "node:fs/promises";
import path from "node:path";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import type { Env } from "../lib/env";
import { ensureDir, isSubpath, pathExists } from "../lib/fsUtil";
import { createJob, getJob, listArtifacts, readArtifact } from "../services/jobStore";
import { runJob } from "../services/jobRunner";
import { parseGitHubRepoUrl } from "../services/repoSource";

const CreateJobBody = z
  .object({
    repoPath: z.string().min(1).optional(),
    repoUrl: z.string().url().optional(),
    repoRef: z.string().min(1).max(200).optional(),
  })
  .superRefine((v, ctx) => {
    const hasPath = Boolean(v.repoPath);
    const hasUrl = Boolean(v.repoUrl);
    if (hasPath === hasUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide exactly one of repoPath or repoUrl",
      });
    }
  });

export function registerJobRoutes(app: Express, env: Env) {
  app.post("/v1/jobs", async (req: Request, res: Response) => {
    try {
      const body = CreateJobBody.parse(req.body);
      await ensureDir(env.JOBS_DIR);
      const job =
        body.repoPath && !body.repoUrl
          ? await createLocalPathJob(env, body.repoPath)
          : await createGithubUrlJob(env, body.repoUrl!, body.repoRef);

      // Fire-and-forget; job status is persisted to disk.
      void runJob(job.jobId, env).catch((err) => {
        console.error({ err, jobId: job.jobId }, "job runner crashed");
      });

      res.status(201).json({ jobId: job.jobId });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          error: {
            message: "Invalid request body",
            details: err.flatten(),
          },
        });
      } else {
        throw err;
      }
    }
  });

  app.get("/v1/jobs/:jobId", async (req: Request, res: Response) => {
    try {
      const jobId = z
        .string()
        .regex(/^[a-zA-Z0-9_-]{8,64}$/)
        .parse(req.params.jobId);
      const job = await getJob(env.JOBS_DIR, jobId);
      if (!job) {
        return res.status(404).json({ error: { message: "job not found" } });
      }

      const artifacts = await listArtifacts(env.JOBS_DIR, jobId);
      res.json({ ...job, artifacts });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          error: {
            message: "Invalid jobId",
            details: err.flatten(),
          },
        });
      } else {
        throw err;
      }
    }
  });

  app.get("/v1/jobs/:jobId/artifacts/:name", async (req: Request, res: Response) => {
    try {
      const jobId = z
        .string()
        .regex(/^[a-zA-Z0-9_-]{8,64}$/)
        .parse(req.params.jobId);
      const name = z
        .string()
        .regex(/^[a-zA-Z0-9._-]{1,128}$/)
        .parse(req.params.name);
      const artifact = await readArtifact(env.JOBS_DIR, jobId, name);
      if (!artifact) {
        return res.status(404).json({ error: { message: "artifact not found" } });
      }
      res.setHeader("content-type", artifact.contentType);
      res.send(artifact.content);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          error: {
            message: "Invalid parameters",
            details: err.flatten(),
          },
        });
      } else {
        throw err;
      }
    }
  });
}

async function createLocalPathJob(env: Env, repoPath: string) {
  const absRepoPath = path.resolve(repoPath);

  if (env.ALLOWED_REPO_ROOT) {
    const allowedRoot = path.resolve(env.ALLOWED_REPO_ROOT);
    if (!isSubpath(absRepoPath, allowedRoot)) {
      const err: any = new Error("repoPath is outside ALLOWED_REPO_ROOT");
      err.statusCode = 403;
      throw err;
    }
  }

  if (!(await pathExists(absRepoPath))) {
    const err: any = new Error("repoPath does not exist");
    err.statusCode = 400;
    throw err;
  }

  const stat = await fs.stat(absRepoPath);
  if (!stat.isDirectory()) {
    const err: any = new Error("repoPath must be a directory");
    err.statusCode = 400;
    throw err;
  }

  return createJob(env.JOBS_DIR, { sourceType: "local", repoPath: absRepoPath });
}

async function createGithubUrlJob(env: Env, repoUrl: string, repoRef?: string) {
  let parsed: ReturnType<typeof parseGitHubRepoUrl>;
  try {
    parsed = parseGitHubRepoUrl(repoUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid repoUrl";
    const error: any = new Error(message);
    error.statusCode = 400;
    throw error;
  }
  return createJob(env.JOBS_DIR, {
    sourceType: "github",
    repoUrl: parsed.canonicalUrl,
    repoRef,
  });
}
