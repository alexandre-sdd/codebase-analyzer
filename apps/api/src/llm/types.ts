import { z } from "zod";

export type LlmProvider = "anthropic";

export type LlmTextRequest = {
  system: string;
  prompt: string;
  maxTokens: number;
};

export type LlmClient = {
  generateText(req: LlmTextRequest): Promise<string>;
  generateJson<T>(req: LlmTextRequest, schema: z.ZodType<T>): Promise<T>;
};
