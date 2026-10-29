import "./App.css";
import { useRef, useState } from "react";
import SearchResultCard from "./components/SearchResultCard";
import type { SearchResult } from "./types/search";
import RepositoryImport from "./components/RepositoryImport";
import ShapeWaves from "./components/ShapeWaves";
import SiteHeader from "./components/SiteHeader";
import { getApiError } from "./utils/api";

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
  const searchController = useRef<AbortController | null>(null);

  function resetSearch() {
  searchController.current?.abort();
  searchController.current = null;

  setResults([]);
  setPage(1);
  setSearched(false);
  setError("");
  setLoading(false);
}

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

    searchController.current?.abort();

const controller = new AbortController();
searchController.current = controller;
    setLoading(true);
setError("");
setSearched(false);

if (pageToLoad === 1) {
  setResults([]);
}

    try {
      
const params = new URLSearchParams({
  q: searchTerm,
  page: String(pageToLoad)
});

if (selectedOwner && selectedRepo) {
  params.set("owner", selectedOwner);
  params.set("name", selectedRepo);
}

const response = await fetch(
  `/search?${params.toString()}`,
  { signal: controller.signal }
);

      if (!response.ok) {
  throw new Error(await getApiError(response));
}
      const data = (await response.json()) as SearchResponse;

if (controller.signal.aborted) {
  return;
}

if (pageToLoad > 1 && data.results.length === 0) {
  setError("No more results available.");
  setSearched(true);
  return;
}

setResults(data.results);
setPage(pageToLoad);
setSearched(true);
    
} catch (error) {
  if (controller.signal.aborted) {
    return;
  }

  setResults([]);
  setError(
    error instanceof Error
      ? error.message
      : "Something went wrong"
  );
} finally {
  if (searchController.current === controller) {
    searchController.current = null;
    setLoading(false);
  }
}
}

  return (
    <div>
      <SiteHeader />

      <section id="top" className="hero-section">
  <h1 className="visually-hidden">RepoLens</h1>

  <p>Search code across GitHub repositories.</p>

  <a href="#import" className="explore-link">
    Explore repositories ↓
  </a>
</section>

<section id="import" className="page-section glass-panel">
  <RepositoryImport />
</section>

    <div className="animated-background">
  <ShapeWaves
    text="RepoLens"
    color="#598071"
    hoverColor="#114e41"
    backgroundColor="#02332b"
    shapes="mixed"
    interactive={true}
    glow={0.35}
  />
</div>

  <section id="search" className="page-section glass-panel">
  <h2>Search source code</h2>
  <div className="search-controls">

      
  <input
    aria-label="GitHub owner"
    type="text"
    placeholder="GitHub owner (optional)"
    value={owner}
onChange={(event) => {
  setOwner(event.target.value);
  resetSearch();
}}  />

  <input
    aria-label="Repository name"
    type="text"
    placeholder="Repository name (optional)"
    value={repoName}
onChange={(event) => {
  setRepoName(event.target.value);
  resetSearch();
}}  />

      <input
        aria-label="Search source code"
        type="text"
        placeholder="Search source code..."
        value={query}
onChange={(event) => {
  setQuery(event.target.value);
  resetSearch();
}}      />

      

<button onClick={() => void handleSearch(1)}>
          {loading ? "Searching..." : "Search"}
      </button>
      </div>

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
    </section>


    </div>
  );
}

export default App;
