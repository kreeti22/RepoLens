
import type { FastifyInstance } from "fastify";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../db.js";

interface SearchResult {
  path: string;
  repositoryId: number;
  owner: string;
  name: string;
  snippet: string;
  score: number;
}

export function registerSearchRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: {
      q?: string;
      owner?: string;
      name?: string;
      page?: string;
    };
  }>("/search", async (request, reply) => {
    const query = request.query.q?.trim();
    const owner = request.query.owner?.trim();
    const name = request.query.name?.trim();
    const page = Number(request.query.page ?? "1");
const PAGE_SIZE = 10;

if (!Number.isSafeInteger(page) || page < 1) {
  return reply.code(400).send({
    message: "Page must be a positive integer"
  });
}

const offset = (page - 1) * PAGE_SIZE;

    if (!query) {
      return reply.code(400).send({
        message: "Search query is required"
      });
    }
    const MAX_QUERY_LENGTH = 100;

if (query.length > MAX_QUERY_LENGTH) {
  return reply.code(400).send({
    message: "Search query must be 100 characters or fewer"
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
      r."name",

      ts_headline(
        'simple',
        f."content",
        plainto_tsquery('simple', ${query}),
        'MaxFragments=1, MaxWords=20, MinWords=5, StartSel=[[, StopSel=]]'
      ) AS snippet,

      ts_rank(
        to_tsvector('simple', f."content"),
        plainto_tsquery('simple', ${query})
      ) AS score

    FROM "RepoFile" f

    JOIN "Repository" r
      ON f."repositoryId" = r.id

    WHERE to_tsvector('simple', f."content")
      @@ plainto_tsquery('simple', ${query})

    ${repositoryFilter}

    ORDER BY score DESC, f."path" ASC, f."repositoryId" ASC
LIMIT ${PAGE_SIZE}
OFFSET ${offset}
  `
);



    return {
  query,
  page,
  pageSize: PAGE_SIZE,
  totalResults: results.length,
  results
};
  });
}
