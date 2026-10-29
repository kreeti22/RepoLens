
import { useRef, useState } from "react";
import { getApiError } from "../utils/api";

interface ImportResponse {
  repository: string;
  batch: number;
  totalBatches: number;
  totalAvailable: number;
  filesSaved: number;
  filesFailed?: number;
}

function RepositoryImport() {
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [failedBatch, setFailedBatch] = useState<number | null>(null);
const importInProgress = useRef(false);


 async function importBatch(batch: number) {
  if (importInProgress.current) return;
    const selectedOwner = owner.trim();
    const selectedRepo = repoName.trim();

    if (!selectedOwner || !selectedRepo) {
      setError("Enter both owner and repository name.");
      return;
    }

    if (!Number.isSafeInteger(batch) || batch < 1) {
      setError("Invalid batch number.");
      return;
    }

    importInProgress.current = true;
    setLoading(true);
    setError("");
    setFailedBatch(null);

    try {
      const url =
        `/github/import-files/${encodeURIComponent(selectedOwner)}` +
        `/${encodeURIComponent(selectedRepo)}?batch=${batch}`;

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
      setResult(data);
      setFailedBatch(null);
    } catch (err) {
        setFailedBatch(batch);
      setError(
        err instanceof Error ? err.message : "Import failed"
      );
    } finally {
  importInProgress.current = false;
  setLoading(false);
}
  }

  const hasNextBatch =
    result !== null &&
    result.batch < result.totalBatches;

    const isRateLimited =
    error.toLowerCase().includes("rate limit");

  return (
    <div className="import-section">
      <h2>Import GitHub Repository</h2>

      <input
        aria-label="GitHub owner to import"
        placeholder="GitHub owner"
        value={owner}
        onChange={(e) => {
          setOwner(e.target.value);
          setResult(null);
        }}
        disabled={loading}
      />

      <input
        aria-label="Repository name to import"
        placeholder="Repository name"
        value={repoName}
        onChange={(e) => {
          setRepoName(e.target.value);
          setResult(null);
        }}
        disabled={loading}
      />

      <button
        onClick={() => void importBatch(1)}
        disabled={loading}
      >
        {loading ? "Importing..." : "Start Import"}
      </button>

      {result && (
        <div className="import-progress">
          <h3>{result.repository}</h3>

          <p>
            Last successful batch: {result.batch} of{" "}
            {result.totalBatches}
          </p>

          <progress
            value={result.batch}
            max={Math.max(1, result.totalBatches)}
          />

          <p>Available files: {result.totalAvailable}</p>

          <p>Files saved in this batch: {result.filesSaved}</p>

          <p>Failed files reported: {result.filesFailed ?? 0}</p>

          {!failedBatch && hasNextBatch && (
            <button
              disabled={loading}
              onClick={() => void importBatch(result.batch + 1)}
            >
              Import Next Batch
            </button>
          )}

          {!failedBatch && !hasNextBatch && (
            <p>All available batches have been processed.</p>
          )}
        </div>
      )}

      {error && (
        <div className="import-error" role="alert">
          <p>{error}</p>

          {isRateLimited && (
            <p>
              GitHub's API limit has been reached.
              Retry after the limit resets.
            </p>
          )}

          {failedBatch !== null && (
            <>
              <p>
                Batch {failedBatch} did not complete successfully.
                Earlier successful progress is preserved.
              </p>

              <button
                disabled={loading}
                onClick={() => void importBatch(failedBatch)}
              >
                {loading
                  ? "Retrying..."
                  : `Retry Batch ${failedBatch}`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default RepositoryImport;
