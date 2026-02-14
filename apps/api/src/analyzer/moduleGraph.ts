import fs from "node:fs/promises";
import path from "node:path";
import type { RepoSnapshot } from "./scanRepo";

export type ModuleNode = {
  id: string;
  label: string;
};

export type ModuleEdge = {
  from: string;
  to: string;
  weight: number;
};

export type ModuleGraph = {
  modules: ModuleNode[];
  edges: ModuleEdge[];
};

export type BuildGraphOptions = {
  maxFilesToScan: number;
  maxBytesPerFile: number;
  onProgress?: (info: { scanned: number; total: number; currentPath: string }) => void | Promise<void>;
};

const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py"]);

function moduleKeyFromRelPath(relativePath: string): string {
  const parts = relativePath.split(path.sep).filter(Boolean);
  if (!parts.length) return "root";
  if (parts[0] === "src" && parts.length >= 2) return `src/${parts[1]}`;
  if (parts[0] === "lib" && parts.length >= 2) return `lib/${parts[1]}`;
  if (parts[0] === "apps" && parts.length >= 2) return `apps/${parts[1]}`;
  if (parts[0] === "packages" && parts.length >= 2) return `packages/${parts[1]}`;
  return parts[0];
}

function extractImports(fileText: string): string[] {
  const imports: string[] = [];
  const lines = fileText.split("\n");
  for (const line of lines) {
    const l = line.trim();
    if (!l || l.startsWith("//") || l.startsWith("#")) continue;

    // JS/TS: import x from "y";  import("y");  require("y")
    const m1 = l.match(/\bfrom\s+["']([^"']+)["']/);
    if (m1) imports.push(m1[1]);
    const m2 = l.match(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/);
    if (m2) imports.push(m2[1]);
    const m3 = l.match(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/);
    if (m3) imports.push(m3[1]);

    // Python: import x / from x import y
    const m4 = l.match(/^\s*import\s+([a-zA-Z0-9_\.]+)/);
    if (m4) imports.push(m4[1]);
    const m5 = l.match(/^\s*from\s+([a-zA-Z0-9_\.]+)\s+import\s+/);
    if (m5) imports.push(m5[1]);
  }
  return imports;
}

function isRelativeImport(spec: string): boolean {
  return spec.startsWith(".") || spec.startsWith("/");
}

function resolveRelativeImport(fromFileAbs: string, spec: string): string {
  if (spec.startsWith("/")) return spec;
  return path.resolve(path.dirname(fromFileAbs), spec);
}

export async function buildModuleGraph(snapshot: RepoSnapshot, opts: BuildGraphOptions): Promise<ModuleGraph> {
  const nodes = new Map<string, ModuleNode>();
  const edgeWeights = new Map<string, number>();

  const candidates = snapshot.files
    .filter((f) => CODE_EXTS.has(path.extname(f.relativePath).toLowerCase()))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, opts.maxFilesToScan);

  for (let index = 0; index < candidates.length; index += 1) {
    const file = candidates[index];
    if (opts.onProgress && (index === 0 || index % 8 === 0 || index + 1 === candidates.length)) {
      await opts.onProgress({
        scanned: index + 1,
        total: candidates.length,
        currentPath: file.relativePath,
      });
    }

    const abs = path.join(snapshot.repoPath, file.relativePath);
    const fromModule = moduleKeyFromRelPath(file.relativePath);
    nodes.set(fromModule, { id: fromModule, label: fromModule });

    if (file.bytes > opts.maxBytesPerFile) continue;

    let text: string;
    try {
      text = await fs.readFile(abs, "utf8");
    } catch {
      continue;
    }

    const imports = extractImports(text);
    for (const imp of imports) {
      if (!isRelativeImport(imp)) continue;
      const resolved = resolveRelativeImport(abs, imp);
      const rel = path.relative(snapshot.repoPath, resolved);
      if (rel.startsWith("..")) continue;
      const toModule = moduleKeyFromRelPath(rel);
      if (toModule === fromModule) continue;
      nodes.set(toModule, { id: toModule, label: toModule });

      const k = `${fromModule} -> ${toModule}`;
      edgeWeights.set(k, (edgeWeights.get(k) ?? 0) + 1);
    }
  }

  const modules = Array.from(nodes.values()).sort((a, b) => a.label.localeCompare(b.label));
  const edges: ModuleEdge[] = Array.from(edgeWeights.entries())
    .map(([k, weight]) => {
      const [from, to] = k.split(" -> ");
      return { from, to, weight };
    })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 80);

  return { modules, edges };
}
