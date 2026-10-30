
import { describe, it, expect, vi, afterEach } from "vitest";
import { githubRequest } from "./utils/github-request.js";
import { getGitHubRepository } from "./github.js";

describe("GitHub API error handling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts a successful GitHub response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("{}", { status: 200 })
    );

    const response = await githubRequest(
      "https://api.github.com/repos/facebook/react"
    );

    expect(response.status).toBe(200);
  });

  it("handles GitHub rate limit errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Rate limited", { status: 429 })
    );

    await expect(
      githubRequest("https://api.github.com/repos/facebook/react")
    ).rejects.toThrow("GitHub API rate limit exceeded");
  });

  it("handles a repository not found", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Not found", { status: 404 })
    );

    await expect(
      getGitHubRepository("facebook", "nonexistent-repo")
    ).rejects.toThrow("GitHub repository not found");
  });
});

