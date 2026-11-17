# Browse Models file scope

Current work: existing-API implementation migration authorized by the user. Paths are repository-relative.

## Planning files

Maintain the work's spec, API contract, design intake, task selection, role assignments, and verification plan in their existing category folders. Design assets are shared snapshots under `.sdlc/design/<YYYY-MM-DD>/`; this work references `.sdlc/design/2026-11-12/`. Shared execution rules belong in `.sdlc/tasks/workflow.md` and `.sdlc/prompts/roles/`; keep feature-specific details in the work folders.

## Planned migration ownership

The user explicitly requested code changes after the requirement revision. Baseline hashes were captured before edits; the following scope applies to this implementation.

| Role | Planned action and paths | Boundary |
| --- | --- | --- |
| Backend/API | MODIFY `backend/src/bento_sts/routers/models.py`; MODIFY `backend/src/bento_sts/catalog.py` for scoped opt-in response/aggregate helpers | Default list and all existing detail contracts remain compatible; exact new helper paths assigned before creation |
| API | READ `backend/src/bento_sts/pymodels.py`, `mdb.py`, `utility/version_utils.py` | Avoid changing shared Model serialization, cache or legacy comparator behavior |
| UI data | MODIFY `frontend/src/api/client.ts`, `client.test.ts`, `frontend/src/App.tsx`; regenerate `frontend/src/api/openapi.json`, `schema.d.ts` | Client adapter owns complete-inventory derivation; generated files are never hand-patched |
| QA/integration | MODIFY relevant `backend/tests/test_models_counts.py`, model-list compatibility tests, `frontend/e2e/`, `qa/browse-models/http-check.py`, `.github/workflows/frontend.yml` | Migrate old endpoint consumers; dedicated fixtures only; do not seed live MDB |
| Cleanup | Audit `backend/src/bento_sts/routers/model_cards.py`, `catalog.py`, `sts.py` | Remove old route/registration only after verified migration; retain or relocate reusable helpers |
| Documentation | MODIFY applicable `.sdlc` documents and frontend/QA instructions | Clearly separate target contract from current runtime behavior |
| Critic | WRITE review evidence only | No product/test edits during independent review |

Preserve unrelated tracked/untracked work. Baseline evidence: `../../verification/DATATEAM-801/evidence/20261117-existing-api-migration/baseline.json`.
