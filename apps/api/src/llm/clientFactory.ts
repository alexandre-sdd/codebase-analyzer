import type { Env } from "../lib/env";
import type { LlmClient } from "./types";
import { makeAnthropicClient } from "./anthropicClient";

export function makeLlmClient(env: Env): LlmClient {
  return makeAnthropicClient({
    apiKey: env.ANTHROPIC_API_KEY,
    model: env.ANTHROPIC_MODEL,
    baseUrl: env.ANTHROPIC_BASE_URL,
    version: env.ANTHROPIC_VERSION,
  });
}
