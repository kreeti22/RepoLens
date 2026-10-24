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

  async function handleSearch() {
    const searchTerm = query.trim();

    if (!searchTerm) {
      setError("Please enter a search keyword.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(false);

    try {
      const response = await fetch(
        `/search?q=${encodeURIComponent(searchTerm)}`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = (await response.json()) as SearchResponse;

      setResults(data.results);
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
        placeholder="Search source code..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <button onClick={handleSearch} disabled={loading}>
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
    </div>
  );
}

export default App;
