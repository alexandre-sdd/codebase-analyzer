import fs from "node:fs/promises";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Env } from "../lib/env";
import { ensureDir, isSubpath, pathExists } from "../lib/fsUtil";
import { createJob, getJob, listArtifacts, readArtifact } from "../services/jobStore";
import { runJob } from "../services/jobRunner";

const CreateJobBody = z.object({
  repoPath: z.string().min(1),
});

export function registerJobRoutes(server: FastifyInstance, env: Env) {
  server.post("/v1/jobs", async (req, reply) => {
    const { repoPath } = CreateJobBody.parse(req.body);
    const absRepoPath = path.resolve(repoPath);

    if (env.ALLOWED_REPO_ROOT) {
      const allowedRoot = path.resolve(env.ALLOWED_REPO_ROOT);
      if (!isSubpath(absRepoPath, allowedRoot)) {
        return reply.status(403).send({
          error: {
            message: "repoPath is outside ALLOWED_REPO_ROOT",
          },
        });
      }
    }

    if (!(await pathExists(absRepoPath))) {
      return reply.status(400).send({
        error: {
          message: "repoPath does not exist",
        },
      });
    }

    const stat = await fs.stat(absRepoPath);
    if (!stat.isDirectory()) {
      return reply.status(400).send({
        error: {
          message: "repoPath must be a directory",
        },
      });
    }

    await ensureDir(env.JOBS_DIR);
    const job = await createJob(env.JOBS_DIR, absRepoPath);

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
