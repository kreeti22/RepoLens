
import type { FastifyInstance } from "fastify";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../db.js";

interface SearchResult {
  path: string;
  repositoryId: number;
  owner: string;
  name: string;
}

export function registerSearchRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: {
      q?: string;
      owner?: string;
      name?: string;
    };
  }>("/search", async (request, reply) => {
    const query = request.query.q?.trim();
    const owner = request.query.owner?.trim();
    const name = request.query.name?.trim();

    if (!query) {
      return reply.code(400).send({
        message: "Search query is required"
      });
    }

    const hasOwner = request.query.owner !== undefined;
    const hasName = request.query.name !== undefined;

    if (hasOwner !== hasName || (hasOwner && (!owner || !name))) {
      return reply.code(400).send({
        message: "Provide both owner and name"
      });
    }

    const repositoryFilter = owner && name
      ? Prisma.sql`AND r.owner = ${owner} AND r.name = ${name}`
      : Prisma.empty;

    const results = await prisma.$queryRaw<SearchResult[]>(
      Prisma.sql`
        SELECT
          f."path",
          f."repositoryId",
          r."owner",
          r."name"
        FROM "RepoFile" f
        JOIN "Repository" r
          ON f."repositoryId" = r.id
        WHERE to_tsvector('simple', f."content")
          @@ plainto_tsquery('simple', ${query})
        ${repositoryFilter}
        ORDER BY f."path"
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
