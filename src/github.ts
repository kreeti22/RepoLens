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
    throw new Error(`GitHub API failed: ${response.status}`);
  }

  const repository = (await response.json()) as GitHubRepository;
  return repository;
}
