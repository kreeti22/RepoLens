
import { useState } from "react";
import { getApiError } from "../utils/api";

interface ImportResponse {
  repository: string;
  batch: number;
  totalBatches: number;
  totalAvailable: number;
  filesSaved: number;
  filesFailed: number;
}

function RepositoryImport() {
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [batch, setBatch] = useState("1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleImport() {
    const selectedOwner = owner.trim();
    const selectedRepo = repoName.trim();
    const batchNumber = Number(batch);

    if (!selectedOwner || !selectedRepo) {
      setError("Enter both owner and repository name.");
      return;
    }

    if (!Number.isSafeInteger(batchNumber) || batchNumber < 1) {
      setError("Batch must be a positive integer.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const url =
        `/github/import-files/${encodeURIComponent(selectedOwner)}` +
        `/${encodeURIComponent(selectedRepo)}?batch=${batchNumber}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
  throw new Error(await getApiError(response));
}

      const data = (await response.json()) as ImportResponse;

      setMessage(
        `${data.repository}: processed ${data.filesSaved} files ` +
        `in batch ${data.batch} of ${data.totalBatches}. ` +
        `Failed: ${data.filesFailed}.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Import failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="import-section">
      <h2>Import GitHub Repository</h2>

      <input
        placeholder="GitHub owner"
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
      />

      <input
        placeholder="Repository name"
        value={repoName}
        onChange={(e) => setRepoName(e.target.value)}
      />

      <input
        type="number"
        min="1"
        placeholder="Batch"
        value={batch}
        onChange={(e) => setBatch(e.target.value)}
      />

      <button onClick={handleImport} disabled={loading}>
        {loading ? "Importing..." : "Import Files"}
      </button>

      {message && <p>{message}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

export default RepositoryImport;
