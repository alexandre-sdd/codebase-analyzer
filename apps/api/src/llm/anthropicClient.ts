import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { LlmClient, LlmTextRequest } from "./types";

type AnthropicClientOpts = {
  apiKey: string;
  model: string;
  baseUrl: string;
  version: string;
};

export function makeAnthropicClient(opts: AnthropicClientOpts): LlmClient {
  const client = new Anthropic({
    apiKey: opts.apiKey,
    baseURL: opts.baseUrl,
  });

  return {
    async generateText(req: LlmTextRequest): Promise<string> {
      let message: Awaited<ReturnType<typeof client.messages.create>>;
      try {
        message = await client.messages.create({
          model: opts.model,
          max_tokens: req.maxTokens,
          system: req.system,
          messages: [{ role: "user", content: req.prompt }],
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes("model") && msg.toLowerCase().includes("not")) {
          throw new Error(
            `Anthropic model unavailable: ${opts.model}. Update ANTHROPIC_MODEL in .env to a valid model.`,
          );
        }
        throw err;
      }

      const text = message.content
        .map((block) => {
          if (block.type === "text") return block.text;
          return "";
        })
        .join("\n")
        .trim();

      if (!text) throw new Error("Anthropic API returned empty content");
      return text;
    },

    async generateJson<T>(req: LlmTextRequest, schema: z.ZodType<T>): Promise<T> {
      const parseCandidates = (raw: string): T | null => {
        const candidates = extractJsonCandidates(raw);
        for (const candidate of candidates) {
          try {
            const parsed = JSON.parse(candidate);
            return schema.parse(parsed);
          } catch {
            // try next candidate
          }
        }
        return null;
      };

      const raw = await this.generateText(req);
      const firstPass = parseCandidates(raw);
      if (firstPass) return firstPass;

      // One repair pass: ask the model to output strict JSON only from its own previous output.
      const repaired = await this.generateText({
        system: req.system,
        maxTokens: Math.min(Math.max(req.maxTokens, 900), 2400),
        prompt: [
          "Convert the following content into valid JSON only.",
          "Return JSON without markdown fences, commentary, or trailing text.",
          "",
          "CONTENT:",
          raw,
        ].join("\n"),
      });
      const secondPass = parseCandidates(repaired);
      if (secondPass) return secondPass;

      throw new Error("Model output was not valid JSON after repair attempt");
    },
  };
}

function stripCodeFences(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function extractJsonCandidates(raw: string): string[] {
  const out: string[] = [];
  const cleaned = stripCodeFences(raw);
  if (cleaned) out.push(cleaned);

  const objectSlice = findBalancedSlice(cleaned, "{", "}");
  if (objectSlice) out.push(objectSlice);

  const arraySlice = findBalancedSlice(cleaned, "[", "]");
  if (arraySlice) out.push(arraySlice);

  return dedupe(out);
}

function findBalancedSlice(text: string, open: "{" | "[", close: "}" | "]"): string | null {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === "\"") {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === open) {
      if (depth === 0) start = i;
      depth += 1;
      continue;
    }
    if (ch === close && depth > 0) {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        return text.slice(start, i + 1).trim();
      }
    }
  }
  return null;
}

function dedupe(values: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    const key = v.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}
