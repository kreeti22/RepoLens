
export async function githubRequest(
  url: string
): Promise<Response> {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "RepoLens"
      },
      signal: AbortSignal.timeout(15000)
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "TimeoutError"
    ) {
      throw new Error("GitHub request timed out");
    }

    throw error;
  }

  if (
    response.status === 429 ||
    (response.status === 403 &&
      (response.headers.get("x-ratelimit-remaining") === "0" ||
       response.headers.has("retry-after")))
  ) {
    throw new Error("GitHub API rate limit exceeded");
  }

  return response;
}
