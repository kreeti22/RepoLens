
import type { GitHubTreeEntry } from "./github.js";

const allowedExtensions = [
  ".ts", ".tsx", ".js", ".jsx",
  ".py", ".java", ".cpp", ".c",
  ".h", ".html", ".css", ".json"
];

const ignoredFolders = [
  "node_modules",
  "dist",
  "generated",
  ".git",
  ".agents",
  ".claude",
  ".windsurf"
];

export function filterSourceFiles(
  files: GitHubTreeEntry[]
): GitHubTreeEntry[] {
  return files.filter((file) => {
    const parts = file.path.split("/");

    const ignored = parts.some((part) =>
      ignoredFolders.includes(part)
    );

    const supported = allowedExtensions.some((ext) =>
      file.path.toLowerCase().endsWith(ext)
    );

    const smallEnough =
      file.size !== undefined && file.size <= 100_000;

    return file.type === "blob" &&
      !ignored &&
      supported &&
      smallEnough;
  });
}
