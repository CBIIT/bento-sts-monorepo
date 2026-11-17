# Coordinator prompt validation

Date: 2026-11-17. Scope: [coordinator instructions](../../prompts/coordinator.md) and their README/workflow/task-plan links.

## Structural checks

A Python check resolved relative Markdown links in all four changed documents, checked balanced code fences, and verified the presence of mode, output, remediation, independent-context and working-tree instructions. All checks passed. `git diff --check` passed.

## Instruction walkthrough

These are manual scenario walkthroughs of the prompt, not worker executions or application test results.

| Scenario | Expected route | Walkthrough result |
| --- | --- | --- |
| Ready backend slice | Intake → baseline → producer → focused/integration evidence → separate critic → completion | Sections 1–5 and 7 define inputs, outputs and completion; unrelated frontend/browser gates require a recorded N/A |
| Critic finds incorrect counts | VERIFYING → NEEDS FIX → producer correction → affected tests → independent re-review | Section 6 requires finding IDs, owner routing and new evidence; producer cannot close its own review |
| QA database unavailable | Affected QA gate BLOCKED; independent work continues; no full completion | Sections 1, 5 and 7 prevent missing real-boundary checks from becoming PASS |
| No worker capability | Serial producer work; independent review NOT RUN | Section 3 prohibits simulated reviewer independence |
| Planning-only request | Document investigation and review; no product implementation | Invocation and section 5 retain mode boundaries |
| Overlapping writers or shared fixture reset | Serialize or isolate before dispatch | Section 3 requires explicit file/resource ownership |
| Files changed after a passing review | Compare current state to reviewed snapshot; rerun affected checks | Sections 5 and 7 invalidate affected old results |
| Same defect after two corrections | Diagnose/revise approach or identify external blocker; no automatic success | Section 6 bounds repeated ineffective attempts without dropping remaining work |

## Execution status

No producer/reviewer agents, application tests, browser QA, or remediation loop were executed for this validation. Runtime orchestration remains to be exercised on a separately selected task. Creating the prompt did not change the application's planning mode.
