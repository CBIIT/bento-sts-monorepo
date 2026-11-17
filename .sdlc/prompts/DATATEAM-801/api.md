# Browse Models API assignment

Use the [shared API role](../roles/api.md) with the [task plan](../../tasks/DATATEAM-801/plan.md). Select the HTTP-interface row and consume its linked API contract and service interface.

## Feature details

- Finalize the proposed additive `/v2/model-cards` request/response contract for the selected slice.
- Expose cards and their filtered counts together, with agreed paging, sorting, nullability, and errors.
- Preserve `/v2/models/`, `/v2/models/count`, and existing detail-route behavior.
- Keep application wiring to the scoped import/registration changes.
- Verify HTTP validation, OpenAPI output, empty-result semantics, and real service integration.

HTTP unit work can use the published service contract before real database integration is ready. Record those checks separately.
