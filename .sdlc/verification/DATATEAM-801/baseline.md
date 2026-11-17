# Browse Models baseline

Source inspection: 2026-11-17.

## Repository

- Branch: `development-2.6.0`.
- Inspected HEAD: `d482101fd93d166523ae76e7c1c6a3a7165cd3d9`.
- Backend: FastAPI STS 2.6.0, Neo4j, `/v2` routes, pytest.
- Frontend: only `frontend/README.md` tracked at inspection; source/package configuration needs recovery or initialization.
- Pre-existing untracked work includes frontend build/dependency files, security tooling, IDE files, and backend local files. Preserve it when establishing an implementation baseline.

## Relevant findings

| Area | Observation |
| --- | --- |
| Model count | `/models/count` counts model nodes, not distinct model identities |
| Ordering | Existing same-name version ordering is ascending |
| Test selection | pytest defaults to `-s -k local`; local/cicd fixture variants need explicit coverage selection |
| Design | MDB Design 11/12/2026, section 200:5008; 41 individual SVGs saved; inventory, XML, and external references checked |

## Checks

| Check | Result |
| --- | --- |
| Source inventory and route/schema inspection | Completed |
| Backend tests and live Neo4j audit | Not run |
| Frontend typecheck/lint/tests/build | Awaiting reproducible frontend source |
| Local E2E and accessibility checks | Not run |

Refresh the relevant baseline checks before implementation and record the commands and results for the selected task.
