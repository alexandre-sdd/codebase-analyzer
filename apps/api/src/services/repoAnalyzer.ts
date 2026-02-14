import type { Env } from "../lib/env";
import { scanRepo } from "../analyzer/scanRepo";
import { buildModuleGraph } from "../analyzer/moduleGraph";
import { getGitSignals } from "../analyzer/gitSignals";
import { generateStructureReportMarkdown } from "../analyzer/structureReport";
import { makeLlmClient } from "../llm/clientFactory";

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
  structureReport: string;
};

export async function analyzeRepository(
  input: { repoPath: string; sourceLabel: string },
  env: Env,
  onProgress?: (pct: number, stage: string) => Promise<void>,
): Promise<AnalyzerResult> {
  let lastScannedPath = "";
  let lastImportPath = "";
  let lastPct = 0;
  let lastStage = "";
  let lastAt = 0;
  const emitProgress = async (pct: number, stage: string, force = false) => {
    const boundedPct = Math.max(lastPct, Math.min(99, Math.round(pct)));
    const safeStage = stage.length > 140 ? `...${stage.slice(-137)}` : stage;
    const now = Date.now();
    if (!force) {
      const same = boundedPct === lastPct && safeStage === lastStage;
      const tooSoon = now - lastAt < 280;
      if (same || tooSoon) return;
    }
    lastPct = boundedPct;
    lastStage = safeStage;
    lastAt = now;
    await onProgress?.(boundedPct, safeStage);
  };

  await emitProgress(24, "Scanning repository files", true);
  const snapshot = await scanRepo(input.repoPath, {
    maxFiles: env.MAX_FILES,
    maxBytesPerFile: env.MAX_BYTES_PER_FILE,
    onProgress: async (info) => {
      lastScannedPath = info.currentPath;
      const pct = 24 + Math.min(14, Math.floor(info.filesScanned / 60));
      await emitProgress(pct, `Scanning: ${shortenPath(info.currentPath)}`);
    },
  });

  const scannedSuffix = lastScannedPath ? ` (last: ${shortenPath(lastScannedPath)})` : "";
  await emitProgress(40, `Scanned ${snapshot.totalFiles.toLocaleString()} files${scannedSuffix}`, true);
  const graph = await buildModuleGraph(snapshot, {
    maxFilesToScan: env.MAX_IMPORT_SCAN_FILES,
    maxBytesPerFile: env.MAX_BYTES_PER_FILE,
    onProgress: async (info) => {
      lastImportPath = info.currentPath;
      const ratio = info.total > 0 ? info.scanned / info.total : 1;
      const pct = 42 + Math.round(ratio * 14);
      await emitProgress(pct, `Analyzing imports: ${shortenPath(info.currentPath)}`);
    },
  });

  const importsSuffix = lastImportPath ? ` (last import: ${shortenPath(lastImportPath)})` : "";
  await emitProgress(58, `Reading git ownership and commit history${importsSuffix}`, true);
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

  await emitProgress(68, "Drafting detailed markdown report", true);
  const localReport = generateStructureReportMarkdown({
    analysis,
    snapshot,
    graph,
    sourceLabel: input.sourceLabel,
  });

  const analyzedAreas =
    snapshot.topLevelDirs.length > 0
      ? snapshot.topLevelDirs.slice(0, 4).join(", ")
      : "(repo root)";
  const suffix = snapshot.topLevelDirs.length > 4 ? ", ..." : "";
  await emitProgress(78, `Claude analyzing folders: ${analyzedAreas}${suffix}`, true);
  let structureReport = localReport;
  const llmClient = makeLlmClient(env);
  try {
    const context = JSON.stringify(analysis, null, 2);
    const enriched = await llmClient.generateText({
      system: [
        "You are a principal engineer writing a handoff-quality repository architecture document.",
        "Write clear, deeply technical markdown for onboarding engineers.",
        "Do not use code fences unless needed; prefer structured sections and concise bullet lists.",
        "State uncertainties explicitly.",
      ].join("\n"),
      maxTokens: 5000,
      prompt: [
        "Write a super-detailed markdown report about this repository's structure and technologies used.",
        "Must include:",
        "- architecture overview",
        "- folder-by-folder breakdown",
        "- inferred runtime/data flow",
        "- tech stack and why each technology is likely used",
        "- likely ownership/maintenance hotspots",
        "- practical first reading order for a new engineer",
        "- caveats and unknowns",
        "",
        "Use this deterministic baseline report as raw input; improve it significantly without inventing facts.",
        "",
        "BASELINE_REPORT:",
        localReport,
        "",
        "STRUCTURED_CONTEXT_JSON:",
        context,
      ].join("\n"),
    });
    if (enriched?.trim()) {
      structureReport = enriched.trim();
    }
  } catch {
    structureReport = localReport;
  }

  await emitProgress(92, "Finalizing markdown artifact", true);
  return {
    structureReport,
  };
}

function shortenPath(relPath: string): string {
  const max = 70;
  if (relPath.length <= max) return relPath;
  return `...${relPath.slice(-(max - 3))}`;
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
