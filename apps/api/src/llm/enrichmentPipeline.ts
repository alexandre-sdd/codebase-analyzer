import { z } from "zod";
import type { LlmClient } from "./types";
import type { AnalysisArtifact, TaskSuggestion } from "../services/repoAnalyzer";
import { generateExcalidraw } from "../analyzer/excalidraw";

const TaskSchema = z.object({
  title: z.string().min(1),
  goal: z.string().min(1),
  timeboxMinutes: z.number().int().min(10).max(240),
  acceptanceCriteria: z.array(z.string().min(1)).min(1).max(8),
  hints: z.array(z.string().min(1)).min(1).max(8),
});

const EnrichedGraphSchema = z.object({
  title: z.string().min(1),
  nodes: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .min(3)
    .max(30),
  edges: z
    .array(
      z.object({
        from: z.string().min(1),
        to: z.string().min(1),
        weight: z.number().int().min(1).max(20).default(1),
      }),
    )
    .min(0)
    .max(120),
});

type EnrichmentInputs = {
  baseDiagram: any;
  podcastFallback: string;
  tasksFallback: TaskSuggestion[];
};

export async function enrichWithLlm(
  llm: LlmClient,
  analysis: AnalysisArtifact,
  inputs: EnrichmentInputs,
): Promise<{ diagram: any; podcast: string; tasks: TaskSuggestion[] }> {
  const system = [
    "You are a staff software engineer helping a new hire.",
    "You must be concrete and avoid hallucinating; if unsure, say so.",
    "When producing JSON, output JSON only (no markdown fences).",
  ].join("\n");

  const context = JSON.stringify(analysis, null, 2);

  // 1) Podcast script
  const podcast = await llm.generateText({
    system,
    maxTokens: 900,
    prompt: [
      "Write a 4-6 minute podcast-style onboarding script explaining this codebase at a high level.",
      "Style: 2 hosts (A and B), concise, technical, no fluff.",
      "Include: what the system likely does, module boundaries, data flow, what to read first, and 1 warning about common pitfalls.",
      "",
      "CONTEXT:",
      context,
    ].join("\n"),
  });

  // 2) Starter tasks
  const tasks = await llm.generateJson(
    {
      system,
      maxTokens: 700,
      prompt: [
        "Propose 3 starter tasks for a new engineer to get hands-on with this codebase.",
        "Constraints:",
        "- Each task must be safe (low blast radius) and shippable in <= 2 hours",
        "- Include acceptance criteria and concrete hints",
        "",
        "Return JSON: an array of tasks.",
        "",
        "CONTEXT:",
        context,
      ].join("\n"),
    },
    z.array(TaskSchema).min(3).max(3),
  );

  // 3) Better diagram spec (then we render to Excalidraw ourselves)
  const diagramSpec = await llm.generateJson(
    {
      system,
      maxTokens: 700,
      prompt: [
        "Create a simplified architecture graph for an onboarding diagram.",
        "Rules:",
        "- 6 to 14 nodes",
        "- Node labels should be human-friendly (not raw folder names) but grounded in evidence",
        "- Edges represent major calls/dependencies",
        "",
        "Return JSON with shape: { title, nodes: [{id,label}], edges: [{from,to,weight}] }",
        "",
        "CONTEXT:",
        context,
      ].join("\n"),
    },
    EnrichedGraphSchema,
  );

  const diagram = generateExcalidraw(
    { modules: diagramSpec.nodes, edges: diagramSpec.edges },
    { title: diagramSpec.title },
  );

  return {
    diagram: diagram ?? inputs.baseDiagram,
    podcast: podcast?.trim() ? podcast : inputs.podcastFallback,
    tasks: tasks?.length ? tasks : inputs.tasksFallback,
  };
}

