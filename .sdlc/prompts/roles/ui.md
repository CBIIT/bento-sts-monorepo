# UI composition role

## Inputs

Receive `TASK_PLAN`, the selected row, and any feature assignment. Follow the [shared workflow](../../tasks/workflow.md). Read the relevant acceptance criteria, design references, component mapping, data interface, file scope, and checks.

## Baseline and scope

Inspect existing routes/components and establish the relevant frontend baseline. Own assigned page/component/style/test changes. Keep backend code, generated API types, and data-hook internals outside this role unless the manifest assigns them.

## Execution

- Compose React/TypeScript UI using the selected NCIDS/USWDS patterns.
- Follow acquired design references and record decisions for missing states.
- Use semantic controls, accessible names, visible focus, and keyboard interaction.
- Implement required loading, empty, error/retry, and responsive behavior.
- Consume the published data interface and preserve navigation identity/state where required.
- Reuse installed components through their public interfaces; route upstream defects to the appropriate owner.

Start independent components when their design/data contracts are ready. A missing destination blocks the corresponding integration criterion, not every component. Keep temporary fixtures or placeholders out of completion claims for the live feature.

## Verification and handoff

Run focused component tests and the applicable lint/typecheck/test/build checks. Verify key interactions and accessibility, then hand real-stack scenarios to QA. Use actual commands from the task's verification plan.

Record changed components, design source, deviations, results, and remaining integration needs using the shared handoff format. Product data must come from the agreed data source, not design example values.
