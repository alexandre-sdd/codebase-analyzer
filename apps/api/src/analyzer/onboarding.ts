import type { AnalysisArtifact, TaskSuggestion } from "../services/repoAnalyzer";

export function generatePodcastFallback(analysis: AnalysisArtifact): string {
  const langs = analysis.stats.languages.slice(0, 6).map((l) => `${l.name} (${l.files} files)`);
  const dirs = analysis.stats.topLevelDirs.slice(0, 10).join(", ") || "(none detected)";
  const manifests = analysis.stats.manifests.slice(0, 12).join(", ") || "(none detected)";

  return [
    "# Codebase Podcast (Draft)",
    "",
    "## Intro",
    `Today we're looking at a codebase at \`${analysis.repo.path}\`. We'll do a quick orientation: what it likely is, where the important code lives, and what to try first as a new engineer.`,
    "",
    "## What’s In Here",
    `Top languages: ${langs.join(", ") || "unknown"}.`,
    `Top-level folders: ${dirs}.`,
    `Manifests/configs spotted: ${manifests}.`,
    "",
    "## Architecture Sketch",
    `We detected ${analysis.graph.modules.length} coarse modules and ${analysis.graph.edges.length} directional relationships based on imports. Use the Excalidraw diagram as a starting map, then refine it with domain knowledge.`,
    "",
    "## Where To Start (New Engineer)",
    "- Find the main entrypoint(s) in the biggest module.",
    "- Run the smallest possible slice (unit tests or a single command) to validate setup.",
    "- Trace one request or one CLI command end-to-end and write down the flow.",
    "",
    "## Outro",
    "If Claude enrichment is enabled, you'll get a tighter narrative and more actionable starter tasks. Otherwise, this draft is a baseline to iterate on.",
    "",
  ].join("\n");
}

export function generateTasksFallback(analysis: AnalysisArtifact): TaskSuggestion[] {
  const biggestModules = analysis.graph.modules
    .slice(0, 6)
    .map((m) => m.label)
    .sort((a, b) => a.localeCompare(b));

  const task1: TaskSuggestion = {
    title: "Run the smallest happy-path locally",
    goal: "Prove you can execute the project once end-to-end on your machine.",
    timeboxMinutes: 30,
    acceptanceCriteria: ["You can run one command that completes successfully", "You document the exact command + any env vars needed"],
    hints: [
      "Look for README, Makefile, package.json scripts, or docker-compose.",
      `Manifests spotted: ${analysis.stats.manifests.join(", ") || "(none)"}`,
    ],
  };

  const task2: TaskSuggestion = {
    title: "Pick one module and write an internal map",
    goal: "Build a short mental model of one module boundary and how it talks to others.",
    timeboxMinutes: 45,
    acceptanceCriteria: [
      "You can name the module’s responsibility in 1 sentence",
      "You list 3 key files and 2 upstream/downstream modules",
    ],
    hints: [
      `Candidate modules: ${biggestModules.join(", ") || "(none)"}`,
      "Use the generated diagram as a starting point, but validate by reading code.",
    ],
  };

  const task3: TaskSuggestion = {
    title: "Ship a tiny, safe improvement",
    goal: "Make a small change that improves maintainability without product risk.",
    timeboxMinutes: 60,
    acceptanceCriteria: ["Change is scoped to one module", "Change has a clear before/after behavior or clarity win", "Change includes a short note explaining why"],
    hints: [
      "Examples: improve error message, add a missing README snippet, add a guard clause, or add a small unit test.",
      "If you have git history, find a file with frequent churn and improve clarity.",
    ],
  };

  return [task1, task2, task3];
}

