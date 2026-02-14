import type { Env } from "../lib/env";
import type { TtsClient } from "./types";
import { createElevenLabsClient } from "./elevenlabsTts";

export function makeTtsClient(env: Env): TtsClient {
  return createElevenLabsClient({
    apiKey: env.ELEVENLABS_API_KEY,
    voiceId: env.ELEVENLABS_VOICE_ID,
    model: env.ELEVENLABS_MODEL,
  });
}
