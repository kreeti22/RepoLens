
import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export function registerRepositoryRoutes(app: FastifyInstance) {

  app.get<{
    Params: { owner: string; name: string };
  }>("/repositories/:owner/:name", async (request, reply) => {
    const { owner, name } = request.params;

    const repository = await prisma.repository.findUnique({
      where: {
        owner_name: { owner, name }
      }
    });

    if (!repository) {
      return reply.code(404).send({
        message: "Repository not found"
      });
    }

    return repository;
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

      try {
        const repository = await prisma.repository.create({
          data: { name, owner }
        });

        return reply.code(201).send({
          message: "Repository saved",
          repository
        });

      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "P2002"
        ) {
          return reply.code(409).send({
            message: "Repository already exists"
          });
        }

        throw error;
      }
    }
  );

  
app.patch<{
  Params: { owner: string; name: string };
  Body: { name: string };
}>("/repositories/:owner/:name", {
  schema: {
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", minLength: 1 }
      },
      additionalProperties: false
    }
  }
}, async (request, reply) => {
  const { owner, name } = request.params;

  const existing = await prisma.repository.findUnique({
    where: { owner_name: { owner, name } }
  });

  if (!existing) {
    return reply.code(404).send({
      message: "Repository not found"
    });
  }

  const updated = await prisma.repository.update({
    where: { id: existing.id },
    data: { name: request.body.name }
  });

  return updated;
});


app.delete<{
  Params: { owner: string; name: string };
}>("/repositories/:owner/:name", async (request, reply) => {
  const { owner, name } = request.params;

  const existing = await prisma.repository.findUnique({
    where: {
      owner_name: { owner, name }
    }
  });

  if (!existing) {
    return reply.code(404).send({
      message: "Repository not found"
    });
  }

  await prisma.repository.delete({
    where: { id: existing.id }
  });

  return reply.code(200).send({
    message: "Repository deleted successfully"
  });
});


}
