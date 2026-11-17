# Browse Models backend-service assignment

Use the [shared role](../roles/backend-service.md) with the [task plan](../../tasks/DATATEAM-801/plan.md) and revised [API contract](../../specs/DATATEAM-801/api-contract.md). Follow the requested mode; this requirements update does not start implementation.

Implement batched model/version entity counts for opt-in `/v2/models/`. Count stored nodes/properties/relationship entities independently, including unowned/missing-endpoint records. Preserve legacy default queries, ordering and shared utilities. Avoid N+1 queries and document cache consistency. Current selection, filters, UI sorting and totals move to the frontend.

Record actual commands/results and distinguish unit stubs from real DB/HTTP evidence. Existing historical passes are not migration validation.
