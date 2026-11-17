# Shared task workflow

Use the [coordinator](../prompts/coordinator.md) to dispatch and track this workflow. It supplies per-run output directories, worker ownership, independent review, and remediation.

## Inputs

Start with a task plan path (`TASK_PLAN`) and the user's requested mode: plan, implement, review, or qa. Optionally select one task row or role. Paths in each task plan must be explicit or relative to that plan; do not infer a ticket number from the branch, directory naming pattern, or another task.

A task plan provides:

| Input | Purpose |
| --- | --- |
| Objective and scope | Outcome and acceptance criteria for the selected work |
| Spec | Relevant requirements or a concise requirement section for a small change |
| Contract/design | Interface or visual inputs, when applicable |
| File manifest | Paths owned by the selected role and intended changes |
| Verification plan | Applicable checks and expected results |
| Output directory | Where baseline, results, review, and QA evidence belong |
| Task rows | Owner, required inputs, output, checks, and status |

An external issue reference is optional. A task can run using a descriptive work ID and local requirements. Task rows may consume an existing artifact instead of waiting for another row to run again.

## Select work by mode

| Mode | Work |
| --- | --- |
| plan | Inspect relevant sources and refine architecture, requirements, design, scope, and checks. Do not change product code. |
| implement | Execute the selected task rows within their file scope and verify the changes. |
| review | Review the specified diff/artifacts against acceptance criteria. Product files remain read-only. |
| qa | Exercise the selected user scenarios in the designated test environment and record results. |

A new user request can change the mode; update the plan accordingly. Do not persist a temporary planning instruction as a permanent prohibition inside every role prompt.

## Readiness

1. Resolve the selected row's actual inputs: contract, design, source files, and test environment as needed.
2. If an input is missing, block only the affected row or check and identify the missing artifact. Continue independent selected work.
3. Do not require every decision in a spec, every related issue, or every role to finish before starting a ready row.
4. Preserve the distinction between partial task completion and completion of the full requested feature. Unavailable required behavior remains open.

Dependencies describe capabilities such as “published response schema” or “running test API,” not “the preceding ticket is closed.” Parallel work needs disjoint file ownership and independent mutable test resources; otherwise serialize it.

## Baseline and scope

Inspect current changes and run the checks relevant to the selected scope. Record baseline failures and preserve unrelated user work. Read each file before editing, confirm CREATE paths do not exist, and state the intended change.

Keep CREATE/MODIFY/READ ownership in the work's file manifest. Update scope when the task genuinely requires another file; resolve product or contract changes before dependent edits. Routine work already covered by the request does not need repeated confirmation.

## Verification gates

Select gates according to the change. A backend-only task does not require UI/design gates; a documentation task checks consistency and references. UI/API integration requires the real boundaries it claims to verify.

| Gate | Evidence |
| --- | --- |
| Baseline | Relevant pre-change commands and observed results |
| Focused checks | Tests for the changed behavior |
| Integration | Actual data/service/HTTP boundaries affected by the change |
| Build and static checks | Applicable typecheck, lint, and build |
| Browser QA | User scenarios, design/accessibility checks where relevant |
| Independent review | Scope, correctness, acceptance coverage, and findings |

Use PASS, FAIL, BLOCKED, NOT RUN, or NOT APPLICABLE. Record why a gate is not applicable before treating the task as complete. Existing failures and unrun required checks remain visible; neither counts as a pass.

## Handoff

Write results to the output directory supplied by the task plan. Use `test-results.md` for implementation evidence, `code-review.md` for review, and `e2e-qa.md` for browser QA. Each entry records:

- Selected task/role, revision, and relevant working-tree state.
- Changed files and acceptance criteria addressed.
- Published interface or artifact for the next consumer.
- Exact commands, working directory, environment, results, and skipped/deselected tests.
- Remaining findings, missing inputs, and the next owner.

Record evidence when work occurs. Avoid empty result reports and repeated workflow explanations in the baseline. Serialize shared-record updates or give concurrent roles separate result files referenced by the task plan.

## Review and remediation

Use an independent context for implementation review. Route code defects to the implementing role, interface disagreement to the contract owner, and requirement/design questions to the relevant owner. Recheck the changed behavior and any affected regression boundary after a fix. Close the selected task when its criteria and applicable gates are satisfied; report remaining feature work separately.
