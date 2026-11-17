# DATATEAM-801 API contract proposal

Status: proposed; re-investigated through MCP on 2026-11-17. Resolve the [spec decisions](spec.md#open-decisions) affecting each operation before freezing its interface. Existing FastAPI OpenAPI remains the authority for shipped endpoints.

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

For card statistics, independently count each label using the same bound `$model` and `$version`. This definition includes stored entities even if ownership/endpoints are missing; it remains a D-04 proposal, not a product-approved choice.

```cypher
MATCH (n:node {model:$model, version:$version})
RETURN count(DISTINCT n) AS nodes;
// Repeat separately for :property and :relationship.
```

The observed graph uses `(relationship)-[:has_src]->(node)`, `(relationship)-[:has_dst]->(node)`, and both `(node)-[:has_property]->(property)` and `(relationship)-[:has_property]->(property)`. Model scope is carried by entity `model`/`version` properties; the inspected outgoing topology showed no model-to-entity edges. Do not invent a traversal from `model` nodes for aggregation.

## Existing capability and gap

| Existing endpoint or schema | Available behavior | Gap for Browse Models |
| --- | --- | --- |
| `GET /v2/models/` | All model records with skip/limit; sorted by name and ascending version | No current-only mode, selected-model filters, card aggregates, or release-date sort |
| `GET /v2/models/count` | Counts model nodes | Not the distinct-model primary count required by 801 |
| `GET /v2/model/{modelHandle}/versions` | Model versions | Useful for detail navigation, not a complete card response |
| `GET /v2/model/{modelHandle}/latest-version` | Marked latest selection with ordering fallback | Avoid one frontend request per model; validate policy and identity |
| `GET /v2/model/{modelHandle}/version/{versionString}/nodes/count` | Node count for a model/version | No corresponding card-level property/relationship aggregation |
| Node properties and term routes | Node-specific properties and permissible values | Avoid summing blindly across nodes or treating PV lookup as text search |
| `GET /v2/id/{id}` | Resolve a model-version nanoid to its existing entity DTO | Useful for identity lookup, not a card aggregate or a frontend detail route |
| `Model` response schema | name, handle, version, repository, latest flag, nanoid | No explicit display name, release date, or card statistics |

Evidence: [models router](../../../backend/src/bento_sts/routers/models.py), [model router](../../../backend/src/bento_sts/routers/model.py), [DTOs](../../../backend/src/bento_sts/pymodels.py), and [version comparator](../../../backend/src/bento_sts/utility/version_utils.py).

## Proposed additive interface

`GET /v2/model-cards`

| Input | Proposed meaning |
| --- | --- |
| `include_all_versions` | Boolean, default false |
| Repeated `model` | Proposed model-name keys, matching existing route lookup; omitted means all. Deduplicate values. Define an explicit select-none representation before implementation; an omitted list cannot represent both all and none. |
| `sort` | Initially `short_name` or `version`. `release_date` remains blocked on an approved metadata source; do not advertise an always-null sort as implemented. |
| `direction` | `asc` or `desc`; default name ascending, with version descending as the within-model default |
| `skip`, `limit` | Nonnegative offset and a bounded positive page size; defaults/cap await D-09 |

No free-text `q` parameter is included until D-05 distinguishes model filtering from Global Search. Define deterministic secondary keys, null-date placement, and cross-model version sorting before freezing the contract.

### Response fields

| Field | Proposed semantics |
| --- | --- |
| `items[].model_id` | Proposed `model.name`, shared by all versions; document rename policy before declaring it immutable |
| `items[].version_id` | `model.nanoid`; populated and unique across the 223 inspected model records. Stability across reloads and global entity uniqueness were not verified |
| `items[].short_name`, `items[].display_name` | `short_name = model.name`; proposed `display_name` fallback to that same name until an approved long-name source exists |
| `items[].version`, `items[].is_current` | Version label and result of the agreed current-selection policy |
| `items[].release_date` | ISO date or null; currently no source field exists on model records. Do not substitute `_commit`, ingestion time, or design date |
| `items[].external_url` | Proposed `model.repository` or null, explicitly labeled as repository; validate URL scheme and destination policy |
| `items[].counts.nodes` | Distinct model-version node count |
| `items[].counts.properties` | Proposed distinct `property` nodes matching model/version, including relationship-owned and unowned properties; D-04 must approve this definition |
| `items[].counts.relationships` | Proposed distinct `relationship` nodes matching model/version, including missing-endpoint records; D-04 must approve stored versus connected semantics |
| `counts.models` | Distinct matching model identities, before paging |
| `counts.model_versions` | Distinct matching model/version identities, before paging |
| `page.skip`, `page.limit`, `page.total` | Applied page parameters; total is matching cards, equal to model_versions for this result |

These names and nullability rules are proposals. Unknown source data must not silently become zero. Before implementation, determine whether unavailable card statistics are a data-quality error or explicitly nullable with an agreed UI representation.

## Current selection and version ordering

Proposed policy: group by model name; use the highest ordered marked version when marks exist; otherwise select the highest ordered available version. This mirrors the intent of the existing latest-version route and includes the single unmarked `CRDCSubmission` record. `is_current` means the result of this policy, not a copy of the stored boolean.

The shipped comparator attempts semver, then extracts a numeric base. It has no safe general ordering for values such as `TBD` when a comparison is required. Do not claim that it handles arbitrary version strings. Before implementation, define a total order for numeric, suffix, nonnumeric, and missing labels, with deterministic name/version/nanoid tie-breakers. Preserve existing route behavior while implementing and testing the new operation's policy. Missing or duplicate identities must surface as data-quality failures rather than be silently merged.

`TEST` is present among model names. Visibility/exclusion of test or internal models is a product policy, not something to infer from the server name or silently hard-code. The observed count of 15 is the unfiltered inventory.

## Processing rules to finalize

1. Resolve selected model identities and the current-version policy.
2. Form the eligible model/version set; do not select the current version from an already paged subset.
3. Apply agreed filters and derive both counts from that same eligible set.
4. Sort with stable keys, page results, and aggregate statistics without join multiplication.
5. Return cards and counts from a consistent read. Document the transaction/cache approach; separate independently cached reads must not create incompatible totals.

The current cache key is `(query, tuple(sorted(params.items())), raise_on_empty)`. A list-valued filter parameter makes this key unhashable. Implementation must canonicalize cache keys for repeated filters (including deduplication/order) while retaining supported Cypher parameter values. This is a concrete integration gap, not an already supported feature.

The current default cache TTL is 28,800 seconds (8 hours), configurable by `STS_CACHE_TTL`. Agree freshness/invalidation under D-09. Cache the complete cards/counts response consistently; independent cached reads can disagree. MCP inventory size does not establish endpoint latency or an appropriate page cap.

Stored counts can legitimately be zero after a successful query. Query failure, unknown scope, or unavailable statistics must not be converted to zero. Check model-version existence separately from entity counts. The inspected model pairs were unique, but duplicate-handling checks remain required for future data.

## Errors and compatibility

- Proposed new-list behavior: a valid empty result returns HTTP 200 with an empty list and zero result counts.
- Invalid enums, malformed paging values, and limits beyond the agreed cap return HTTP 422.
- Proposed infrastructure failure behavior: HTTP 503 with a generic message; specify a typed error envelope before generating frontend types.
- Decide how stale cache results and missing critical metadata are surfaced. Do not present failure as an empty success.
- Existing endpoints retain their response shape, sorting, count meaning, and 404 behavior. Do not globally change MDBReader empty-result handling.
- Validate sort fields through an allowlist and bind Cypher parameters. Do not accept caller-supplied Cypher fragments.

## Decisions still required

- D-01: approve model-name identity, display-name fallback, repository destination, and a release-date source (or defer date sort).
- D-02: approve fallback current selection, total version ordering, and visibility of test/internal models.
- D-03: approve filtered pre-pagination count semantics.
- D-04: choose stored versus connected entity counts and the treatment of unowned properties.
- D-09: agree page limits, response budget, and cache freshness; no performance benchmark was run.

One additive aggregate endpoint remains the recommendation. Existing routes can supply catalog and detail primitives but cannot return the complete card statistics, coherent counts, and current selection in one response. No database migration or metadata-enrichment source has been approved by this investigation.

## OpenAPI handoff

After contract agreement, the API role implements Pydantic schemas and exposes the endpoint in FastAPI OpenAPI. Select a TypeScript generator in the frontend foundation task; the user's choice of OpenAPI types does not select a particular generator package. Document deterministic generation and check for contract drift in CI.

The UI-data role consumes generated types without edits. Hand-written transport errors/view models must be clearly distinguished from generated API types. A schema change triggers consumer typechecking and relevant integrated E2E even when only backend paths changed.
