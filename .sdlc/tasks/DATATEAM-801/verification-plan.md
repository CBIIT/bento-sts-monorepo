# DATATEAM-801 verification plan

Select checks for the active task row using the [shared workflow](../workflow.md). Actual observations belong in [baseline.md](../../verification/DATATEAM-801/baseline.md) and the output directory specified by the task plan.

## Gate definitions

| Gate | Required evidence |
| --- | --- |
| G0: readiness | Spec decisions resolved for the slice; exact file scope; API/design dependencies available |
| G1: baseline | Pre-change source state and measured tests, including failures, skips, and deselections |
| G2: focused | Role-specific tests executed after the relevant change |
| G3: integration | Real test Neo4j queries, HTTP contract, generated consumer types, and legacy API compatibility |
| G4: frontend | Typecheck, Vitest, lint, and production build using verified package scripts |
| G5: browser | Real local UI/API/DB E2E plus identified fault-injection and accessibility checks |
| G6: independent review | Spec/file-scope audit, actual evidence review, unresolved findings, and a non-self-approved verdict |

These gates describe available checks, not a mandatory sequence for every task. Mark unrelated gates NOT APPLICABLE with a reason; retain missing required checks as open. A backend-only slice can finish its own checks while browser QA for the full feature remains pending.

## Command planning

Backend checks run from `backend/` with the installed project interpreter, once the test environment is confirmed. Existing `pyproject.toml` adds `-s -k local`; blindly running pytest can deselect non-local-named unit tests. `conftest.py` also defines local and cicd database fixture variants.

Proposed local coverage command, to verify before use:

```sh
python -m pytest -o addopts= -k 'not cicd' tests/
```

This excludes the cicd parameter variant while retaining tests without a `local` name. Record collected, selected, and deselected tests. Run the cicd variant in its configured environment separately. Inspect fixtures, connection settings, and pre-existing untracked tests before execution; use the dedicated test database.

A focused comparator check can use `python -m pytest -o addopts= tests/test_version_sorting.py` once dependencies are available. New-test commands must name the selected task's actual files.

Frontend scripts do not exist in the tracked checkout. The following script contract is proposed for recovered/initialized source, not currently runnable commands:

- `npm run typecheck`: TypeScript check.
- `npm run lint`: configured lint rules.
- `npm run test -- --run`: non-watch Vitest run, if the chosen script supports these arguments.
- `npm run build`: production Vite build.
- `npm run test:e2e`: approved Playwright project(s) against the dedicated local stack.

Confirm package manager/lockfile and replace examples with verified commands before running frontend checks.

## Fixture design

Use model A versions 1.0.0/2.0.0/3.0.0 and model B versions 1.0.0/2.0.0, with A 3.0.0 and B 2.0.0 marked current. Supply independently known node/property/relationship counts and dates. Derive expected values from fixture definitions and approved semantics, not the implementation's own response.

Add fixtures for 1.9 versus 1.10, missing dates, duplicate joins, shared properties, no matches, and current-flag anomalies. Decide ambiguous-data expectations under D-02/D-04 before writing assertions.

Allocate a dedicated test database/container and namespaced resources. Reset only those fixtures. Record dataset revision, initial state, API/UI versions, browser version, and configuration. Prevent concurrent runs from resetting each other's database.

## Scenario matrix

| Scenario | Acceptance IDs | Expected verification |
| --- | --- | --- |
| Initial entry | AC-01/02/03/05 | Correct title; A 3.0.0 and B 2.0.0; primary 2; secondary hidden |
| Include all versions, then revert | AC-04 | Five ordered cards; primary 2; secondary 5; revert restores latest-only |
| Select A in all-version mode | AC-03/04/06 | Three cards; primary 1; secondary 3 |
| Name/version/date sorts | AC-05/06 | Both directions and stable ties; semantic version order and defined missing-date treatment |
| Paging with counts | AC-03/04 | Counts remain filtered totals, subject to D-03; no duplicate/missing page rows |
| Card metadata/detail | AC-09 | Fixture-backed descriptors; detail URL/context preserves model and version |
| Search and menu navigation | AC-07/08 | Compact sidebar search; agreed submit and real destinations; pending dependencies are BLOCKED |
| Empty result | AC-10 | Honest empty state and zero result counts, not an error |
| API failure and retry | AC-10 | Visible recoverable error; no false zero count; successful retry restores data |
| Rapid toggle/filter changes | AC-04/06/10 | Stale requests do not overwrite final user selection or mix counts/results |
| Back/forward and reload | AC-06 | Proposed URL state behavior, only after agreement |
| Keyboard and responsive layout | AC-11 | Usable focus/order/labels; no clipped primary controls or inaccessible navigation |
| Existing STS routes | AC-12 | Before/after regression checks preserve old response/count/error semantics |

Core scenarios use real API responses and Neo4j fixtures. API-failure simulation can use explicit Playwright interception, but label it fault injection and do not count it as proof of real infrastructure failure handling. Backend integration tests separately exercise actual error mapping.

## Accessibility and visual checks

Use an automated accessibility checker with the agreed tool dependencies, plus keyboard-only navigation, visible focus, announcements, and contrast inspection. Include targeted screen-reader testing for the relevant user flow; if unavailable, record it as NOT RUN and avoid broad compliance claims.

Compare layout against acquired Figma SVG and NCIDS/USWDS mapping. Proposed test widths are 1440, 768, and 375 CSS pixels, with a 320-pixel overflow probe; these are QA probes, not confirmed Figma breakpoints. Check long names, large counts, missing dates, busy controls, and sidebar behavior.

## Evidence and completion

Write results to the output directory in the task plan. Use `evidence/<run-id>/` for retained traces and failure images. Screenshots can document QA failures; design references use SVG. Choose large-artifact retention/storage during CI setup.

Each scenario records expected result, actual result, status, environment, reproduction steps, evidence path, and owner. Reviewer findings include severity, file location, acceptance ID, and rerun disposition. Unit tests cannot establish browser execution, design fidelity, or reviewer independence.

Task completion follows its selected criteria and gates. Full-feature completion additionally requires the agreed integration scenarios and unresolved findings to be addressed.
