
import type { FastifyInstance } from "fastify";
import { getGitHubRepository } from "../github.js";
import { prisma } from "../db.js";
import { importRepositoryFiles } from "../import-files.js";

export function registerGitHubRoutes(app: FastifyInstance) {
  app.get<{
    Params: { owner: string; name: string };
  }>("/github/repositories/:owner/:name", async (request, reply) => {
    const { owner, name } = request.params;

    try {
      const repository = await getGitHubRepository(owner, name);

      return repository;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "GitHub repository not found"
      ) {
        return reply.code(404).send({
          message: "GitHub repository not found"
        });
      }

      throw error;
    }
  });

  
app.post<{
  Params: { owner: string; name: string };
}>("/github/import/:owner/:name", async (request, reply) => {
  const { owner, name } = request.params;

  try {
    // Fetch actual repository details from GitHub
    const githubRepo = await getGitHubRepository(owner, name);

    // Save the repository in PostgreSQL
    const repository = await prisma.repository.upsert({
      where: {
        owner_name: {
          owner: githubRepo.owner.login,
          name: githubRepo.name
        }
      },
      update: {},
      create: {
        owner: githubRepo.owner.login,
        name: githubRepo.name
      }
    });

    return reply.code(200).send({
      message: "Repository imported successfully",
      repository
    });

  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "GitHub repository not found"
    ) {
      return reply.code(404).send({
        message: "GitHub repository not found"
      });
    }

    throw error;
  }
});


app.post<{
  Params: { owner: string; name: string };
}>("/github/import-files/:owner/:name", async (request, reply) => {
  const { owner, name } = request.params;

  try {
    const result = await importRepositoryFiles(owner, name);

    return reply.code(200).send({
      message: "Source files imported successfully",
      ...result
    });

  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "GitHub repository not found"
    ) {
      return reply.code(404).send({
        message: "GitHub repository not found"
      });
    }

    throw error;
  }
});


}
