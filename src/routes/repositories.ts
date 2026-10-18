import type { FastifyInstance } from "fastify";

export function registerRepositoryRoutes(app: FastifyInstance) {
  // Move your existing GET /repositories/:owner/:name route here.

  // Move your existing POST /repositories route here.


app.get<{
  Params: { owner: string; name: string };
}>("/repositories/:owner/:name", async (request) => {
  const { owner, name } = request.params;

  return {
    owner,
    name,
    message: `Repository ${name} belongs to ${owner}`
  };
});

app.post<{ Body: { name: string; owner: string } }>(
  "/repositories",
  {
    schema: {
      body: {
        type: "object",
        required: ["name", "owner"],
        properties: {
          name: { type: "string", minLength: 1 },
          owner: { type: "string", minLength: 1 }
        },
        additionalProperties: false
      }
    }
  },
  async (request, reply) => {
    const { name, owner } = request.body;

    return reply.code(201).send({
      message: "Repository received",
      repository: { name, owner }
    });
  }
);
}