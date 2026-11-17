# DATATEAM-801 API contract

Status: approved requirement direction, 2026-11-17; implementation migration NOT STARTED. The user selected extension of existing APIs instead of a separate model-card endpoint. This document supersedes the former `/v2/model-cards` target contract. The running application still uses that endpoint until migration is implemented and verified.

## Approved interface

Extend `GET /v2/models/` with `include_counts: boolean = false`. Keep the existing top-level array and existing model fields. Reuse existing node/detail endpoints. Do not add a new public endpoint for Browse Models.

| Request | Required behavior |
| --- | --- |
| `/v2/models/` | Existing response and behavior unchanged; no `counts` field and no aggregate-query cost |
| `/v2/models/?include_counts=false` | Same behavior as the default request |
| `/v2/models/?include_counts=true` | Existing model records with a required `counts` object on every returned item |
| Existing `skip` and `limit` | Preserve existing validation, ordering and paging semantics in both modes; do not import the model-cards page-size rules |
| `/v2/models/count` | Preserve count of model records, including versions; do not redefine as distinct names |

The default response must not gain `counts: null`, an envelope, or renamed fields. Choose response models/serialization that enforce this and represent both modes accurately in OpenAPI. Do not alter the shared Model schema in a way that changes other endpoints.

Example opt-in item (existing optional fields omitted here only for readability):

```json
{
  "type": "Model",
  "name": "C3DC",
  "version": "4.0.5",
  "is_latest_version": true,
  "counts": { "nodes": 12, "properties": 126, "relationships": 15 }
}
```

These values are illustrative observations, not fixture assertions.

## Backend responsibilities

- Return existing model metadata; the stored `is_latest_version` flag is not rewritten to a computed current flag.
- For opt-in requests, count distinct stored `node`, `property`, and `relationship` entities by exact model name/version. Include unowned properties and relationships missing endpoints, per the approved policy.
- Aggregate labels separately to avoid join multiplication; use a batched read rather than one database query per model. Establish a consistent read/cache boundary for metadata and statistics.
- Zero means a successful query found no entities. Missing/duplicate identities or failed aggregation must not silently become zero.
- Keep default and opt-in cache results separate. Document freshness and measure actual response size and latency; historical inventory size is not a benchmark.

## Frontend responsibilities

Load the complete model/version inventory with `include_counts=true` before applying search, current selection, sorting or UI pagination. The existing unbounded list mode can supply that inventory; if bounded requests are used, prove completeness before displaying global counts or filtering. Never filter only the currently fetched page.

| Concern | Required client behavior |
| --- | --- |
| Identity | Model key = name; version identity = nanoid; do not silently merge inconsistent identities |
| Current selection | Highest ordered marked version, or highest available if none marked; include all model names including TEST |
| Version order | Preserve the approved numeric/opaque total-order policy from the current feature; do not change legacy server sorting |
| Search and filters | Case-insensitive partial model ID/name search intersected with manual selection; clear search restores that selection |
| Result counts | Compute distinct model names and eligible model/version records from the same filtered collection before UI paging |
| Sorting and paging | Default name ascending/version descending within a model; existing supported sort controls; reset offset after filter/search changes |
| Display mapping | Existing name fallback, nullable date, validated repository URL; no invented long names or release dates |
| State | Preserve current/all, search, selected models, sorting and page state through URL/history/detail navigation |
| Query caching | Cache full inventory independently of UI filters; derive cards, counts and pages together; prevent stale requests overwriting newer data |

Centralize these rules in one tested frontend adapter. Generate API types from OpenAPI; keep view models distinct from transport types.

## Errors and compatibility

- Preserve legacy list 404 behavior for an empty catalog or empty requested page, including opt-in list requests. Only the inventory list's documented 404 may be mapped to an empty inventory by the UI; do not reinterpret detail-route or infrastructure errors as empty data.
- Preserve existing paging validation. FastAPI validates the new boolean input; invalid input returns 422.
- Opt-in statistics/data failures return 503 with a generic documented error response; do not expose query details or credentials. Default-mode error behavior remains unchanged.
- A valid client-side filter with no matches renders the normal empty state without changing server semantics.
- Existing detail routes, `/models/count`, and shared reader/version utilities keep their contracts.

## Migration and acceptance

1. Capture default list response, sorting, paging, counts and error baselines.
2. Implement opt-in counts on the existing route and regenerate OpenAPI types.
3. Move current selection/search/filter/sort/count/paging behavior into the frontend adapter; preserve approved UI behavior.
4. Verify real API/MDB integration, default-mode compatibility and browser scenarios, including versions beyond the first page.
5. Audit all consumers of `/v2/model-cards`, including tests, QA scripts and CI. Remove the endpoint/registration and obsolete dedicated code only after consumers are migrated; preserve reusable aggregation logic. If external consumers are found, resolve migration before removal.
6. Update runtime and architecture documentation and capture fresh evidence. Historical passes do not validate this migration.

Required edge cases: multiple/no current flags, opaque versions, shared and unowned properties, missing-endpoint relationships, no matching search, empty inventory, failure/retry, URL reload/history, and late/cancelled responses. No database migration or new metadata source is required.

## MCP evidence and limits

Read-only Cypher queries were executed through `neo4j_remote.execute_query` and `test_qa.execute_query` on 2026-11-17. These tools expose Neo4j data, not deployed HTTP endpoints. The server names do not establish environment identity or database independence. HTTP behavior below was checked against repository source, not a running API or live OpenAPI document.

| Observation | Result | Contract consequence |
| --- | --- | --- |
| Model inventory, both connections | 223 model records, 15 distinct names and handles; 223 distinct `(name, version)` pairs and nanoids | `/models/count` counts versions, not the 15 logical models |
| Identity, both connections | `name = handle` for all 223 records | Use model name as the proposed model key because existing model routes query `name`; current equality is not a permanent schema guarantee |
| Current flags, both connections | 14 records marked current | A flag-only query omits a model |
| Current anomaly, remote | `CRDCSubmission` has only version `0.2.0`, marked false; no model has multiple marked versions | Define fallback explicitly; do not infer missing current means hidden |
| Version anomaly, remote | `CRDC` has version `TBD`, marked true | Version labels are opaque strings; strict semver validation is unsuitable |
| Metadata, remote | All 223 have name, handle, version and nanoid; none have `display_name` or `release_date` | These presentation fields need a separate approved source or explicit fallback/null |
| Repository, both connections | Present on 34 of 223 model records | External destination must be nullable; repository is not necessarily a product landing page |
| Entity representation, remote | 4,518 `node`, 51,241 `property`, 5,788 `relationship` nodes | Count domain relationship nodes, not all Neo4j edges |
| Property ownership, remote | 50,903 node-to-property edges; 62 relationship-to-property edges; 276 properties with no `has_property` owner | Summing node property counts is not a model-wide property count |
| Relationship endpoints, remote | 5,758 relationship nodes have exactly one source and destination; 30 lack an endpoint | Decide whether cards count stored relationships or only valid connected relationships |
| Example, remote | ICDC `2.1.0`: 26 nodes, 231 properties, 40 relationship nodes, scoped by model/version | Supports independent entity aggregation; not a frozen test fixture |

All figures are observations of the connected data, not release assertions or production guarantees. Detailed entity and ownership checks were performed on `neo4j_remote`; only inventory/identity summaries were cross-checked on `test_qa`. MCP queries were separate reads, not one shared snapshot.

### Reproducible read queries

```cypher
MATCH (m:model)
RETURN count(m) AS records,
       count(DISTINCT m.name) AS models,
       count(DISTINCT [m.name, m.version]) AS model_versions,
       count(DISTINCT m.nanoid) AS version_ids,
       count(m.repository) AS repositories;
```

```cypher
MATCH (m:model)
WITH m.name AS name, count(*) AS versions,
     collect(CASE WHEN m.is_latest_version = true THEN m.version END) AS marked
RETURN name, versions, marked ORDER BY name;
```

For card statistics, independently count each label using the same bound `$model` and `$version`. This definition includes stored entities even if ownership/endpoints are missing; this stored-entity definition was subsequently approved by the user.

```cypher
MATCH (n:node {model:$model, version:$version})
RETURN count(DISTINCT n) AS nodes;
// Repeat separately for :property and :relationship.
```

The observed graph uses `(relationship)-[:has_src]->(node)`, `(relationship)-[:has_dst]->(node)`, and both `(node)-[:has_property]->(property)` and `(relationship)-[:has_property]->(property)`. Model scope is carried by entity `model`/`version` properties; the inspected outgoing topology showed no model-to-entity edges. Do not invent a traversal from `model` nodes for aggregation.

## Existing capability and gap

| Existing endpoint or schema | Available behavior | Gap for Browse Models |
| --- | --- | --- |
| `GET /v2/models/` | All model records with skip/limit; sorted by name and ascending version | No card aggregates; current selection, filters and sort will move to the frontend under the revised contract |
| `GET /v2/models/count` | Counts model nodes | Not the distinct-model primary count required by 801 |
| `GET /v2/model/{modelHandle}/versions` | Model versions | Useful for detail navigation, not a complete card response |
| `GET /v2/model/{modelHandle}/latest-version` | Marked latest selection with ordering fallback | Avoid one frontend request per model; validate policy and identity |
| `GET /v2/model/{modelHandle}/version/{versionString}/nodes/count` | Node count for a model/version | No corresponding card-level property/relationship aggregation |
| Node properties and term routes | Node-specific properties and permissible values | Avoid summing blindly across nodes or treating PV lookup as text search |
| `GET /v2/id/{id}` | Resolve a model-version nanoid to its existing entity DTO | Useful for identity lookup, not a card aggregate or a frontend detail route |
| `Model` response schema | name, handle, version, repository, latest flag, nanoid | No explicit display name, release date, or card statistics |

Evidence: [models router](../../../backend/src/bento_sts/routers/models.py), [model router](../../../backend/src/bento_sts/routers/model.py), [DTOs](../../../backend/src/bento_sts/pymodels.py), and [version comparator](../../../backend/src/bento_sts/utility/version_utils.py).
