import type { TtsClient } from "./types";

type ElevenLabsConfig = {
  apiKey: string;
  voiceId: string;
  model: string;
};

export function createElevenLabsClient(config: ElevenLabsConfig): TtsClient {
  return {
    async generateSpeech(text: string): Promise<Buffer> {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": config.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: config.model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    },
  };
}
