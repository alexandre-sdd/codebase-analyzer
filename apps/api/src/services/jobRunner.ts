import type { Env } from "../lib/env";
import { getJob, updateJob, writeArtifact } from "./jobStore";
import { resolveJobRepoPath } from "./repoSource";
import { analyzeRepository } from "./repoAnalyzer";

export async function runJob(jobId: string, env: Env): Promise<void> {
  await updateJob(env.JOBS_DIR, jobId, { status: "running", error: undefined });

  try {
    const job = await getJob(env.JOBS_DIR, jobId);
    if (!job) throw new Error("job not found");

    const source = await resolveJobRepoPath(env.JOBS_DIR, job, env);
    await updateJob(env.JOBS_DIR, jobId, {
      repoPath: source.repoPath,
    });

    const result = await analyzeRepository(
      {
        repoPath: source.repoPath,
        sourceLabel: source.sourceLabel,
      },
      env,
    );

    await writeArtifact(
      env.JOBS_DIR,
      jobId,
      "analysis.json",
      "application/json; charset=utf-8",
      JSON.stringify(result.analysis, null, 2),
    );
    await writeArtifact(
      env.JOBS_DIR,
      jobId,
      "diagram.excalidraw.json",
      "application/json; charset=utf-8",
      JSON.stringify(result.diagram, null, 2),
    );
    await writeArtifact(env.JOBS_DIR, jobId, "podcast.md", "text/markdown; charset=utf-8", result.podcast);
    await writeArtifact(
      env.JOBS_DIR,
      jobId,
      "tasks.json",
      "application/json; charset=utf-8",
      JSON.stringify(result.tasks, null, 2),
    );
    await writeArtifact(
      env.JOBS_DIR,
      jobId,
      "structure-report.md",
      "text/markdown; charset=utf-8",
      result.structureReport,
    );

    await updateJob(env.JOBS_DIR, jobId, { status: "done" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await updateJob(env.JOBS_DIR, jobId, { status: "error", error: message });
  }
}
