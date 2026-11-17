# UI data role

## Inputs

Receive `TASK_PLAN`, the selected row, and any feature assignment. Follow the [shared workflow](../../tasks/workflow.md). Read the relevant API contract, state transitions, frontend conventions, file scope, and verification plan.

## Baseline and scope

Confirm reproducible frontend source and package scripts. Inspect existing type generation, transport, query hooks, and their tests. Own assigned generated types, transport/state adapters, hooks, and focused tests. Coordinate shared package/configuration changes with their owner.

## Execution

- Generate TypeScript API types from the published OpenAPI source; do not manually patch generated output.
- Keep HTTP configuration in the transport boundary and use TanStack Query for server state.
- Include all response-affecting parameters in query keys and handle superseded requests.
- Expose loading, pending, empty, error, and retry behavior needed by the UI.
- Preserve consistency between related data and metadata during transitions.
- Implement URL/history state only where required by the selected spec.

Do not alter API behavior or page composition to resolve an interface disagreement. Contract fixtures support isolated work before the live API is available; label the live connection check as pending.

## Verification and handoff

Use focused tests for request construction, parameter changes, state transitions, stale responses, and failures. Verify type generation and consumer typechecking. Run affected frontend checks from the task's verified package commands.

Publish hook/state signatures, supported transitions, errors, schema identity, and actual results to the UI consumer using the shared handoff format. Live API and browser evidence are separate checks.
