import fs from "node:fs/promises";
import path from "node:path";
import type { Dirent } from "node:fs";

export type ManifestInfo = {
  path: string;
  bytes: number;
};

export type LanguageStat = {
  name: string;
  files: number;
  bytes: number;
};

export type RepoSnapshot = {
  repoName: string;
  repoPath: string;
  totalFiles: number;
  totalBytes: number;
  topLevelDirs: string[];
  manifests: ManifestInfo[];
  languages: LanguageStat[];
  files: { relativePath: string; bytes: number }[];
};

const DEFAULT_IGNORED_DIRS = new Set([
  ".git",
  ".hg",
  ".svn",
  "node_modules",
  "dist",
  "build",
  "out",
  ".next",
  ".turbo",
  ".cache",
  ".pytest_cache",
  ".mypy_cache",
  ".ruff_cache",
  ".venv",
  "venv",
  "__pycache__",
  "target",
  ".idea",
  ".vscode",
]);

const EXT_TO_LANG: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".mjs": "JavaScript",
  ".cjs": "JavaScript",
  ".py": "Python",
  ".go": "Go",
  ".rs": "Rust",
  ".java": "Java",
  ".kt": "Kotlin",
  ".cs": "C#",
  ".cpp": "C++",
  ".cc": "C++",
  ".cxx": "C++",
  ".c": "C",
  ".h": "C/C++ Header",
  ".hpp": "C/C++ Header",
  ".md": "Markdown",
  ".json": "JSON",
  ".yaml": "YAML",
  ".yml": "YAML",
  ".toml": "TOML",
  ".rb": "Ruby",
  ".php": "PHP",
  ".swift": "Swift",
  ".scala": "Scala",
  ".sql": "SQL",
  ".sh": "Shell",
  ".dockerfile": "Docker",
};

const KNOWN_MANIFESTS = [
  "package.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",
  "tsconfig.json",
  "pyproject.toml",
  "requirements.txt",
  "Pipfile",
  "poetry.lock",
  "uv.lock",
  "go.mod",
  "go.sum",
  "Cargo.toml",
  "Cargo.lock",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "Gemfile",
  "Gemfile.lock",
  "composer.json",
  "composer.lock",
  "Dockerfile",
  "docker-compose.yml",
];

export type ScanRepoOptions = {
  maxFiles: number;
  maxBytesPerFile: number;
};

type LangAgg = { files: number; bytes: number };

function langForFile(filePath: string): string {
  const base = path.basename(filePath);
  if (base === "Dockerfile") return "Docker";
  const ext = path.extname(base).toLowerCase();
  return EXT_TO_LANG[ext] ?? (ext ? ext.slice(1).toUpperCase() : "Unknown");
}

export async function scanRepo(repoPath: string, opts: ScanRepoOptions): Promise<RepoSnapshot> {
  const repoName = path.basename(path.resolve(repoPath));
  const files: { relativePath: string; bytes: number }[] = [];
  const langAgg: Record<string, LangAgg> = {};
  let totalBytes = 0;

  const topLevelEntries = await fs.readdir(repoPath, { withFileTypes: true });
  const topLevelDirs = topLevelEntries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => !DEFAULT_IGNORED_DIRS.has(name))
    .sort((a, b) => a.localeCompare(b));

  // Use a simple stack-based walk to avoid recursion depth issues.
  const stack: string[] = [repoPath];
  while (stack.length) {
    const dir = stack.pop()!;
    let entries: Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.name === "." || entry.name === "..") continue;
      const full = path.join(dir, entry.name);
      const rel = path.relative(repoPath, full);

      if (entry.isDirectory()) {
        if (DEFAULT_IGNORED_DIRS.has(entry.name)) continue;
        stack.push(full);
        continue;
      }

      if (!entry.isFile()) continue;
      if (files.length >= opts.maxFiles) continue;

      let stat: { size: number };
      try {
        stat = await fs.stat(full);
      } catch {
        continue;
      }

      const size = stat.size;
      totalBytes += size;
      files.push({ relativePath: rel, bytes: size });

      const lang = langForFile(full);
      langAgg[lang] ??= { files: 0, bytes: 0 };
      langAgg[lang].files += 1;
      langAgg[lang].bytes += size;
    }
  }

  const languages = Object.entries(langAgg)
    .map(([name, v]) => ({ name, files: v.files, bytes: v.bytes }))
    .sort((a, b) => b.bytes - a.bytes);

  const manifests: ManifestInfo[] = [];
  for (const manifest of KNOWN_MANIFESTS) {
    const p = path.join(repoPath, manifest);
    try {
      const stat = await fs.stat(p);
      if (!stat.isFile()) continue;
      manifests.push({ path: manifest, bytes: stat.size });
    } catch {
      // ignore
    }
  }

  return {
    repoName,
    repoPath,
    totalFiles: files.length,
    totalBytes,
    topLevelDirs,
    manifests,
    languages,
    files,
  };
}
