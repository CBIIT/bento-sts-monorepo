# Browse Models service assignment

Use the [shared backend-service role](../roles/backend-service.md) with the [task plan](../../tasks/DATATEAM-801/plan.md). Select the catalog-service row; obtain spec, contract, scope, checks, and output paths from that plan.

## Feature details

- Resolve the identity, latest-version, aggregate, count, and cache decisions relevant to the selected operation.
- Provide current/all-version retrieval, model selection, stable ordering, paging, and filtered model/model-version totals.
- Aggregate model-version node/property/relationship counts without duplicate joins.
- Keep new card sorting separate from shipped endpoint ordering.
- Handle multi-value filter parameters compatibly with the existing MDBReader cache key.
- Verify the A/B version fixtures, ambiguous-current cases, distinct counts, and real Neo4j queries.

Search destinations and UI layout decisions do not block this service slice.
