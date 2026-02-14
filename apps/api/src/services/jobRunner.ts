import type { Env } from "../lib/env";
import { getJob, updateJob, writeArtifact } from "./jobStore";
import { resolveJobRepoPath } from "./repoSource";
import { analyzeRepository } from "./repoAnalyzer";

export async function runJob(jobId: string, env: Env): Promise<void> {
  await updateJob(env.JOBS_DIR, jobId, {
    status: "running",
    error: undefined,
    progressPct: 2,
    progressStage: "Starting job",
  });

  try {
    const job = await getJob(env.JOBS_DIR, jobId);
    if (!job) throw new Error("job not found");

    await updateJob(env.JOBS_DIR, jobId, {
      progressPct: 8,
      progressStage: "Resolving repository source",
    });
    const source = await resolveJobRepoPath(env.JOBS_DIR, job, env);
    await updateJob(env.JOBS_DIR, jobId, {
      repoPath: source.repoPath,
      progressPct: 18,
      progressStage: "Repository ready",
    });

    const result = await analyzeRepository(
      {
        repoPath: source.repoPath,
        sourceLabel: source.sourceLabel,
      },
      env,
      async (pct, stage) => {
        await updateJob(env.JOBS_DIR, jobId, {
          progressPct: pct,
          progressStage: stage,
        });
      },
    );

    await writeArtifact(
      env.JOBS_DIR,
      jobId,
      "structure-report.md",
      "text/markdown; charset=utf-8",
      result.structureReport,
    );

    await updateJob(env.JOBS_DIR, jobId, {
      status: "done",
      progressPct: 100,
      progressStage: "Completed",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await updateJob(env.JOBS_DIR, jobId, {
      status: "error",
      error: message,
      progressStage: "Failed",
    });
  }
}
