# Browse Models file scope

Current work: planning documents. Product paths below are candidates to refine after source discovery. Paths are repository-relative.

## Planning files

Maintain the work's spec, API contract, design intake, task selection, role assignments, and verification plan in their existing category folders. Design assets are shared snapshots under `.sdlc/design/<YYYY-MM-DD>/`; this work references `.sdlc/design/2026-11-12/`. Shared execution rules belong in `.sdlc/tasks/workflow.md` and `.sdlc/prompts/roles/`; keep feature-specific details in the work folders.

## Product ownership to resolve

| Role | Candidate surface | Boundary |
| --- | --- | --- |
| Backend service | New catalog service/query helpers and tests under `backend/` | Preserve shipped router and shared version-comparison behavior |
| API | New card schemas/router/tests; minimal registration in `backend/src/bento_sts/sts.py` | Preserve existing response contracts and route registration |
| UI data | Generated types, transport client, catalog hook, hook tests | Exact paths follow frontend source discovery; generated output is not edited manually |
| UI | Browse Models route, cards, controls, styles, component tests | Exact paths follow source/design decisions |
| Foundation/integration | Frontend package/config, type generation, local stack, CI filters | One owner for each shared configuration file |
| E2E QA | Browser tests, fixtures, QA evidence | Dedicated test database; application fixes return to producers |
| Critic | Review results | Product files and tests are read-only |

Before implementing a selected row, list its exact CREATE/MODIFY/READ paths, intended modifications, owner, and focused checks here. Other rows do not need finalized file lists for that row to proceed. Preserve existing unrelated tracked and untracked work.

## Existing sources to read as needed

- `backend/src/bento_sts/sts.py`: route registration.
- `backend/src/bento_sts/routers/models.py` and `model.py`: shipped model behavior.
- `backend/src/bento_sts/pymodels.py`: current response schemas.
- `backend/src/bento_sts/mdb.py`: query/cache boundary.
- `backend/src/bento_sts/utility/version_utils.py`: existing version ordering.
- Relevant files under `backend/tests/`: fixtures and regressions.
- Recovered frontend source and package configuration when available.
