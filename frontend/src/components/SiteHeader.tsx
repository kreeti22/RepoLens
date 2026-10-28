
function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">

        <a href="#top" className="site-brand">
          <span aria-hidden="true">⌕</span>
          RepoLens
        </a>

        <div className="site-links">
          <a href="#import">Import</a>
          <a href="#search">Search</a>
        </div>

        <a
          href="https://github.com/kreeti22/RepoLens"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >
          GitHub ↗
        </a>

      </nav>
    </header>
  );
}

export default SiteHeader;
