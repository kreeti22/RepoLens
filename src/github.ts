export interface GitHubRepository {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  default_branch: string;
  owner: {
    login: string;
  };
}

export async function getGitHubRepository(
  owner: string,
  name: string
): Promise<GitHubRepository> {
  const url = `https://api.github.com/repos/${owner}/${name}`;

  const response = await fetch(url);

  if (!response.ok) {
  if (response.status === 404) {
    throw new Error("GitHub repository not found");
  }

  if (
    (response.status === 403 || response.status === 429) &&
    response.headers.get("x-ratelimit-remaining") === "0"
  ) {
    throw new Error("GitHub API rate limit exceeded");
  }

  throw new Error(`GitHub API failed: ${response.status}`);
}

  const repository = (await response.json()) as GitHubRepository;
  return repository;
}

export interface GitHubTreeEntry {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
}

export interface GitHubTreeResponse {
  tree: GitHubTreeEntry[];
  truncated: boolean;
}


export async function getGitHubFiles(
  owner: string,
  name: string,
  branch: string
): Promise<GitHubTreeEntry[]> {
  const url = `https://api.github.com/repos/${owner}/${name}/git/trees/${encodeURIComponent(branch)}?recursive=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GitHub tree request failed: ${response.status}`);
  }

  const data = (await response.json()) as GitHubTreeResponse;

  if (data.truncated) {
    throw new Error("GitHub returned an incomplete file tree");
  }

  return data.tree.filter((entry) => entry.type === "blob");
}
  
interface GitHubBlobResponse {
  content: string;
  encoding: string;
}

export async function getGitHubFileContent(
  owner: string,
  name: string,
  sha: string
): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${name}/git/blobs/${sha}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GitHub blob request failed: ${response.status}`);
  }

  const data = (await response.json()) as GitHubBlobResponse;

  if (data.encoding !== "base64") {
    throw new Error("Unsupported file encoding");
  }

  return Buffer.from(data.content, "base64").toString("utf8");
}



