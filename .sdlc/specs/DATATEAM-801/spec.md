# DATATEAM-801 Browse Models specification

Status: draft. Updated 2026-11-17.

## Purpose and sources

An end user opening MDB should be able to browse available data models, identify models of interest, and reach search and comparison functions.

Primary source: [DATATEAM-801](https://tracker.nci.nih.gov/browse/DATATEAM-801), “End User views an information-rich landing page.” Related requirements:

- [DATATEAM-802](https://tracker.nci.nih.gov/browse/DATATEAM-802): card listing, default ordering, and version-specific detail navigation.
- [DATATEAM-803](https://tracker.nci.nih.gov/browse/DATATEAM-803): reversible sorting, model selection, and inclusion of older versions.
- [DATATEAM-804](https://tracker.nci.nih.gov/browse/DATATEAM-804): subordinate sidebar Global Search and Bento-native reuse.
- [Design intake](../../design/2026-11-12/design.md): source nodes, observed content, and unresolved design differences.

Jira owns product intent. Figma owns the visual reference. This spec records their reconciliation; it must not silently choose one when they disagree. Refresh mutable sources before implementation.

## Scope and dependencies

| Area | Treatment |
| --- | --- |
| Browse Models title, card region, sidebar, header counts | DATATEAM-801 requirements |
| One current version per model by default | DATATEAM-801 requirement |
| Option to include non-current versions | DATATEAM-801 requirement with DATATEAM-803 behavior dependency |
| Card fields and version-specific details | DATATEAM-802 and its additional card/detail stories; exact field ownership still to be identified |
| Sort controls and model filters | DATATEAM-803 dependency; proposed shared implementation slice, not a claim to close that ticket |
| Sidebar Global Search | DATATEAM-804 integration dependency; detailed result semantics belong to other stories |
| Search Terms and Compare Models navigation | Required by DATATEAM-801; destination implementation scope unresolved |
| Full comparison engine, full global-search engine, entity-detail suite | Outside the landing-page scope |

Issue references identify requirement sources, not execution order. A task can use an available contract or capability regardless of the source issue's status. If required behavior is unavailable, keep its acceptance check open and continue independent task rows. Full landing-page completion still requires its agreed integrations.

## Required behavior

| ID | Behavior | Source |
| --- | --- | --- |
| AC-01 | The landing view is titled Browse Models and presents a card-based model listing. | 801 |
| AC-02 | Initial loading resolves to one current-version card per model. | 801, 802 |
| AC-03 | The primary count represents distinct models, independent of how many versions are displayed. | 801 |
| AC-04 | Including older versions shows eligible model/version cards and the secondary model/version count; returning to current-only mode hides the secondary count. | 801, 803 |
| AC-05 | The default ordering is short model name ascending, then version descending. | 802, 803 |
| AC-06 | Model inclusion/exclusion and supported sort selections are reversible and update results consistently. | 803 dependency |
| AC-07 | A compact Global Search entry is available in the left navigation and connects to the agreed search behavior. | 801, 804 dependency |
| AC-08 | Search Terms and Compare Models navigation reaches agreed destinations. | 801 dependency |
| AC-09 | Cards show the agreed descriptors; View Details preserves the selected model and version. | 802 and card/detail story dependencies |
| AC-10 | Loading, empty, and error states are distinguishable; failures are not rendered as zero models. | Proposed quality criterion |
| AC-11 | Controls have accessible names, keyboard operation, visible focus, and understandable state/error announcements. | User-selected accessibility direction; detailed checks in verification plan |
| AC-12 | Existing STS endpoint behavior remains compatible. | Brownfield implementation constraint |

The proposed count interpretation is the complete filtered result before pagination, not just cards on the current page. Confirm D-03 before treating this as settled product behavior.

## Deterministic acceptance examples

Use a dedicated test dataset with model A versions 1.0.0, 2.0.0, 3.0.0 and model B versions 1.0.0, 2.0.0. Exactly one version of each is explicitly current: A 3.0.0 and B 2.0.0. These are synthetic fixtures, not production records.

| Action | Expected cards | Primary count | Secondary count |
| --- | --- | --- | --- |
| Initial visit | A 3.0.0, B 2.0.0 | 2 | Hidden |
| Include all versions | A 3.0.0, A 2.0.0, A 1.0.0, B 2.0.0, B 1.0.0 | 2 | 5 |
| Include only A while showing all versions | A 3.0.0, A 2.0.0, A 1.0.0 | 1 | 3 |
| Return to current-only, still selecting A | A 3.0.0 | 1 | Hidden |

Additional datasets cover versions 1.9 and 1.10, missing metadata, empty matches, duplicate joins, and multiple/missing current flags. Expectations for ambiguous version data must follow D-02, not an agent guess.

## Open decisions

| ID | Decision needed | Proposed direction / evidence | Owner |
| --- | --- | --- | --- |
| D-01 | Canonical model identity and card metadata provenance | Audit name/handle usage, display/short names, release dates, repository versus external landing URL. Current DTO does not contain every Figma field. | Backend/data owner |
| D-02 | Current-version rule, missing/multiple flags, null or non-semver versions | Existing latest route prefers marked records then falls back to version ordering; validate whether this matches product intent and real data. | Product + backend |
| D-03 | Counts relative to filters and pagination | Count distinct models and model/version combinations across all filtered results before paging. Confirm wording with product owner. | Product |
| D-04 | Card statistic definitions | Count model-version entities with explicit distinctness; determine relationship representation and shared-property treatment. | Data owner |
| D-05 | Large top search field versus sidebar Global Search | 804 specifies a compact sidebar entry; the earlier visual inspection showed a large top field; recheck against the selected section. Determine whether it is a separate model filter or superseded design. | Product/design |
| D-06 | Navigation/search/detail dependency boundaries | Identify actual destination routes and owning stories, plus the Bento-native search capability to reuse. | Product + architecture |
| D-07 | Frontend source recovery or new initialization | No tracked FE source/package manifest in this checkout. Confirm branch/source before proposing initialization paths. | Repository owner |
| D-08 | Design and NCIDS/USWDS mapping | Acquire SVG/node context and confirm component variants, typography, responsive behavior, and sorting/filter affordances. | Design/UI |
| D-09 | Freshness, volume, and paging limits | Establish data size, cache refresh expectations, response budget, and bounded page-size limits. | Backend + operations |

Resolve only decisions needed by the selected task row. Independent rows can proceed within the requested mode. Record decisions here with rationale and source/date.

## Contract and completion

The [API contract proposal](api-contract.md) is the canonical planning location for request and response fields. The [verification plan](../../tasks/DATATEAM-801/verification-plan.md) maps these acceptance criteria to checks.

Complete individual task rows against their criteria and applicable checks. Complete the landing-page feature when its agreed acceptance criteria, compatibility checks, independent review, and real API/DB/browser verification are satisfied.
