
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { registerHealthRoutes } from "./health.js";

describe("Health API", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify();
    registerHealthRoutes(app);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns HTTP 200 for GET /health", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health"
    });

    expect(response.statusCode).toBe(200);
  });

  it("returns a JSON response", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health"
    });

    expect(response.headers["content-type"])
      .toContain("application/json");

    expect(response.json()).toBeDefined();
  });

  it("returns HTTP 404 for an unknown route", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/does-not-exist"
    });

    expect(response.statusCode).toBe(404);
  });
});
