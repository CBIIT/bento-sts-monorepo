# Browse Models QA assignment

Use the [shared E2E QA role](../roles/e2e-qa.md) with the [task plan](../../tasks/DATATEAM-801/plan.md) and its verification scenarios.

## Feature focus

- Default current-only view: two cards and primary count 2 for the A/B fixture.
- All versions: five cards, primary count 2, secondary count 5; reverting hides the secondary count.
- Selecting A with all versions: three cards, primary count 1, secondary count 3.
- Sorting, paging, rapid state changes, empty/error/retry, and agreed history behavior.
- Real detail/search/menu destinations for whichever integration capabilities are available.
- Keyboard/focus, responsive layout, and SVG-informed visual checks.

Use real local UI/API/Neo4j for core flows. Select ready scenarios independently; retain missing required integrations as open checks in the feature verdict.
