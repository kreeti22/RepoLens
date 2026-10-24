
import type { SearchResult } from "../types/search";

interface SearchResultCardProps {
  result: SearchResult;
}

function SearchResultCard({ result }: SearchResultCardProps) {
  return (
    <article className="result-card">
      <h3>{result.path}</h3>

      <p>
        {result.owner}/{result.name}
      </p>

      <pre className="code-snippet">
        {result.snippet}
      </pre>

      <small>Relevance: {result.score.toFixed(3)}</small>
    </article>
  );
}

export default SearchResultCard;
