# Browse Models task plan

Requested mode: plan. Source issue: [DATATEAM-801](https://tracker.nci.nih.gov/browse/DATATEAM-801).

Objective: define and deliver the Browse Models landing page using the existing STS backend and the agreed frontend stack. Use the [coordinator](../../prompts/coordinator.md) and [shared workflow](../workflow.md); select individual task rows according to the request and available inputs.

## Work context

| Input | Location |
| --- | --- |
| Spec | [Browse Models specification](../../specs/DATATEAM-801/spec.md) |
| Contract | [Model cards API proposal](../../specs/DATATEAM-801/api-contract.md) |
| Architecture | [Shared architecture](../../context/architecture.md) |
| Design | [Design intake](../../design/2026-11-12/design.md) |
| Scope | [File manifest](file-manifest.md) |
| Checks | [Verification plan](verification-plan.md) |
| Baseline | [Observed baseline](../../verification/DATATEAM-801/baseline.md) |
| Output directory | `.sdlc/verification/DATATEAM-801/` |

## Task selection

Rows are work units, not a mandatory sequence. Required inputs may already exist; use them without rerunning an upstream role. Resolve only the decisions affecting the selected row.

| Task | Owner | Required inputs | Output and checks | Current state |
| --- | --- | --- | --- | --- |
| Source and data discovery | Coordinator/data owner | Existing backend, model metadata access | Resolve identity, latest policy, count/statistic definitions and freshness (D-01/02/03/04/09) | Source inspection complete; live data open |
| Design intake | Design/UI owner | Figma access | SVG/node evidence, component mapping, search/control decisions (D-05/08) | All 41 section items saved as individual SVGs; component mapping and interaction decisions open |
| Frontend foundation | Repository/UI owner | Source/branch decision (D-07) | Reproducible frontend, package commands, assigned file scope | Source decision open |
| Catalog service | Backend service | Agreed identity/version/aggregate contract and data representation | Tested model-card service; focused and real Neo4j checks | Contract open |
| HTTP interface | API | Frozen request/response schema and service interface | Router/OpenAPI; HTTP tests; real service integration when available | Contract open |
| UI data integration | UI data | Frontend foundation and published response schema | Generated types, transport/hooks, focused tests/typecheck | Inputs open |
| Browse Models composition | UI | Relevant design decisions and UI-data interface | Accessible page/card/controls; component tests/build | Inputs open |
| Search and navigation integration | API/UI owners | Agreed search capability and destination routes (D-06) | Real submit/navigation behavior and relevant scenarios | Destinations open |
| Independent review | Critic | Selected diff/artifacts and acceptance criteria | Scope/correctness findings; evidence assessment | Run when requested |
| Local E2E QA | QA | Running local UI/API/test DB and selected scenarios | Actual scenario results, traces, accessibility checks | Environment not prepared |

For example, card layout work does not wait for a comparison engine if the agreed layout inputs are ready. Navigation to comparison remains an open integration check. HTTP unit tests may use a published service stub; the real integration gate still waits for the actual service. Search decisions do not block unrelated catalog query work.

## Role assignments

These files add Browse Models details to reusable role prompts:

- [Backend service](../../prompts/DATATEAM-801/backend-service.md)
- [API](../../prompts/DATATEAM-801/api.md)
- [UI data](../../prompts/DATATEAM-801/ui-data.md)
- [UI](../../prompts/DATATEAM-801/ui.md)
- [Critic](../../prompts/DATATEAM-801/critic.md)
- [E2E QA](../../prompts/DATATEAM-801/e2e-qa.md)

Issue references in the spec identify requirement sources. They do not impose ticket execution order or require another issue to be closed before this work can run.
