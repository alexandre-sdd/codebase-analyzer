import type { Env } from "../lib/env";
import { scanRepo } from "../analyzer/scanRepo";
import { buildModuleGraph } from "../analyzer/moduleGraph";
import { generateExcalidraw } from "../analyzer/excalidraw";
import { generatePodcastFallback, generateTasksFallback } from "../analyzer/onboarding";
import { getGitSignals } from "../analyzer/gitSignals";
import { generateStructureReportMarkdown } from "../analyzer/structureReport";
import { makeLlmClient } from "../llm/clientFactory";
import { enrichWithLlm } from "../llm/enrichmentPipeline";

export type AnalysisArtifact = {
  repo: {
    path: string;
    sourceLabel: string;
    scannedAt: string;
  };
  stats: {
    totalFiles: number;
    totalBytes: number;
    languages: { name: string; files: number; bytes: number }[];
    topLevelDirs: string[];
    manifests: string[];
  };
  graph: {
    modules: { id: string; label: string }[];
    edges: { from: string; to: string; weight: number }[];
  };
  git?: {
    isRepo: boolean;
    head?: { sha: string; message: string; author: string; date: string };
    topAuthors?: { name: string; emails: string[]; commits: number }[];
  };
  hypotheses: {
    title: string;
    hypothesis: string;
    evidence: string[];
    confidence: "low" | "medium" | "high";
  }[];
  notes: string[];
};

export type TaskSuggestion = {
  title: string;
  goal: string;
  timeboxMinutes: number;
  acceptanceCriteria: string[];
  hints: string[];
};

export type AnalyzerResult = {
  analysis: AnalysisArtifact;
  diagram: any;
  podcast: string;
  tasks: TaskSuggestion[];
  structureReport: string;
};

export async function analyzeRepository(
  input: { repoPath: string; sourceLabel: string },
  env: Env,
): Promise<AnalyzerResult> {
  const snapshot = await scanRepo(input.repoPath, {
    maxFiles: env.MAX_FILES,
    maxBytesPerFile: env.MAX_BYTES_PER_FILE,
  });

  const graph = await buildModuleGraph(snapshot, {
    maxFilesToScan: env.MAX_IMPORT_SCAN_FILES,
    maxBytesPerFile: env.MAX_BYTES_PER_FILE,
  });

  const gitSignals = await getGitSignals(input.repoPath);

  const analysis: AnalysisArtifact = {
    repo: {
      path: input.repoPath,
      sourceLabel: input.sourceLabel,
      scannedAt: new Date().toISOString(),
    },
    stats: {
      totalFiles: snapshot.totalFiles,
      totalBytes: snapshot.totalBytes,
      languages: snapshot.languages,
      topLevelDirs: snapshot.topLevelDirs,
      manifests: snapshot.manifests.map((m) => m.path),
    },
    graph: {
      modules: graph.modules.map((m) => ({ id: m.id, label: m.label })),
      edges: graph.edges,
    },
    git: gitSignals,
    hypotheses: makeHypotheses(snapshot.manifests.map((m) => m.path), snapshot.languages),
    notes: [
      "This is a best-effort static crawl. Enable LLM enrichment for better naming and explanations.",
      "Import parsing is heuristic and will miss dynamic/module-alias imports.",
    ],
  };

  const baseDiagram = generateExcalidraw(
    {
      modules: graph.modules.map((m) => ({ id: m.id, label: m.label })),
      edges: graph.edges,
    },
    {
      title: `Codebase map: ${snapshot.repoName}`,
    },
  );

  const podcastFallback = generatePodcastFallback(analysis);
  const tasksFallback = generateTasksFallback(analysis);
  const structureReport = generateStructureReportMarkdown({
    analysis,
    snapshot,
    graph,
    sourceLabel: input.sourceLabel,
  });

  const llmClient = makeLlmClient(env);
  const enriched = await enrichWithLlm(llmClient, analysis, {
    baseDiagram,
    podcastFallback,
    tasksFallback,
  });

  return {
    analysis,
    diagram: enriched.diagram,
    podcast: enriched.podcast,
    tasks: enriched.tasks,
    structureReport,
  };
}

function makeHypotheses(
  manifests: string[],
  languages: { name: string; files: number; bytes: number }[],
): AnalysisArtifact["hypotheses"] {
  const set = new Set(manifests);
  const hasLang = (name: string) => languages.some((l) => l.name === name && l.files > 0);
  const out: AnalysisArtifact["hypotheses"] = [];

  if (set.has("Dockerfile") || set.has("docker-compose.yml")) {
    out.push({
      title: "Containerization",
      hypothesis: "The project likely uses Docker to standardize dev/prod environments and dependencies.",
      evidence: [set.has("Dockerfile") ? "Dockerfile present" : null, set.has("docker-compose.yml") ? "docker-compose.yml present" : null].filter(
        Boolean,
      ) as string[],
      confidence: "medium",
    });
  }

  if (set.has("package.json")) {
    out.push({
      title: "Node Tooling",
      hypothesis: "The repo likely relies on npm scripts for local workflows (dev/build/test) and dependency management.",
      evidence: ["package.json present"],
      confidence: "high",
    });
  }

  if (set.has("tsconfig.json") || hasLang("TypeScript")) {
    out.push({
      title: "Type Safety",
      hypothesis: "TypeScript is likely used to reduce runtime errors and make refactors safer at scale.",
      evidence: [set.has("tsconfig.json") ? "tsconfig.json present" : null, hasLang("TypeScript") ? "TypeScript files detected" : null].filter(
        Boolean,
      ) as string[],
      confidence: set.has("tsconfig.json") ? "high" : "medium",
    });
  }

  if (set.has("pyproject.toml") || hasLang("Python")) {
    out.push({
      title: "Python Runtime",
      hypothesis: "Python is likely part of the system (service, scripts, or tooling).",
      evidence: [set.has("pyproject.toml") ? "pyproject.toml present" : null, hasLang("Python") ? "Python files detected" : null].filter(Boolean) as string[],
      confidence: set.has("pyproject.toml") ? "high" : "medium",
    });
  }

  if (set.has("go.mod") || hasLang("Go")) {
    out.push({
      title: "Go Service",
      hypothesis: "Go is likely used for performance-sensitive or easy-to-deploy components.",
      evidence: [set.has("go.mod") ? "go.mod present" : null, hasLang("Go") ? "Go files detected" : null].filter(Boolean) as string[],
      confidence: set.has("go.mod") ? "high" : "medium",
    });
  }

  if (set.has("Cargo.toml") || hasLang("Rust")) {
    out.push({
      title: "Rust Component",
      hypothesis: "Rust is likely used for correctness/performance-critical code paths.",
      evidence: [set.has("Cargo.toml") ? "Cargo.toml present" : null, hasLang("Rust") ? "Rust files detected" : null].filter(Boolean) as string[],
      confidence: set.has("Cargo.toml") ? "high" : "medium",
    });
  }

  return out;
}
