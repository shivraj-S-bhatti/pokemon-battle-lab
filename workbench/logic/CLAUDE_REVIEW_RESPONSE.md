# Disposition of Claude's logic review

Source: `../LOGIC_REVIEW_CLAUDE.md`. Delivery: local, uncommitted. The end-of-cycle reasoning suite passes 41 tests.

| Finding | Disposition | Implementation and evidence |
| --- | --- | --- |
| C1: stale third-slot assessment | Fixed | Third-slot scenario facts depend on every admitted candidate member. Swapping Garchomp/Corviknight/Primarina invalidates the checked progress and bring assumptions. Regression covers an assessed third replaced by another candidate. |
| C2: White Herb gates the amplified boost | Fixed | `beam-smash:amplified` now requires the successful Simple Beam/Shell Smash line, with +4 offensive/Speed boosts and -2 defenses. `purpose:restore-smash-defenses` separately requires White Herb and its activation condition. Removing Herb does not block amplification. |
| C3: repair supersets | Fixed for the default minimal-repair view | A tested subset that achieves the same goal truth excludes its supersets even if the larger set opens more routes. `search.supersetsPruned` records this. Extra route breadth is no longer used to justify a supposedly minimal repair. |
| M1: no third-member candidates | Fixed | The three documented candidates become explicit `add_member` candidates for the BSS case. Each proposed repair retains its source alternative's cost and remains conditional on actual bring/progress checks. |
| M2: repairs mostly undo edits | Partially addressed; discovery limit remains | `repairKind` identifies `alternative`, `mixed`, and `restore_source`. Alternative candidates sort before source restoration. This is a display order, not strategic ranking. New catalog-wide mechanisms still require admission and explicit routes. |
| M3: surviving setup alternatives not surfaced | Fixed in the reasoning output | `comparison.retainedRoutes` and top-level `continuations` expose alternatives left after a route is blocked, including ordinary Shell Smash and Decorate with distinct outcomes and tradeoffs. The summary directs attention to these alternatives. UI rendering remains Claude's scope. |

White Herb/Simple/Shell Smash behavior was checked directly in the pinned local Showdown sources: `.cache/showdown/data/items.ts:7664`, `data/abilities.ts:4285`, and `data/moves.ts:16250`. Simple doubles the stat changes; White Herb resets negative boosts separately. No new battle simulation was used as evidence.

Additional correctness fixes: condition bags reject computed/derived facts instead of silently ignoring them, current effective states are available in `conditionStates`, and missing optional set IDs no longer cause unrelated pin matches. The parent-requested `analyzeModel` entry point is implemented and regression-tested against a deliberately modified supplied model.

The broader boundaries in `REVIEW_NOTES.md` remain: authored route definitions, limited candidates, coarse externally assessed battle conditions, no joint executor, and no damage or win-rate evaluator. These changes improve faithful reasoning within that boundary; they do not establish general creative discovery.


Final integration checkpoint: the reasoning suite was rerun with 41 passes and no failures. GET-only inspection confirms all three live stored model contents are current, including the separate defense-clearing goal. Parent-applied integration corrections and the remaining UI/export findings are distinguished in the top addendum of `UI_REVIEW.md`. Logic disposition is ready for integration; overall explanation/export disposition remains conditional until those semantic findings are resolved.
