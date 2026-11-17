# MDB development workflow

Use a shared workflow and role prompts for any task. Keep requirements, scope, and verification evidence in the corresponding work folder. A folder name can be a ticket key or a descriptive work ID; execution does not depend on its format or numeric order.

## Run a task

Use the [coordinator prompt](prompts/coordinator.md) with a task plan, mode, and selected work:

```text
Follow .sdlc/prompts/coordinator.md.
TASK_PLAN: .sdlc/tasks/<work-id>/plan.md
MODE: plan | implement | review | qa
SELECTION: a task row or requested outcome
```

Follow the [shared workflow](tasks/workflow.md). The task plan supplies the spec, design, contract, file manifest, selected roles, checks, and output directory. Run only the work needed for the request. Referenced issue numbers are source metadata, not prerequisites to close other issues.

For the current planning task:

```text
Follow .sdlc/prompts/coordinator.md.
TASK_PLAN: .sdlc/tasks/DATATEAM-801/plan.md
MODE: plan
SELECTION: Resolve the Browse Models API contract using the available evidence.
```

The coordinator selects roles, dispatches workers when available, gathers evidence, and routes fixes through independent review and applicable QA. This invocation does not authorize product implementation in plan mode.

## Shared guidance

- [Architecture](context/architecture.md)
- [Workflow and handoff contract](tasks/workflow.md)
- [Backend service role](prompts/roles/backend-service.md)
- [API role](prompts/roles/api.md)
- [UI data role](prompts/roles/ui-data.md)
- [UI role](prompts/roles/ui.md)
- [Independent critic](prompts/roles/critic.md)
- [Local E2E QA](prompts/roles/e2e-qa.md)

## Document organization

| Location | Content |
| --- | --- |
| `specs/<work-id>/` | Required behavior, acceptance criteria, and API contracts |
| `design/<YYYY-MM-DD>/` | Shared design snapshot by design version date; SVG exports, source metadata, and component inventory |
| `tasks/<work-id>/` | Task selection, input links, file ownership, and verification plan |
| `prompts/<work-id>/` | Short assignments containing only work-specific details for a shared role |
| `verification/<work-id>/` | Baseline, actual test results, review findings, and QA evidence |

Do not copy the shared procedures into each work folder. Add a role assignment only when that role is needed. Small fixes can use one task row; a full feature can use several independently executable rows.

## Design versions

Design snapshots are independent of tickets. Use the design version date in ISO format, not the download date. The current snapshot is [2026-11-12](design/2026-11-12/design.md). Save future design versions in new dated folders and retain earlier snapshots. Specs and task plans must link to the exact version they use; update those links deliberately when adopting a newer design.

## Current work

[Browse Models task plan](tasks/DATATEAM-801/plan.md) links its spec, design, proposed API, and role assignments. Its current requested mode is planning.
