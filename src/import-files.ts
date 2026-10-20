
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
  const repo = await getGitHubRepository(owner, name);

  const repoOwner = repo.owner.login;
  const repoName = repo.name;

  const files = await getGitHubFiles(
    repoOwner,
    repoName,
    repo.default_branch
  );

  const selectedFiles = filterSourceFiles(files);

  const repository = await prisma.repository.upsert({
    where: {
      owner_name: { owner: repoOwner, name: repoName }
    },
    update: {},
    create: { owner: repoOwner, name: repoName }
  });

  const MAX_FILES = 10;
let filesSaved = 0;

for (const file of selectedFiles.slice(0, MAX_FILES)) {
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
    filesSaved++;
  }

  return {
  repository: repo.full_name,
  totalAvailable: selectedFiles.length,
  filesSaved
};
}
