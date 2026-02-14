import type { Env } from "../lib/env";
import { updateJob, writeArtifact } from "./jobStore";
import { analyzeRepository } from "./repoAnalyzer";

export async function runJob(jobId: string, env: Env): Promise<void> {
  await updateJob(env.JOBS_DIR, jobId, { status: "running", error: undefined });

  try {
    const result = await analyzeRepository(jobId, env);

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

    await updateJob(env.JOBS_DIR, jobId, { status: "done" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await updateJob(env.JOBS_DIR, jobId, { status: "error", error: message });
  }
}

