
import {
  getGitHubRepository,
  getGitHubFiles,
  getGitHubFileContent
} from "./github.js";

import { filterSourceFiles } from "./file-filter.js";
import { prisma } from "./db.js";

export async function importRepositoryFiles(
  owner: string,
  name: string
) {
  // 1. Get repository metadata
  const repo = await getGitHubRepository(owner, name);

  const repoOwner = repo.owner.login;
  const repoName = repo.name;

  // 2. Discover and filter files
  const files = await getGitHubFiles(
    repoOwner,
    repoName,
    repo.default_branch
  );

  const selectedFiles = filterSourceFiles(files);

  // 3. Ensure repository exists in PostgreSQL
  const repository = await prisma.repository.upsert({
    where: {
      owner_name: { owner: repoOwner, name: repoName }
    },
    update: {},
    create: { owner: repoOwner, name: repoName }
  });

  // 4. Save the first three files
  for (const file of selectedFiles.slice(0, 3)) {
    const content = await getGitHubFileContent(
      repoOwner,
      repoName,
      file.sha
    );

    await prisma.repoFile.upsert({
      where: {
        repositoryId_path: {
          repositoryId: repository.id,
          path: file.path
        }
      },
      update: { content },
      create: {
        path: file.path,
        content,
        repositoryId: repository.id
      }
    });
  }

  return {
    repository: repo.full_name,
    filesSaved: Math.min(selectedFiles.length, 3)
  };
}
