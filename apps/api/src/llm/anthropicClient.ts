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
      const message = await client.messages.create({
        model: opts.model,
        max_tokens: req.maxTokens,
        system: req.system,
        messages: [{ role: "user", content: req.prompt }],
      });

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
