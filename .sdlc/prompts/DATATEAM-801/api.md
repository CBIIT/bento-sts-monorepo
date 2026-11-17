# Browse Models api assignment

Use the [shared role](../roles/api.md) with the [task plan](../../tasks/DATATEAM-801/plan.md) and revised [API contract](../../specs/DATATEAM-801/api-contract.md). Follow the requested mode; this requirements update does not start implementation.

Extend existing `/v2/models/` with optional `include_counts` (default false). Preserve default serialization, ordering, paging and errors; opt-in adds counts to each item in the array. Document both modes and 503 aggregate failure in OpenAPI. Do not add a new endpoint. Retire model-cards only after migration verification and consumer audit.

Record actual commands/results and distinguish unit stubs from real DB/HTTP evidence. Existing historical passes are not migration validation.
