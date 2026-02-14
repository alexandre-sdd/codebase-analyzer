import fs from "node:fs/promises";
import path from "node:path";
import type { FastifyInstance } from "fastify";
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

export function registerJobRoutes(server: FastifyInstance, env: Env) {
  server.post("/v1/jobs", async (req, reply) => {
    const body = CreateJobBody.parse(req.body);
    await ensureDir(env.JOBS_DIR);
    const job =
      body.repoPath && !body.repoUrl
        ? await createLocalPathJob(env, body.repoPath)
        : await createGithubUrlJob(env, body.repoUrl!, body.repoRef);

    // Fire-and-forget; job status is persisted to disk.
    void runJob(job.jobId, env).catch((err) => {
      server.log.error({ err, jobId: job.jobId }, "job runner crashed");
    });

    return reply.status(201).send({ jobId: job.jobId });
  });

  server.get("/v1/jobs/:jobId", async (req, reply) => {
    const jobId = z
      .string()
      .regex(/^[a-zA-Z0-9_-]{8,64}$/)
      .parse((req.params as any).jobId);
    const job = await getJob(env.JOBS_DIR, jobId);
    if (!job) {
      return reply.status(404).send({ error: { message: "job not found" } });
    }

    const artifacts = await listArtifacts(env.JOBS_DIR, jobId);
    return { ...job, artifacts };
  });

  server.get("/v1/jobs/:jobId/artifacts/:name", async (req, reply) => {
    const jobId = z
      .string()
      .regex(/^[a-zA-Z0-9_-]{8,64}$/)
      .parse((req.params as any).jobId);
    const name = z
      .string()
      .regex(/^[a-zA-Z0-9._-]{1,128}$/)
      .parse((req.params as any).name);
    const artifact = await readArtifact(env.JOBS_DIR, jobId, name);
    if (!artifact) {
      return reply.status(404).send({ error: { message: "artifact not found" } });
    }
    reply.header("content-type", artifact.contentType);
    return reply.send(artifact.content);
  });
}

async function createLocalPathJob(env: Env, repoPath: string) {
  const absRepoPath = path.resolve(repoPath);

  if (env.ALLOWED_REPO_ROOT) {
    const allowedRoot = path.resolve(env.ALLOWED_REPO_ROOT);
    if (!isSubpath(absRepoPath, allowedRoot)) {
      throw Object.assign(new Error("repoPath is outside ALLOWED_REPO_ROOT"), { statusCode: 403 });
    }
  }

  if (!(await pathExists(absRepoPath))) {
    throw Object.assign(new Error("repoPath does not exist"), { statusCode: 400 });
  }

  const stat = await fs.stat(absRepoPath);
  if (!stat.isDirectory()) {
    throw Object.assign(new Error("repoPath must be a directory"), { statusCode: 400 });
  }

  return createJob(env.JOBS_DIR, { sourceType: "local", repoPath: absRepoPath });
}

async function createGithubUrlJob(env: Env, repoUrl: string, repoRef?: string) {
  let parsed: ReturnType<typeof parseGitHubRepoUrl>;
  try {
    parsed = parseGitHubRepoUrl(repoUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid repoUrl";
    throw Object.assign(new Error(message), { statusCode: 400 });
  }
  return createJob(env.JOBS_DIR, {
    sourceType: "github",
    repoUrl: parsed.canonicalUrl,
    repoRef,
  });
}
