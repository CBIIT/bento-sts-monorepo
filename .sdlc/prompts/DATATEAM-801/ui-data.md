# Browse Models ui-data assignment

Use the [shared role](../roles/ui-data.md) with the [task plan](../../tasks/DATATEAM-801/plan.md) and revised [API contract](../../specs/DATATEAM-801/api-contract.md). Follow the requested mode; this requirements update does not start implementation.

Consume `/v2/models/?include_counts=true` using regenerated types. Fetch the complete inventory and centralize current selection, search/manual filters, stable sorting, result totals and UI paging in a tested adapter. Preserve URL/history/detail state and name/date fallbacks. Keep inventory query caching separate from view state. Do not compute global results from a partial page.

Record actual commands/results and distinguish unit stubs from real DB/HTTP evidence. Existing historical passes are not migration validation.
