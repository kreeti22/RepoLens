
import type { FastifyInstance } from "fastify";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../db.js";

interface SearchResult {
  path: string;
  repositoryId: number;
}

export function registerSearchRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { q?: string };
  }>("/search", async (request, reply) => {
    const query = request.query.q?.trim();

    if (!query) {
      return reply.code(400).send({
        message: "Search query is required"
      });
    }

    const results = await prisma.$queryRaw<SearchResult[]>(
      Prisma.sql`
        SELECT "path", "repositoryId"
        FROM "RepoFile"
        WHERE to_tsvector('simple', "content")
          @@ plainto_tsquery('simple', ${query})
        LIMIT 20
      `
    );

    return {
      query,
      totalResults: results.length,
      results
    };
  });
}
