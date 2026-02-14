import type { LlmClient } from "../llm/types";
import type { TtsClient } from "../tts/types";

export async function generatePodcastFromMarkdown(
  llm: LlmClient,
  tts: TtsClient,
  structureReportMarkdown: string,
): Promise<Buffer> {
  // Generate podcast script using Claude
  const script = await generatePodcastScript(llm, structureReportMarkdown);

  // Convert script to audio using ElevenLabs
  const audioBuffer = await tts.generateSpeech(script);

  return audioBuffer;
}

async function generatePodcastScript(
  llm: LlmClient,
  structureReportMarkdown: string,
): Promise<string> {
  const system = [
    "You are a skilled technical podcast host who can explain complex codebases in an engaging, conversational way.",
    "Your style is clear, enthusiastic, and educational without being condescending.",
    "You speak naturally - use contractions, vary sentence length, and include natural transitions.",
    "Avoid jargon unless you immediately explain it.",
    "Write the script to be read aloud - no stage directions, no sound effects, just the spoken content.",
    "Aim for a 5-7 minute podcast episode (approximately 750-1000 words).",
  ].join("\n");

  const prompt = [
    "Create a podcast script based on this codebase analysis report.",
    "",
    "The script should:",
    "- Start with a compelling hook about what this codebase does",
    "- Explain the architecture and key components",
    "- Highlight the technology choices and why they matter",
    "- Share interesting insights from the analysis",
    "- End with practical advice for someone exploring this codebase",
    "",
    "Write in first person as a single podcast host speaking directly to the listener.",
    "Make it conversational and engaging - like you're explaining this to a smart colleague over coffee.",
    "",
    "STRUCTURE REPORT:",
    structureReportMarkdown.slice(0, 15000), // Limit to avoid token limits
  ].join("\n");

  try {
    const script = await llm.generateText({
      system,
      prompt,
      maxTokens: 2000,
    });

    return script.trim();
  } catch (error) {
    // Fallback: create a simple script from the report
    return generateFallbackScript(structureReportMarkdown);
  }
}

function generateFallbackScript(markdown: string): string {
  // Extract first few lines for title/first paragraph context
  const lines = markdown.split("\n").filter((line) => line.trim());
  const firstParagraph = lines.slice(0, 10).join(" ");

  return [
    "Welcome to this codebase overview.",
    "",
    `Today we're exploring a codebase with the following characteristics: ${firstParagraph.slice(0, 300)}...`,
    "",
    "Based on the analysis, this repository contains various modules and components that work together to create a functional system.",
    "",
    "The technology stack and architecture suggest a well-structured project with clear separation of concerns.",
    "",
    "To dive deeper, review the full structure report for detailed insights into the codebase organization, dependencies, and key files.",
    "",
    "Thanks for listening, and happy coding!",
  ].join("\n");
}
