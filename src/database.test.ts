
import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "./db.js";

describe("RepoLens database integration", () => {

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("retrieves stored repositories", async () => {
    const repositories = await prisma.repository.findMany();

    expect(repositories.length).toBeGreaterThan(0);
  });

  it("retrieves imported source files", async () => {
    const files = await prisma.repoFile.findMany({
      take: 5
    });

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      expect(file.path.length).toBeGreaterThan(0);
    }
  });

  it("verifies that a source file belongs to a repository", async () => {
    const file = await prisma.repoFile.findFirst();

    expect(file).not.toBeNull();

    if (!file) return;

    const repository = await prisma.repository.findUnique({
      where: {
        id: file.repositoryId
      }
    });

    expect(repository).not.toBeNull();
  });

});
