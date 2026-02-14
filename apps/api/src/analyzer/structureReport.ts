import path from "node:path";
import type { RepoSnapshot } from "./scanRepo";
import type { ModuleGraph } from "./moduleGraph";
import type { AnalysisArtifact } from "../services/repoAnalyzer";

type DirStat = {
  key: string;
  files: number;
  bytes: number;
  languages: Map<string, number>;
  largestFiles: { relativePath: string; bytes: number }[];
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GiB`;
}

function topLanguageFromPath(relativePath: string, analysis: AnalysisArtifact): string {
  const ext = path.extname(relativePath).toLowerCase();
  const direct =
    ext === ".ts" || ext === ".tsx"
      ? "TypeScript"
      : ext === ".js" || ext === ".jsx" || ext === ".mjs" || ext === ".cjs"
        ? "JavaScript"
        : ext === ".py"
          ? "Python"
          : ext === ".go"
            ? "Go"
            : ext === ".rs"
              ? "Rust"
              : ext === ".java"
                ? "Java"
                : ext === ".md"
                  ? "Markdown"
                  : ext === ".json"
                    ? "JSON"
                    : "Other";

  if (direct !== "Other") return direct;
  if (!ext) return "Unknown";
  const guessed = analysis.stats.languages.find((lang) => lang.name.toLowerCase() === ext.slice(1).toLowerCase());
  return guessed?.name ?? `Other (${ext})`;
}

function addLargestFile(stat: DirStat, file: { relativePath: string; bytes: number }) {
  stat.largestFiles.push(file);
  stat.largestFiles.sort((a, b) => b.bytes - a.bytes);
  if (stat.largestFiles.length > 8) {
    stat.largestFiles.length = 8;
  }
}

function buildDirStats(snapshot: RepoSnapshot, analysis: AnalysisArtifact): DirStat[] {
  const map = new Map<string, DirStat>();
  for (const file of snapshot.files) {
    const first = file.relativePath.split(path.sep)[0] || "(repo-root)";
    const key = first || "(repo-root)";
    const stat = map.get(key) ?? {
      key,
      files: 0,
      bytes: 0,
      languages: new Map<string, number>(),
      largestFiles: [],
    };
    stat.files += 1;
    stat.bytes += file.bytes;
    const lang = topLanguageFromPath(file.relativePath, analysis);
    stat.languages.set(lang, (stat.languages.get(lang) ?? 0) + 1);
    addLargestFile(stat, file);
    map.set(key, stat);
  }

  return Array.from(map.values()).sort((a, b) => b.bytes - a.bytes);
}

function buildInventory(snapshot: RepoSnapshot, maxLines: number): string[] {
  const files = snapshot.files
    .slice()
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
    .slice(0, maxLines);
  return files.map((f) => `- \`${f.relativePath}\` (${formatBytes(f.bytes)})`);
}

function toLangSummary(map: Map<string, number>): string {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, files]) => `${name}: ${files}`)
    .join(", ");
}

function computeModuleConnectivity(graph: ModuleGraph): { label: string; score: number; inWeight: number; outWeight: number }[] {
  const inWeight = new Map<string, number>();
  const outWeight = new Map<string, number>();
  for (const edge of graph.edges) {
    outWeight.set(edge.from, (outWeight.get(edge.from) ?? 0) + edge.weight);
    inWeight.set(edge.to, (inWeight.get(edge.to) ?? 0) + edge.weight);
  }

  return graph.modules
    .map((m) => {
      const incoming = inWeight.get(m.id) ?? 0;
      const outgoing = outWeight.get(m.id) ?? 0;
      return {
        label: m.label,
        inWeight: incoming,
        outWeight: outgoing,
        score: incoming + outgoing,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function generateStructureReportMarkdown(input: {
  analysis: AnalysisArtifact;
  snapshot: RepoSnapshot;
  graph: ModuleGraph;
  sourceLabel: string;
}): string {
  const { analysis, snapshot, graph, sourceLabel } = input;
  const dirStats = buildDirStats(snapshot, analysis);
  const moduleConnectivity = computeModuleConnectivity(graph);
  const inventory = buildInventory(snapshot, 260);
  const topAuthors = analysis.git?.topAuthors?.slice(0, 10) ?? [];
  const scannedAt = new Date(analysis.repo.scannedAt).toISOString();

  const lines: string[] = [];
  lines.push(`# Repository Structure Report: ${snapshot.repoName}`);
  lines.push("");
  lines.push("## Source");
  lines.push(`- Input: \`${sourceLabel}\``);
  lines.push(`- Resolved local path: \`${analysis.repo.path}\``);
  lines.push(`- Scanned at: \`${scannedAt}\``);
  lines.push("");
  lines.push("## Executive Summary");
  lines.push(`- Total files scanned: **${analysis.stats.totalFiles.toLocaleString()}**`);
  lines.push(`- Total bytes scanned: **${formatBytes(analysis.stats.totalBytes)}**`);
  lines.push(`- Top-level directories: **${analysis.stats.topLevelDirs.length}**`);
  lines.push(`- Detected manifests/config files: **${analysis.stats.manifests.length}**`);
  lines.push(`- Module graph: **${analysis.graph.modules.length} nodes / ${analysis.graph.edges.length} edges**`);
  lines.push("");
  lines.push("## Language Breakdown");
  lines.push("| Language | Files | Bytes |");
  lines.push("|---|---:|---:|");
  for (const lang of analysis.stats.languages.slice(0, 24)) {
    lines.push(`| ${lang.name} | ${lang.files.toLocaleString()} | ${formatBytes(lang.bytes)} |`);
  }
  lines.push("");
  lines.push("## Top-Level Directory Analysis");
  for (const stat of dirStats.slice(0, 28)) {
    lines.push(`### \`${stat.key}\``);
    lines.push(`- Files: **${stat.files.toLocaleString()}**`);
    lines.push(`- Size: **${formatBytes(stat.bytes)}**`);
    lines.push(`- Language mix: ${toLangSummary(stat.languages) || "n/a"}`);
    if (stat.largestFiles.length > 0) {
      lines.push("- Largest files:");
      for (const file of stat.largestFiles) {
        lines.push(`  - \`${file.relativePath}\` (${formatBytes(file.bytes)})`);
      }
    }
    lines.push("");
  }

  lines.push("## Dependency and Module Graph");
  lines.push(
    "Modules are coarse buckets inferred from folder conventions (`src/*`, `apps/*`, `packages/*`, and top-level directories). Edges are relative-import counts, so this is a structural hint map, not an exact call graph.",
  );
  lines.push("");
  lines.push("### Most Connected Modules");
  for (const module of moduleConnectivity.slice(0, 24)) {
    lines.push(`- \`${module.label}\`: connectivity=${module.score}, incoming=${module.inWeight}, outgoing=${module.outWeight}`);
  }
  lines.push("");
  lines.push("### Strongest Edges");
  for (const edge of graph.edges.slice(0, 40)) {
    lines.push(`- \`${edge.from}\` -> \`${edge.to}\` (weight=${edge.weight})`);
  }
  lines.push("");
  lines.push("## Manifests and Build Signals");
  if (analysis.stats.manifests.length === 0) {
    lines.push("- No known manifest file detected at repo root.");
  } else {
    for (const manifest of analysis.stats.manifests) {
      lines.push(`- \`${manifest}\``);
    }
  }
  lines.push("");
  lines.push("## Technical Intent Hypotheses");
  if (analysis.hypotheses.length === 0) {
    lines.push("- No strong hypothesis was inferred from manifests/language profile.");
  } else {
    for (const h of analysis.hypotheses) {
      lines.push(`### ${h.title}`);
      lines.push(`- Hypothesis: ${h.hypothesis}`);
      lines.push(`- Confidence: ${h.confidence}`);
      lines.push(`- Evidence: ${h.evidence.join("; ") || "n/a"}`);
      lines.push("");
    }
  }

  lines.push("## Git Ownership Signals");
  if (!analysis.git?.isRepo) {
    lines.push("- The scanned directory is not a git repository.");
  } else {
    if (analysis.git.head) {
      lines.push(
        `- HEAD: \`${analysis.git.head.sha.slice(0, 12)}\` by **${analysis.git.head.author}** on \`${analysis.git.head.date}\``,
      );
      lines.push(`- HEAD message: ${analysis.git.head.message}`);
    }
    if (topAuthors.length === 0) {
      lines.push("- No author history could be parsed from git shortlog.");
    } else {
      lines.push("- Top contributors (by commit count):");
      for (const a of topAuthors) {
        lines.push(`  - ${a.name}: ${a.commits} commits (${a.emails.join(", ")})`);
      }
    }
  }
  lines.push("");
  lines.push("## File Inventory (Alphabetical, first 260 files)");
  for (const line of inventory) {
    lines.push(line);
  }
  lines.push("");
  lines.push("## Notes and Caveats");
  for (const note of analysis.notes) {
    lines.push(`- ${note}`);
  }
  lines.push("- Generated automatically by Codebase Analyzer crawler agent.");
  lines.push("");
  return lines.join("\n");
}

