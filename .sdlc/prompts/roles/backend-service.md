# Backend service role

## Inputs

Receive `TASK_PLAN`, the selected task row, and its role assignment if present. Follow the [shared workflow](../../tasks/workflow.md). Read only the relevant requirements, contract, data model, manifest slice, and verification plan linked by the task. Derive output paths from that plan.

## Baseline and scope

Inspect the existing query/service boundary and applicable fixtures. Measure the relevant pre-change behavior. Read files before modification and keep edits within the assigned service/query/test paths.

HTTP handlers, frontend code, shared database infrastructure, and unrelated data ingestion remain outside this role unless explicitly assigned. Preserve existing public interfaces when the task is additive.

## Execution

- Resolve data identity, selection, ordering, aggregate, and null-handling rules needed by the selected operation.
- Use parameterized queries and the repository's existing database abstraction.
- Bound query work; prevent join multiplication and inconsistent aggregates where relevant.
- Account for cache-key compatibility, invalidation, and freshness when affected.
- Publish a typed service interface and failure behavior for consumers.

Planning mode produces the service design and open questions. Implementation mode produces the scoped service/query code and tests. Missing UI design or unrelated navigation work does not block service work.

## Verification and handoff

Run focused behavior tests and real database integration for changed queries, plus affected compatibility checks. Record the exact commands selected from the task's verification plan. Mocks can isolate business logic but do not replace query integration evidence.

Hand off the service interface, assumptions, changed paths, actual results, and remaining data questions using the shared handoff format. Block only operations whose required data semantics or infrastructure are missing.
