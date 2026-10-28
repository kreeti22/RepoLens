
import type { SearchResult } from "../types/search";

interface SearchResultCardProps {
  result: SearchResult;
}

function SearchResultCard({ result }: SearchResultCardProps) {
  return (
    <article className="result-card">
      <div className="result-header">
        <div className="result-info">
          <h3 className="result-file">
            <span aria-hidden="true">▤</span>
            {result.path}
          </h3>

          <p className="result-repository">
            {result.owner} / {result.name}
          </p>
        </div>

        <span className="result-score">
          Relevance {result.score.toFixed(3)}
        </span>
      </div>

      <div className="result-code">
        <pre>
          <code>{result.snippet}</code>
        </pre>
      </div>
    </article>
  );
}

export default SearchResultCard;
