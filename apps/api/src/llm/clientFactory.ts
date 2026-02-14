import type { Env } from "../lib/env";
import type { LlmClient } from "./types";
import { makeMockClient } from "./mockClient";
import { makeAnthropicClient } from "./anthropicClient";

export function makeLlmClient(env: Env): LlmClient | null {
  if (env.LLM_PROVIDER === "mock") return makeMockClient();
  if (env.LLM_PROVIDER === "anthropic") {
    return makeAnthropicClient({
      apiKey: env.ANTHROPIC_API_KEY!,
      model: env.ANTHROPIC_MODEL,
      baseUrl: env.ANTHROPIC_BASE_URL,
      version: env.ANTHROPIC_VERSION,
    });
  }
  return null;
}

