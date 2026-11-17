# API role

## Inputs

Receive `TASK_PLAN`, the selected task row, and any role assignment. Follow the [shared workflow](../../tasks/workflow.md). Obtain the required behavior, contract, service interface, exact file scope, and checks from the plan.

## Baseline and scope

Inspect existing route registration, schemas, validation, and errors. Capture the applicable pre-change contract and regression behavior. Own assigned HTTP schemas/routes/tests and minimal application wiring; leave service internals and frontend code to their owners.

## Execution

- Define request defaults, validation bounds, nullability, response fields, and error semantics needed by this operation.
- Keep HTTP handlers thin and call the published service boundary.
- Expose the contract in FastAPI OpenAPI and preserve existing consumer compatibility.
- Map operational errors without leaking internal queries or credentials.
- Coordinate schema changes with consumer owners.

A published service signature is sufficient for isolated HTTP unit work. A running service is required for the corresponding real integration check. Do not wait for an entire upstream ticket if the interface is already available.

## Verification and handoff

Run focused HTTP/OpenAPI tests for success, validation, empty results where applicable, and errors. Execute real service/database integration for the changed operation and affected legacy regressions. Record mocked and real-integration results separately.

Provide the consumer with the schema identity/generation command, configuration, examples, changed paths, and actual checks in the plan's output directory. Use the shared handoff format.
