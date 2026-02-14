import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type HeadInfo = { sha: string; message: string; author: string; date: string };

export async function getGitSignals(repoPath: string): Promise<{
  isRepo: boolean;
  head?: HeadInfo;
  topAuthors?: { name: string; emails: string[]; commits: number }[];
}> {
  try {
    await execFileAsync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: repoPath });
  } catch {
    return { isRepo: false };
  }

  const head = await getHead(repoPath);
  const topAuthors = await getTopAuthors(repoPath);
  return { isRepo: true, head, topAuthors };
}

async function getHead(repoPath: string): Promise<HeadInfo | undefined> {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["log", "-1", "--pretty=format:%H%n%an%n%ad%n%s", "--date=iso-strict"],
      { cwd: repoPath, maxBuffer: 1024 * 1024 },
    );
    const [sha, author, date, message] = stdout.split("\n");
    if (!sha) return undefined;
    return { sha, author: author ?? "", date: date ?? "", message: message ?? "" };
  } catch {
    return undefined;
  }
}

async function getTopAuthors(repoPath: string): Promise<{ name: string; emails: string[]; commits: number }[]> {
  // Best-effort: parse git shortlog. Email grouping isn't perfect.
  try {
    const { stdout } = await execFileAsync("git", ["shortlog", "-sne", "--all"], {
      cwd: repoPath,
      maxBuffer: 1024 * 1024,
    });

    const rows = stdout
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 20);

    const byName = new Map<string, { commits: number; emails: Set<string> }>();
    for (const row of rows) {
      const m = row.match(/^(\d+)\s+(.+?)\s+<([^>]+)>$/);
      if (!m) continue;
      const commits = Number(m[1]);
      const name = m[2].trim();
      const email = m[3].trim();
      const cur = byName.get(name) ?? { commits: 0, emails: new Set<string>() };
      cur.commits += commits;
      cur.emails.add(email);
      byName.set(name, cur);
    }

    return Array.from(byName.entries())
      .map(([name, v]) => ({ name, commits: v.commits, emails: Array.from(v.emails).sort() }))
      .sort((a, b) => b.commits - a.commits);
  } catch {
    return [];
  }
}

