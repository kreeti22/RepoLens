
export async function getApiError(
  response: Response
): Promise<string> {
  try {
    const data: unknown = await response.json();

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  } catch {
    // Response might not contain valid JSON.
  }

  return `Request failed: HTTP ${response.status}`;
}
