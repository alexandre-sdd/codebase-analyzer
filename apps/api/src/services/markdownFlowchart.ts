import { z } from "zod";
import type { Env } from "../lib/env";
import { makeLlmClient } from "../llm/clientFactory";

const FlowNodeSchema = z.object({
  id: z.string().min(1).max(80),
  label: z.string().min(1).max(120),
  tech: z.array(z.string().min(1).max(40)).max(8).optional(),
});

const FlowEdgeSchema = z.object({
  from: z.string().min(1).max(80),
  to: z.string().min(1).max(80),
  label: z.string().min(1).max(90).optional(),
  weight: z.number().int().min(1).max(8).optional(),
});

const FlowSpecSchema = z.object({
  title: z.string().min(1).max(140),
  nodes: z.array(FlowNodeSchema).min(4).max(18),
  edges: z.array(FlowEdgeSchema).min(3).max(48),
});

type RawFlowSpec = {
  title: string;
  nodes: { id: string; label: string; tech?: string[] }[];
  edges: { from: string; to: string; label?: string; weight?: number }[];
};

type NormalizedFlowSpec = {
  title: string;
  nodes: { id: string; label: string; tech: string[] }[];
  edges: { from: string; to: string; label: string; weight: number }[];
};

export type MarkdownFlowchartResult = {
  highLevelDescription: string;
  mermaidFlowchart: string;
};

export async function generateFlowchartFromMarkdown(
  structureReportMarkdown: string,
  env: Env,
  onProgress?: (pct: number, stage: string) => Promise<void>,
): Promise<MarkdownFlowchartResult> {
  const emitProgress = async (pct: number, stage: string) => {
    const bounded = Math.max(0, Math.min(100, Math.round(pct)));
    await onProgress?.(bounded, stage);
  };

  await emitProgress(8, "Preparing markdown context");
  const llm = makeLlmClient(env);
  const reportForPrompt = trimForPrompt(structureReportMarkdown, 60_000);

  await emitProgress(26, "Generating high-level architecture summary");
  let highLevelDescription = "";
  try {
    highLevelDescription = (
      await llm.generateText({
        system: [
          "You are a principal engineer writing onboarding architecture documentation.",
          "Use only facts grounded in the provided report. If uncertain, state unknowns clearly.",
          "Output plain markdown only.",
        ].join("\n"),
        maxTokens: 2000,
        prompt: [
          "Create a high-level architecture description from this repository report.",
          "The audience is a newly onboarded engineer.",
          "",
          "Output markdown with these exact sections:",
          "## System Purpose",
          "## Core Runtime Flow",
          "## Main Components And Technologies",
          "## Integration Boundaries",
          "## Suggested Reading Order",
          "## Known Unknowns",
          "",
          "Constraints:",
          "- Keep it concrete and technical.",
          "- Mention technologies only when evidenced in the report.",
          "- 350 to 700 words.",
          "",
          "STRUCTURE_REPORT_MARKDOWN:",
          reportForPrompt,
        ].join("\n"),
      })
    ).trim();
  } catch {
    highLevelDescription = "";
  }

  if (!highLevelDescription) {
    highLevelDescription = fallbackHighLevelDescription(structureReportMarkdown);
  }

  await emitProgress(56, "Generating Mermaid flow structure");
  let flowSpec: NormalizedFlowSpec;
  try {
    const generated = await llm.generateJson(
      {
        system: [
          "You produce architecture graph JSON for onboarding.",
          "Return valid JSON only and stay grounded in provided inputs.",
          "Do not output markdown fences or explanatory text.",
        ].join("\n"),
        maxTokens: 2600,
        prompt: [
          "Generate a directional high-level flow graph for the codebase.",
          "Return JSON with this exact schema:",
          '{ "title": string, "nodes": [{ "id": string, "label": string, "tech": string[] }], "edges": [{ "from": string, "to": string, "label": string, "weight": number }] }',
          "",
          "Rules:",
          "- 6 to 14 nodes",
          "- Edges should represent important control/data/dependency flow a new engineer should understand",
          "- Keep node and edge labels short and specific",
          "- Include 0 to 4 technologies in each node where relevant",
          "",
          "HIGH_LEVEL_DESCRIPTION_MARKDOWN:",
          trimForPrompt(highLevelDescription, 20_000),
          "",
          "STRUCTURE_REPORT_MARKDOWN:",
          trimForPrompt(reportForPrompt, 35_000),
        ].join("\n"),
      },
      FlowSpecSchema,
    );
    flowSpec = normalizeFlowSpec(generated as RawFlowSpec);
  } catch {
    flowSpec = fallbackFlowSpec(structureReportMarkdown);
  }

  await emitProgress(82, "Normalizing flow graph");
  const mermaidFlowchart = renderMermaid(flowSpec);
  await emitProgress(94, "Finalizing Mermaid output");

  return {
    highLevelDescription,
    mermaidFlowchart,
  };
}

function fallbackHighLevelDescription(markdown: string): string {
  const headings = extractHeadings(markdown).slice(0, 8);
  const technologies = inferTechnologies(markdown).slice(0, 10);
  const areaLines =
    headings.length > 0
      ? headings.map((h) => `- ${h}`)
      : ["- Entry points and bootstrap", "- Main services and application logic", "- Integrations and persistence"];
  const techLines =
    technologies.length > 0
      ? technologies.map((t) => `- ${t}`)
      : ["- Technology usage was not explicit enough in the source report."];

  return [
    "## System Purpose",
    "This summary was generated from the detailed structure report and is meant as a starting point for onboarding.",
    "",
    "## Core Runtime Flow",
    "The runtime likely starts at entry points, then moves through service/business logic, and finally reaches integration or storage layers.",
    "",
    "## Main Components And Technologies",
    ...areaLines,
    ...techLines,
    "",
    "## Integration Boundaries",
    "Identify external APIs, databases, queues, and infrastructure modules before changing core logic.",
    "",
    "## Suggested Reading Order",
    "1. Entry points and app bootstrap",
    "2. Request handlers or orchestration layer",
    "3. Core domain modules",
    "4. Persistence and external integrations",
    "5. Operational tooling and tests",
    "",
    "## Known Unknowns",
    "- This fallback summary is based only on markdown structure and may miss dynamic runtime behaviors.",
  ].join("\n");
}

function fallbackFlowSpec(markdown: string): NormalizedFlowSpec {
  const headings = extractHeadings(markdown).slice(0, 8);
  const pathSignals = extractPathSignals(markdown).slice(0, 10);
  const technologies = inferTechnologies(markdown).slice(0, 8);
  const labels = dedupeStrings([
    ...pathSignals,
    ...headings,
    ...defaultFlowLabels(),
  ]).slice(0, 10);
  const nodes = labels.map((label, idx) => ({
    id: toFlowId(label, `n${idx + 1}`),
    label: clampText(label, 72),
    tech: idx < 2 ? technologies.slice(0, 4) : [],
  }));

  const normalizedNodes: NormalizedFlowSpec["nodes"] = [];
  const seen = new Set<string>();
  for (const node of nodes) {
    const finalId = uniqueId(node.id, normalizedNodes.length + 1, seen);
    normalizedNodes.push({
      id: finalId,
      label: node.label,
      tech: node.tech,
    });
    seen.add(finalId);
  }

  const edges: NormalizedFlowSpec["edges"] = [];
  for (let i = 0; i < normalizedNodes.length - 1; i += 1) {
    edges.push({
      from: normalizedNodes[i].id,
      to: normalizedNodes[i + 1].id,
      label: "feeds",
      weight: 2,
    });
  }
  if (normalizedNodes.length >= 4) {
    edges.push({
      from: normalizedNodes[1].id,
      to: normalizedNodes[normalizedNodes.length - 1].id,
      label: "depends on",
      weight: 1,
    });
  }

  return {
    title: "High-Level Codebase Flow",
    nodes: normalizedNodes,
    edges,
  };
}

function normalizeFlowSpec(raw: RawFlowSpec): NormalizedFlowSpec {
  const nodes: NormalizedFlowSpec["nodes"] = [];
  const nodeIdMap = new Map<string, string>();
  const used = new Set<string>();

  for (let i = 0; i < raw.nodes.length; i += 1) {
    const node = raw.nodes[i];
    const base = toFlowId(node.id || node.label, `n${i + 1}`);
    const id = uniqueId(base, i + 1, used);
    used.add(id);
    nodeIdMap.set(node.id, id);
    nodes.push({
      id,
      label: clampText(node.label, 72),
      tech: dedupeStrings(node.tech ?? [])
        .slice(0, 4)
        .map((t) => clampText(t, 32)),
    });
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edgeDedup = new Set<string>();
  const edges: NormalizedFlowSpec["edges"] = [];
  for (let i = 0; i < raw.edges.length; i += 1) {
    const edge = raw.edges[i];
    const from = nodeIdMap.get(edge.from) ?? toFlowId(edge.from, "");
    const to = nodeIdMap.get(edge.to) ?? toFlowId(edge.to, "");
    if (!from || !to || !nodeIds.has(from) || !nodeIds.has(to) || from === to) continue;
    const label = clampText(edge.label ?? "", 48);
    const key = `${from}->${to}|${label}`;
    if (edgeDedup.has(key)) continue;
    edgeDedup.add(key);
    edges.push({
      from,
      to,
      label,
      weight: clampNumber(edge.weight ?? 1, 1, 8),
    });
  }

  if (edges.length < 3 && nodes.length >= 4) {
    for (let i = 0; i < nodes.length - 1; i += 1) {
      edges.push({
        from: nodes[i].id,
        to: nodes[i + 1].id,
        label: "flows to",
        weight: 1,
      });
    }
  }

  return {
    title: clampText(raw.title, 120) || "High-Level Codebase Flow",
    nodes,
    edges: edges.slice(0, 48),
  };
}

function renderMermaid(spec: NormalizedFlowSpec): string {
  const lines: string[] = ["flowchart TD"];
  for (const node of spec.nodes) {
    const techSuffix = node.tech.length > 0 ? `\\n[${node.tech.join(", ")}]` : "";
    lines.push(`  ${node.id}["${escapeMermaid(`${node.label}${techSuffix}`)}"]`);
  }
  for (const edge of spec.edges) {
    const label = escapeMermaid(edge.label);
    if (label) {
      lines.push(`  ${edge.from} -->|${label}| ${edge.to}`);
    } else {
      lines.push(`  ${edge.from} --> ${edge.to}`);
    }
  }
  return lines.join("\n");
}

function extractHeadings(markdown: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const line of markdown.split("\n")) {
    const m = line.match(/^#{1,3}\s+(.+?)\s*$/);
    if (!m) continue;
    const heading = clampText(m[1].trim(), 72);
    if (!heading) continue;
    const key = heading.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(heading);
  }
  return out;
}

function extractPathSignals(markdown: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const re = /`([^`\n]{2,120})`/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;
    if (!/[/.]/.test(raw)) continue;
    const label = normalizePathLabel(raw);
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

function inferTechnologies(text: string): string[] {
  const lc = text.toLowerCase();
  const checks: [string, string[]][] = [
    ["TypeScript", ["typescript", ".ts", "tsconfig"]],
    ["JavaScript", ["javascript", ".js", "node"]],
    ["React", ["react", "jsx", "tsx"]],
    ["Fastify", ["fastify"]],
    ["Express", ["express"]],
    ["Next.js", ["next.js", ".next"]],
    ["Node.js", ["node.js", "node runtime"]],
    ["Python", ["python", "pyproject", "requirements.txt"]],
    ["Go", ["go.mod", "golang"]],
    ["Rust", ["cargo.toml", "rust"]],
    ["PostgreSQL", ["postgres", "postgresql"]],
    ["Redis", ["redis"]],
    ["Docker", ["docker", "dockerfile", "docker-compose"]],
  ];
  const out: string[] = [];
  for (const [label, terms] of checks) {
    if (terms.some((term) => lc.includes(term))) out.push(label);
  }
  return out;
}

function defaultFlowLabels(): string[] {
  return [
    "User Entry Points",
    "Routing And API Layer",
    "Application Services",
    "Domain Logic",
    "Data Access Layer",
    "External Integrations",
    "Operations And Tooling",
  ];
}

function normalizePathLabel(raw: string): string {
  const cleaned = raw
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  return cleaned
    .split("/")
    .slice(-2)
    .join(" / ")
    .split(" ")
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");
}

function trimForPrompt(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[truncated to ${maxChars} chars]`;
}

function dedupeStrings(values: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const t = value.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

function toFlowId(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const base = slug || fallback || "node";
  return /^[a-z]/.test(base) ? base : `n_${base}`;
}

function uniqueId(base: string, index: number, used: Set<string>): string {
  const safeBase = base || `node_${index}`;
  if (!used.has(safeBase)) return safeBase;
  let suffix = 2;
  while (used.has(`${safeBase}_${suffix}`)) suffix += 1;
  return `${safeBase}_${suffix}`;
}

function clampText(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

function clampNumber(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function escapeMermaid(text: string): string {
  return text.replace(/"/g, "'").replace(/\|/g, "/").replace(/\n+/g, " ").trim();
}
