# Isolated Browse Models QA

This stack uses a dedicated Compose project, `mdb-browse-qa`, with no shared data volumes. It does not use the connected MCP databases. The checked-in password is a disposable local-fixture credential, not a deployment secret. Published ports bind only to loopback.

Prerequisites: Docker Compose, the backend development environment, and frontend dependencies. Run from the repository root:

```sh
docker compose -f qa/browse-models/compose.yaml up -d neo4j
# Wait for the neo4j service to report healthy.
backend/.venv/bin/python qa/browse-models/seed.py
```

The seed script verifies the Compose container's ownership label and refuses a database containing non-fixture nodes. It resets only this owned fixture. A has versions 1/2/3, B has versions 1/2; the highest version of each is marked current. Every version contains 2 nodes, 3 properties, and 1 relationship. The script accepts no arbitrary connection URL.

For host development, run the API with explicit local configuration (never rely on a developer's `.env`):

```sh
NEO4J_MDB_URI=bolt://127.0.0.1:27687 NEO4J_MDB_USER=neo4j NEO4J_MDB_PASS=mdb-local-qa-only STS_CACHE_TTL=1 backend/.venv/bin/uvicorn bento_sts.sts:app --host 127.0.0.1 --port 28000
```

Run the frontend's development script in `frontend/`; its `/api` proxy targets port 28000. Host QA uses port 25173. Read-only HTTP checks:

```sh
backend/.venv/bin/python qa/browse-models/http-check.py
```

After the standard browser suite, run the empty-model case as a separate fixture phase:

```sh
backend/.venv/bin/python qa/browse-models/seed.py --include-empty
(cd frontend && QA_EMPTY_MODEL=1 QA_OUTPUT_DIR=qa-results/empty npm run test:e2e -- --grep 'valid empty model detail')
backend/.venv/bin/python qa/browse-models/seed.py
```

This adds a current model C version 1.0.0 with zero entities. The empty-model test uses a separate exact fixture guard; standard A/B expectations remain unchanged. Never run these fixture phases concurrently.

To verify actual browser Next/Previous transitions across the 50-card page boundary, run a separate pagination phase:

```sh
backend/.venv/bin/python qa/browse-models/seed.py --pagination
(cd frontend && QA_PAGINATION=1 QA_OUTPUT_DIR=qa-results/pagination npm run test:e2e -- --grep 'real pagination preserves totals and resets offset when returning to current versions')
backend/.venv/bin/python qa/browse-models/seed.py
```

This fixture contains A versions 1.0.0 through 51.0.0 and B versions 1.0.0 and 2.0.0 (2 models, 53 versions). The first all-version page contains A51 through A2; the second contains A1, B2 and B1. The suite independently checks totals, reload, Previous, and returning to current-only mode.

For separate UI/API containers after building their sources:

```sh
docker compose -f qa/browse-models/compose.yaml up -d --build api ui
```

The container UI is at `http://127.0.0.1:28080`; stop any host API on 28000 before starting the container API. Browser QA uses `frontend/playwright.browse.config.ts`; consult `frontend/README.md` for its verified command. Fixtures must be seeded before tests. Do not reset fixtures while QA is running.

Teardown only this stack when finished:

```sh
docker compose -f qa/browse-models/compose.yaml down -v
```

There is no production deployment or push step. Neo4j container settings follow the [official Docker documentation](https://neo4j.com/docs/operations-manual/current/docker/introduction/) and [environment variable mapping](https://neo4j.com/docs/operations-manual/current/docker/ref-settings/).

## Existing model-list contract

The HTTP checks verify `/v2/models/?include_counts=true` against known fixture
counts, compare its metadata with the unchanged default/false modes, and exercise
legacy routes. Search, current-version selection and UI paging are tested in the
browser because these operations now run over the complete inventory in the UI.

To keep QA separate from a live preview, start the fixture API on 28001 and Vite
with `STS_API_PROXY_TARGET=http://127.0.0.1:28001 npm --prefix frontend run dev -- --port 25174`.
Use `QA_API_URL=http://127.0.0.1:28001` for `http-check.py` and
`QA_BASE_URL=http://127.0.0.1:25174` for browser tests.
