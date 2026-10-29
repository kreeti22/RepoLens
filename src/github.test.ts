
import { describe, it, expect } from "vitest";
import { validateRepository } from "./github.js";

describe("GitHub repository validation", () => {

  it("accepts valid repository details", () => {
    expect(() =>
      validateRepository("kreeti22", "RepoLens")
    ).not.toThrow();
  });

  it("rejects an empty owner", () => {
    expect(() =>
      validateRepository("", "RepoLens")
    ).toThrow("Invalid GitHub repository details");
  });

  it("rejects invalid repository names", () => {
    expect(() =>
      validateRepository("kreeti22", "invalid/repo")
    ).toThrow("Invalid GitHub repository details");
  });

});
