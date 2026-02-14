import { z } from "zod";
import type { LlmClient, LlmTextRequest } from "./types";

export function makeMockClient(): LlmClient {
  return {
    async generateText(req: LlmTextRequest): Promise<string> {
      return [
        "# Mock LLM Output",
        "",
        "This is deterministic placeholder content.",
        "",
        "System:",
        "```",
        req.system.slice(0, 400),
        "```",
        "",
        "Prompt:",
        "```",
        req.prompt.slice(0, 1200),
        "```",
        "",
      ].join("\n");
    },
    async generateJson<T>(req: LlmTextRequest, schema: z.ZodType<T>): Promise<T> {
      // Provide a schema-shaped minimal output when possible.
      const shape = schema.safeParse({});
      if (shape.success) return shape.data;

      // Fallback: return a crude object if schema allows it.
      const anyObj = schema.safeParse({ ok: true });
      if (anyObj.success) return anyObj.data;

      throw new Error(`mockClient cannot satisfy schema. system=${req.system.slice(0, 40)}`);
    },
  };
}

