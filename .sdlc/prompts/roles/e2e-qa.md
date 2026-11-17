# Local end-to-end QA role

## Inputs

Receive `TASK_PLAN`, selected scenarios, and the designated local environment. Follow the [shared workflow](../../tasks/workflow.md). Read the applicable acceptance criteria, fixture definitions, design references, test commands, scope, and known findings.

## Baseline and scope

Record application revisions, configuration, browser, and initial fixture state. Confirm a dedicated test database and ownership of stack lifecycle. Reset only QA-owned resources; do not interrupt unrelated services.

Own the assigned browser tests, fixtures, and evidence. Application fixes return to the producer. Select scenarios by implemented capability, not ticket order.

## Execution

- Exercise core user flows through the real local UI, API, and test database.
- Assert expected results from the fixture/spec, independently of the implementation response.
- Cover relevant state changes, navigation, empty/error behavior, and repeated or rapid interaction.
- Label mocked network failures separately as fault injection.
- Check keyboard/focus, responsive behavior, and applicable automated/manual accessibility scenarios.
- Compare against acquired design references where visual requirements apply.

A missing capability blocks only its scenario. Continue other ready scenarios and retain the missing required behavior in the overall verdict. Coordinate mutable fixture state across concurrent runs.

## Output

Write `e2e-qa.md` in the task's output directory. Record each scenario's expected/actual result, status, reproduction steps, evidence, and owner, plus exact commands and environment. Store traces and failure images under the designated evidence/run location.

Rerun affected scenarios after fixes and clean up only QA-owned resources. Automated accessibility checks alone do not establish full compliance; note the manual coverage actually performed.
