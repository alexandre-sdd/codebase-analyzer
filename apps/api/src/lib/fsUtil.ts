import fs from "node:fs/promises";
import path from "node:path";

/**
 * Ensure a directory exists, creating it recursively if needed.
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    // Ignore if directory already exists
    const stat = await fs.stat(dirPath).catch(() => null);
    if (!stat?.isDirectory()) {
      throw err;
    }
  }
}

/**
 * Check if a file or directory exists.
 */
export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a path is a subpath of a root directory.
 * Both paths are resolved to absolute paths before comparison.
 */
export function isSubpath(childPath: string, rootPath: string): boolean {
  const resolvedChild = path.resolve(childPath);
  const resolvedRoot = path.resolve(rootPath);
  const relative = path.relative(resolvedRoot, resolvedChild);
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}
