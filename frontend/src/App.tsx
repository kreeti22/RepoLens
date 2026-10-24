import "./App.css";
import { useState } from "react";
import SearchResultCard from "./components/SearchResultCard";
import type { SearchResult } from "./types/search";




interface SearchResponse {
  results: SearchResult[];
}

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [page, setPage] = useState(1);

async function handleSearch(pageToLoad: number = 1) {    const searchTerm = query.trim();
    const selectedOwner = owner.trim();
    const selectedRepo = repoName.trim();

    if (Boolean(selectedOwner) !== Boolean(selectedRepo)) {
  setError("Enter both repository owner and name.");
  return;
}

    if (!searchTerm) {
      setError("Please enter a search keyword.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(false);

    try {
      
const params = new URLSearchParams({
  q: searchTerm,
  page: String(pageToLoad)
});

if (selectedOwner && selectedRepo) {
  params.set("owner", selectedOwner);
  params.set("name", selectedRepo);
}

const response = await fetch(`/search?${params.toString()}`);


      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = (await response.json()) as SearchResponse;

      setResults(data.results);
      setPage(pageToLoad);
      setSearched(true);
    } catch (error) {
      setResults([]);
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>RepoLens</h1>
      <p>Search code across GitHub repositories.</p>

      
  <input
    type="text"
    placeholder="GitHub owner (optional)"
    value={owner}
    onChange={(event) => setOwner(event.target.value)}
  />

  <input
    type="text"
    placeholder="Repository name (optional)"
    value={repoName}
    onChange={(event) => setRepoName(event.target.value)}
  />

      <input
        type="text"
        placeholder="Search source code..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <button onClick={() => handleSearch(1)} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      {error && <p>{error}</p>}

      {searched && results.length === 0 && (
        <p>No matching files found.</p>
      )}

      {results.map((result) => (
  <SearchResultCard
    key={`${result.owner}/${result.name}/${result.path}`}
    result={result}
  />
))}

  
{searched && (page > 1 || results.length === 10) && (
  <div className="pagination">
    <button
      onClick={() => handleSearch(page - 1)}
      disabled={page === 1 || loading}
    >
      Previous
    </button>

    <span>Page {page}</span>

    <button
      onClick={() => handleSearch(page + 1)}
      disabled={results.length < 10 || loading}
    >
      Next
    </button>
  </div>
)}

    </div>
  );
}

export default App;
