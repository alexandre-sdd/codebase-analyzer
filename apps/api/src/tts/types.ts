export interface TtsClient {
  generateSpeech(text: string): Promise<Buffer>;
}
