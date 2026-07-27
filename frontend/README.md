# STS Explorer frontend

Accessible React demo for browsing the models exposed by the FastAPI Simple
Terminology Server.

## Architecture

| Area | Choice | Why |
|---|---|---|
| Language | TypeScript | Keeps API data and UI state explicit |
| UI | React 19 + Vite | Small, fast SPA with a familiar CBIIT ecosystem |
| Design | NCIDS/USWDS-inspired CSS | NCI visual language without pulling a large component bundle into the demo |
| Data | TanStack Query | Handles request state, caching, and dependent queries |
| API types | Local types for the spike | Keeps the demo light; generate them from `/openapi.json` once the API contract settles |
| Tests | Vitest + Testing Library + Playwright | Unit, interaction, browser, and accessibility coverage |
| Deployment | Static UI container plus separate API container | Independent release cadence; only the API needs MDB access |

The original choices were sound. The only deliberate change for this spike is
deferring generated OpenAPI types until the backend contract is stable.

## Local development

Start the FastAPI service on port `8000`, then:

```bash
npm install
npm run dev
```

Vite proxies `/api/*` to `http://localhost:8000/*`, so the frontend calls the
real STS API without requiring development CORS configuration.

Set `VITE_STS_API_BASE_URL` when the API is hosted elsewhere:

```bash
VITE_STS_API_BASE_URL=https://sts-api.example.gov/v2 npm run build
```

The default API root is `/api/v2`.

## Commands

```bash
npm run test
npm run build
npm run test:e2e
```

The production image serves the compiled SPA from nginx. Build-time API
configuration can be passed with:

```bash
docker build \
  --build-arg VITE_STS_API_BASE_URL=https://sts-api.example.gov/v2 \
  -t sts-explorer-ui .
```
