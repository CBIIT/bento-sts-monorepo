# MDB frontend

React/TypeScript SPA for Browse Models, backed by the existing FastAPI STS API. The visual reference is the dated [MDB design snapshot](../.sdlc/design/2026-11-12/design.md), particularly `model-browser-dark-mode.svg`. Styles use the official USWDS CSS package and a scoped dark MDB theme. USWDS fonts/assets are bundled locally; no CDN is required.

## Local development

The normal preview uses the actual MDB connection in the existing private `backend/.env`. Keep URL/user/password on the backend only. Start its API from the repository root:

```sh
env -u NEO4J_MDB_URI -u NEO4J_MDB_USER -u NEO4J_MDB_PASS STS_CACHE_TTL=60 backend/.venv/bin/uvicorn bento_sts.sts:app --env-file backend/.env --host 127.0.0.1 --port 28000
```

Do not commit the `.env` file. The isolated fixture stack in `qa/browse-models/` is for QA only, not the normal MDB preview. Stop the live API before switching port 28000 to the explicit fixture configuration; never seed the live MDB.

Use Node 22.12+ (or a supported newer even-numbered release) and npm from `frontend/`:

```sh
npm ci
npm run generate:api
npm run dev
```

`generate:api` uses `../backend/.venv/bin/python` by default; install the backend package/dependencies first. Set `STS_PYTHON` to select another interpreter. Generation imports FastAPI OpenAPI with dummy connection settings; it does not query a database. Alternatively supply a local schema file with `npm run generate:api -- /absolute/path/openapi.json`. Both routes canonicalize the JSON and regenerate `src/api/schema.d.ts`; do not edit generated files manually.

Development serves `http://127.0.0.1:25173`. Requests to `/api/*` proxy to `http://127.0.0.1:28000/*`. Override that target with `STS_API_PROXY_TARGET` when starting Vite. Database credentials belong only in the API environment.

The explicitly selected `vite.config.ts` and `playwright.browse.config.ts` avoid pre-existing generated configuration files. Builds write to `build/`, preserving the pre-existing untracked `dist/` directory.

## Checks

```sh
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

The E2E command requires the dedicated local UI/API/Neo4j fixture stack and installed Playwright Chromium. See the repository's local stack instructions before running it. Mocked component tests do not replace that integration run.

## Behavior

- Default current-model cards; optional older versions, model inclusion/exclusion, name/version sorting and pagination.
- Header totals and cards are derived from the complete `/v2/models/?include_counts=true` array. The frontend caches this inventory independently of search/filter/sort/page state for 60 seconds.
- Filter search finds model names to select; it is not a global data search.
- Hash URL preserves model filters, version toggle, sort, pagination, and model/version detail navigation across reload/history.
- Detail view first resolves model/version existence through the complete model inventory, then queries the existing model/version nodes endpoint. Existing zero-node versions, missing versions, and request failures have distinct states.
- Search Terms, Compare Models and Global Search are labeled coming soon, as approved for this delivery.
- Release-date sort is omitted until the API has an approved date source. Model display names fall back to the model name supplied by the API.
- Loading, empty, error/retry, responsive layout, accessible labels and keyboard focus are explicit.

## Container

Build with context `frontend/`. The image serves assets on port 8080 and proxies `/api/` to the `api:8000` container. The UI image contains no database credentials. `nginx.conf` uses SPA fallback for application routes.

## Design-system source

The public [USWDS developer documentation](https://designsystem.digital.gov/documentation/developers/) describes the installed distribution. [NCIDS developer guidance](https://designsystem.cancer.gov/get-started/developers) requires authenticated GitHub package access for its npm distribution; this implementation uses the confirmed USWDS option and preserves the MDB Figma styling. It does not claim full NCIDS branding or Section 508 certification.

## Scoped design QA

The E2E suite includes `e2e/design-review.spec.ts`, which captures Browse Models at desktop/tablet/mobile widths with its original Figma SVG attached, checks overflow, and exercises the existing detail destination. Passing this test confirms evidence capture, not design approval. QA compares the applicable layout, typography, colors, spacing, and controls separately. Relationship graphs, PDF export, and other entity-detail features are outside this ticket; Figma alone must not expand implementation scope. See the [verification plan](../.sdlc/tasks/DATATEAM-801/verification-plan.md).
