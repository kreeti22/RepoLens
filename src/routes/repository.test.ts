
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { registerRepositoryRoutes } from "./repository.js";

describe("Repository input validation", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
app = Fastify({
  ajv: {
    customOptions: {
      coerceTypes: false,
      removeAdditional: false
    }
  }
});
    registerRepositoryRoutes(app);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it("rejects a missing repository name", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/repositories",
      payload: { owner: "facebook" }
    });

    expect(response.statusCode).toBe(400);
  });

  it("rejects an incorrect data type", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/repositories",
      payload: {
        owner: "facebook",
        name: 123
      }
    });

    expect(response.statusCode).toBe(400);
  });

  it("rejects unexpected properties", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/repositories",
      payload: {
        owner: "facebook",
        name: "react",
        admin: true
      }
    });

    expect(response.statusCode).toBe(400);
  });
});
