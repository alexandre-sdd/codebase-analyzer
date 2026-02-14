import { z } from "zod";
import type { LlmClient, LlmTextRequest } from "./types";

type AnthropicClientOpts = {
  apiKey: string;
  model: string;
  baseUrl: string;
  version: string;
};

// NOTE: Anthropic API details can change. This is intentionally small and easily swapped.
export function makeAnthropicClient(opts: AnthropicClientOpts): LlmClient {
  return {
    async generateText(req: LlmTextRequest): Promise<string> {
      const url = `${opts.baseUrl.replace(/\/$/, "")}/v1/messages`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": opts.apiKey,
          "anthropic-version": opts.version,
        },
        body: JSON.stringify({
          model: opts.model,
          max_tokens: req.maxTokens,
          system: req.system,
          messages: [{ role: "user", content: req.prompt }],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Anthropic API error (${res.status}): ${text}`);
      }

      const data = (await res.json()) as any;
      const parts: string[] = Array.isArray(data?.content) ? data.content.map((c: any) => c?.text).filter(Boolean) : [];
      const text = parts.join("\n").trim();
      if (!text) throw new Error("Anthropic API returned empty content");
      return text;
    },

    async generateJson<T>(req: LlmTextRequest, schema: z.ZodType<T>): Promise<T> {
      const raw = await this.generateText(req);
      // Expect JSON-only; strip code fences if present.
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      const parsed = JSON.parse(cleaned);
      return schema.parse(parsed);
    },
  };
}
