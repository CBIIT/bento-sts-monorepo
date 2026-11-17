# Browse Models UI data assignment

Use the [shared UI-data role](../roles/ui-data.md) with the [task plan](../../tasks/DATATEAM-801/plan.md). Select UI data integration and use the plan's contract, source decision, file scope, and verification inputs.

## Feature details

- Generate OpenAPI types and provide the model-card client and TanStack Query hook.
- Include model selection, current/all-version mode, sort, and paging in the query key.
- Keep cards and counts from the same response during filter transitions.
- Cover loading, empty, error/retry, rapid toggles, and stale-response handling.
- Add URL/history behavior only as defined in the feature contract.
- Keep Global Search separate from model filtering until its semantics are decided.

Contract fixtures support hook tests while live API integration is pending.
