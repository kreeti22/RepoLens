
import type { FastifyInstance } from "fastify";
import { getGitHubRepository } from "../github.js";

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
}
