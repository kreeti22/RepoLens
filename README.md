# RepoLens

**Search source code across imported GitHub repositories.**

RepoLens is a full-stack code-search application that imports source files from public GitHub repositories and makes their contents searchable locally. It combines a React interface with a Fastify API, PostgreSQL full-text search, and Prisma for data persistence.

Instead of searching a repository one file at a time, users can import its eligible source files, search across the imported data, optionally filter by repository, and inspect ranked code snippets.

> **Project status:** Working local-first application. Docker, automated CI, and public deployment are planned improvements, not prerequisites for running RepoLens today.

## Screenshots

### Home

![RepoLens homepage](docs/screenshots/homepage.png)

### GitHub repository import

![Completed repository import with batch progress](docs/screenshots/repository-import.png)

### Code search

![Code search with relevant file paths, snippets, and scores](docs/screenshots/code-search.png)

> The image paths above assume these three filenames. If your screenshot files have different names, update the Markdown paths to match them exactly.

## Features

- **GitHub repository import:** Supply a repository owner and name to retrieve repository metadata, file paths, and eligible file contents from the GitHub REST API.
- **Batched file processing:** Import up to 10 selected files per batch and display batch progress, saved-file counts, and failed-file counts.
- **Local persistence:** Store imported repositories and file contents in PostgreSQL using Prisma. Repository records and file paths have uniqueness constraints to avoid duplicate records.
- **Full-text code search:** Search imported file contents using PostgreSQL's `to_tsvector` and `plainto_tsquery`.
- **Relevance-ranked results:** Use `ts_rank` for ordering and `ts_headline` to generate contextual snippets.
- **Repository filters:** Search all imported repositories or narrow the results to one GitHub `owner/name` pair.
- **Paginated results:** Browse search results in pages of up to 10 matches.
- **Resilient request handling:** Handle invalid inputs, missing repositories, GitHub rate limits, timeouts, and stale frontend search requests.
- **Responsive interface:** Dark, glass-style panels over an interactive ShapeWaves-inspired background.
- **Automated tests:** Vitest tests cover validation, mocked GitHub responses, Fastify route behavior, and database reads.

## Tech stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | React, TypeScript, Vite | UI, search, imports, and development tooling |
| Backend | Node.js, TypeScript, Fastify | HTTP API and request handling |
| Database | PostgreSQL | Persist repositories and source files; execute full-text queries |
| ORM | Prisma with PostgreSQL adapter | Database models, migrations, and queries |
| External API | GitHub REST API | Read public repository metadata, Git trees, and file blobs |
| Testing | Vitest, Fastify `inject()` | Unit and integration testing |
| Styling | CSS, ShapeWaves/vGPU | Animated, responsive interface |

## Architecture

```text
                     GitHub REST API
                           |
             repository metadata, trees, blobs
                           |
                           v
React + Vite UI  <---->  Fastify API  <---->  PostgreSQL
   (frontend/)           (src/)          (Prisma)
        |                   |
        |                   +-- GitHub import and batching
        |                   +-- Input and error handling
        |                   +-- Full-text SQL search
        |
        +-- Import progress, search filters,
            ranked snippets, and pagination
```

**Import flow:** The user enters a public GitHub repository's owner and name. The backend obtains the repository's default branch and file tree, filters candidate files, fetches contents in batches, and upserts repository/file records into PostgreSQL.

**Search flow:** The frontend calls `GET /search`; the backend runs a parameterized PostgreSQL full-text query, optionally restricts it to a repository, and returns ranked file paths, snippets, and scores.

The Vite development server proxies `/github` and `/search` requests to the Fastify backend.

## Getting started locally

### Requirements

- Node.js and npm (a current Node.js version compatible with the installed Vite and Prisma dependencies)
- PostgreSQL running locally
- Git
- Internet access for importing public repositories from GitHub

The commands below use **PowerShell on Windows**, matching the project's development environment. On macOS/Linux, use `npm` and `npx` instead of `npm.cmd` and `npx.cmd`.

### 1. Clone the repository

```powershell
git clone https://github.com/kreeti22/RepoLens.git
cd RepoLens
```

### 2. Install backend dependencies

```powershell
npm.cmd ci
```

### 3. Configure PostgreSQL and environment variables

Create a PostgreSQL database and ensure your database user has access to it. For example, in a PostgreSQL SQL session:

```sql
CREATE DATABASE repolens;
```

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Edit the **root** `.env` file to contain values for both variables:

```dotenv
PORT=3001
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/repolens?schema=public"
```

Replace the placeholders with your local PostgreSQL credentials. URL-encode reserved characters in passwords when necessary. Keep `.env` private and **never commit credentials**.

**Why port 3001?** The frontend's current `vite.config.ts` forwards `/search` and `/github` to `http://localhost:3001`. The committed `.env.example` currently contains `PORT=3000`, so override it with `3001` locally until the example is updated.

### 4. Apply Prisma migrations and generate the client

The repository currently stores its Prisma configuration in `prisma7.config.ts`. Pass its path explicitly:

```powershell
npx.cmd prisma migrate deploy --config ./prisma7.config.ts
npx.cmd prisma generate --config ./prisma7.config.ts
```

These commands use the `DATABASE_URL` from the root environment configuration. They require the PostgreSQL database to be running.

### 5. Start the backend

In terminal 1, from the RepoLens root:

```powershell
npm.cmd run dev
```

The backend should be available at `http://localhost:3001`. Check the health endpoint:

```powershell
Invoke-RestMethod http://localhost:3001/health
```

### 6. Start the frontend

In terminal 2:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Open the URL Vite prints in the terminal (typically `http://localhost:5173`). Leave both terminal processes running while you use the app.

## How to use RepoLens

1. **Import a repository:** Enter its GitHub owner and name in the import panel and start the import.
2. **Review import progress:** Watch completed batches, processed files, and any reported failures. Imports are limited to eligible files; they do not necessarily include every file on GitHub.
3. **Search imported code:** Enter a keyword in the search panel. Leave the owner/repository fields blank to search all imported repositories, or fill in both to target one repository.
4. **Explore results:** Read matching file paths, contextual snippets, and relevance scores; use pagination to see more results.

> **Important:** RepoLens searches content already imported into **your local database**, not GitHub's entire global code index. Search results depend on which repositories and files you have imported.

## API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Backend health check |
| `GET` | `/github/repositories/:owner/:name` | Fetch public GitHub repository metadata |
| `POST` | `/github/import/:owner/:name` | Create or locate an imported repository record |
| `POST` | `/github/import-files/:owner/:name?batch=1` | Import one batch of eligible source files |
| `GET` | `/search?q=term&page=1` | Search imported source files |
| `GET` | `/search?q=term&owner=user&name=repo&page=1` | Search a specific imported repository |
| `GET` | `/repositories/:owner/:name` | Read a locally stored repository record |
| `POST` | `/repositories` | Create a repository record |
| `PATCH` | `/repositories/:owner/:name` | Rename a stored repository record |
| `DELETE` | `/repositories/:owner/:name` | Delete a stored repository record |

**Sample search request:**

```powershell
Invoke-RestMethod "http://localhost:3001/search?q=prisma&page=1"
```

The search API returns the query, current page, page size, and an array of matching results containing repository information, file paths, snippets, and relevance scores.

## Testing and verification

From the **project root**:

```powershell
npm.cmd test
npm.cmd test -- --coverage
npm.cmd run build
```

To check the frontend build and lint rules:

```powershell
cd frontend
npm.cmd run build
npm.cmd run lint
```

Test coverage includes repository validation, simulated GitHub API errors, Fastify route responses, and read-only Prisma integration checks.

**Database-test note:** Some existing tests expect imported repository/file records in the local database. Run them against a populated development database; a future improvement is to create isolated, seeded test fixtures for completely reproducible tests.

## Project structure

```text
RepoLens/
├── docs/screenshots/          # README images
├── frontend/
│   ├── src/components/        # UI, import panel, results, animation
│   ├── src/App.tsx             # Search UI and client-side state
│   └── vite.config.ts         # Vite development proxy
├── prisma/
│   ├── schema.prisma          # Repository and RepoFile models
│   └── migrations/            # Database migrations
├── src/
│   ├── routes/                # Health, repository, GitHub, search routes
│   ├── utils/github-request.ts
│   ├── github.ts              # GitHub API helpers
│   ├── import-files.ts        # Batch file importer
│   ├── file-filter.ts         # Eligible file filtering
│   ├── db.ts                  # Prisma PostgreSQL adapter
│   └── index.ts               # Fastify entry point
├── .env.example
├── prisma7.config.ts
├── vitest.config.ts
└── package.json
```

## Engineering decisions

- **PostgreSQL full-text search instead of a custom search engine:** Uses established SQL search primitives to keep the system approachable and integrate search with stored repository data.
- **Batching GitHub blob requests:** Reduces the size of individual import operations and gives the UI observable progress.
- **Upserts and uniqueness constraints:** Support re-importing files without creating duplicate repository/path records.
- **Parameterized database queries:** Prisma SQL template tags separate user-provided values from SQL structure in search operations.
- **Request validation and timeout handling:** Rejects malformed search parameters and handles external API failures explicitly.
- **Abortable search requests:** Prevents stale frontend responses from replacing newer search results.

## Known limitations and future improvements

- Imports currently read **public** GitHub repositories without user authentication; GitHub API rate limits apply.
- The app currently indexes a selected subset of repository files rather than every file or every historical revision.
- Search is based on PostgreSQL full-text ranking; advanced syntax/AST-aware search and version history are **not implemented**.
- Development setup requires separately running PostgreSQL, the Fastify backend, and the Vite frontend.
- Reproducible database test fixtures, Docker-based startup, GitHub Actions CI, and optional deployment remain on the roadmap.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Frontend cannot reach API | Backend is running on port `3001`; Vite proxy matches that port |
| Prisma connection error | PostgreSQL is running, `DATABASE_URL` is valid, and migrations have been applied |
| Generated Prisma client missing | Run the Prisma `generate` command with the configuration file shown above |
| GitHub import fails or stops | GitHub API connectivity, rate limits, unsupported files, and failed-file reporting |
| No search matches | Import a repository first and search for terms present in stored source files |
| Database tests fail on an empty DB | Current integration tests expect existing imported records |

## License and author

Developed by [kreeti22](https://github.com/kreeti22). The root `package.json` currently declares the **ISC** license. Add a matching `LICENSE` file if you intend to make that licensing explicit for contributors and reuse.

---

**RepoLens — import repositories, explore code, and search with context.**
