import type { FastifyInstance } from "fastify";

export function registerSearchRoutes(app: FastifyInstance) {
  // Move your existing GET /search route here.



app.get<{
  Querystring: { q?: string };
}>("/search", async (request) => {
  const { q } = request.query;

  return {
    query: q ?? "",
    message: "Search request received"
  };
});
}