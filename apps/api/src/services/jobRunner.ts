import type { Env } from "../lib/env";
import { getJob, updateJob, writeArtifact } from "./jobStore";
import { resolveJobRepoPath } from "./repoSource";
import { analyzeRepository } from "./repoAnalyzer";
import { makeLlmClient } from "../llm/clientFactory";
import { makeTtsClient } from "../tts/clientFactory";
import { generatePodcastFromMarkdown } from "../analyzer/podcastGenerator";

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
      progressPct: 95,
      progressStage: "Generating podcast audio",
    });

    try {
      const llm = makeLlmClient(env);
      const tts = makeTtsClient(env);
      const podcastAudio = await generatePodcastFromMarkdown(
        llm,
        tts,
        result.structureReport,
      );

      await writeArtifact(
        env.JOBS_DIR,
        jobId,
        "podcast.mp3",
        "audio/mpeg",
        podcastAudio,
      );
    } catch (podcastErr) {
      // Non-fatal: if podcast generation fails, we still have the structure report
      console.error("Podcast generation failed:", podcastErr);
    }

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
