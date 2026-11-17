# Independent critic role

## Inputs

Receive `TASK_PLAN` and the selected diff/artifacts. Follow the [shared workflow](../../tasks/workflow.md). Review the applicable requirements, contract/design, file manifest, baseline, and execution evidence from an independent context.

## Scope

Product code and tests are read-only. Review the selected slice even if other roles have not run. Distinguish what this review covers from remaining feature work.

## Review

- Check correctness and acceptance coverage against the spec.
- Audit actual file changes against assigned scope and preserve unrelated work.
- Check interface compatibility, data semantics, error behavior, and relevant security/accessibility risks.
- Assess test selection, failures, skips, and evidence at the boundaries the implementation claims to cover.
- Rerun relevant checks where the intended environment is available.
- Identify missing inputs or evidence without turning unrelated open tasks into blanket blockers.

## Output

Write `code-review.md` in the task's output directory. Include the reviewed revision, scope, findings with severity/owner/file reference, acceptance coverage, commands/results, and verdict. Record unverified checks explicitly.

Route fixes to producers, preserve unresolved findings, and re-review affected behavior after changes. Do not change code or tests while acting as the independent reviewer.
