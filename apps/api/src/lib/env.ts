import path from "node:path";

export type Env = {
  HOST: string;
  PORT: number;
  LOG_LEVEL: string;
  JOBS_DIR: string;
  CORS_ORIGINS: string[];
  LLM_PROVIDER: string;
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL: string;
  ANTHROPIC_BASE_URL: string;
  ANTHROPIC_VERSION: string;
  MAX_FILES?: number;
  MAX_IMPORT_SCAN_FILES?: number;
  MAX_BYTES_PER_FILE?: number;
  ALLOWED_REPO_ROOT?: string;
};

export function loadEnv(raw: Record<string, string | undefined>): Env {
  const host = raw.HOST ?? "0.0.0.0";
  const port = parseInt(raw.PORT ?? "8787", 10);
  const logLevel = raw.LOG_LEVEL ?? "info";
  const cwd = process.cwd();
  const normalizedCwd = cwd.replace(/\\/g, "/");
  const defaultJobsDir = normalizedCwd.endsWith("/apps/api")
    ? path.join(cwd, ".jobs")
    : path.join(cwd, "apps", "api", ".jobs");
  const jobsDir = raw.JOBS_DIR ?? defaultJobsDir;
  const corsOrigins = raw.CORS_ORIGINS
    ? raw.CORS_ORIGINS.split(",").map((s) => s.trim())
    : ["http://localhost:3000", "http://localhost:5173"];

  const llmProvider = raw.LLM_PROVIDER ?? "anthropic";
  const anthropicApiKey = raw.ANTHROPIC_API_KEY ?? "";
  const anthropicModel = raw.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929";
  const anthropicBaseUrl = raw.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com";
  const anthropicVersion = raw.ANTHROPIC_VERSION ?? "2023-06-01";

  const maxFiles = raw.MAX_FILES ? parseInt(raw.MAX_FILES, 10) : undefined;
  const maxImportScanFiles = raw.MAX_IMPORT_SCAN_FILES ? parseInt(raw.MAX_IMPORT_SCAN_FILES, 10) : undefined;
  const maxBytesPerFile = raw.MAX_BYTES_PER_FILE ? parseInt(raw.MAX_BYTES_PER_FILE, 10) : undefined;
  const allowedRepoRoot = raw.ALLOWED_REPO_ROOT;

  return {
    HOST: host,
    PORT: port,
    LOG_LEVEL: logLevel,
    JOBS_DIR: jobsDir,
    CORS_ORIGINS: corsOrigins,
    LLM_PROVIDER: llmProvider,
    ANTHROPIC_API_KEY: anthropicApiKey,
    ANTHROPIC_MODEL: anthropicModel,
    ANTHROPIC_BASE_URL: anthropicBaseUrl,
    ANTHROPIC_VERSION: anthropicVersion,
    MAX_FILES: maxFiles,
    MAX_IMPORT_SCAN_FILES: maxImportScanFiles,
    MAX_BYTES_PER_FILE: maxBytesPerFile,
    ALLOWED_REPO_ROOT: allowedRepoRoot,
  };
}
