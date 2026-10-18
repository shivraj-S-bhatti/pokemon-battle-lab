# Logic/UI integration review for Claude and the parent

## Integration follow-up disposition

The parent's small integration corrections are present in the later source snapshot: `public/app.js` SHA-256 `cce59886e9774dfc2ac0293e673523c85db8483c3715cc766c66cc801e0d5868`; `backend/store.mjs` SHA-256 `2067b9302624379db3e2f83a45ca6815874d6e2108e53d93758657da82a4f8b6`.

Confirmed corrections for Claude to review:

- DOM children use `kids.flat(Infinity)`, so nested repair-link arrays are flattened into nodes rather than coerced into text. Confirmed in source; the parent reports the IAB browser check.
- The map and inspector no longer claim that the union of all route conditions is an AND. They now label requirements across alternative routes.
- The backend supplies `assumable` as well as `editable`; read-only `/api/graph` checks confirm computed conditions in all three supplied cases are non-assumable.
- Bulk assumption edits filter out non-assumable conditions. Ordered individual condition edits were already present from Claude's earlier changes.

Disposition: the specific flat-AND labels and current-case editability-field mismatch are resolved. The earlier findings below are historical where superseded by this paragraph. Nested OR/NOT rendering is still open: the inspector still flattens each route's explanation into leaves, includes failed leaves from satisfied OR groups, and does not render negation expectations. Bulk assumptions still operate across alternative routes, rather than a chosen route's expected literals.

Other open items remain: old-save assumptions are appended after historical edits; proposed rather than accepted edits drive team/set rendering and export; request freshness lacks an immediate input revision; collected exports omit route structure; and source-plan outcomes are copied to broader goals instead of being shown under their actual routes. The outcome issue is particularly material after the White Herb correction and for ordinary versus amplified Torterra setup. These findings prevent an unconditional sign-off on the explanation and agent-export workflow, although the evaluator itself is ready for integration.

Independent live verification used GET requests only against `http://127.0.0.1:4318`. Health reports FalkorDB, and all three reconstructed model contents match the current adapters after JSON serialization and order-insensitive comparison of entity collections. Each route's internal expression order remains part of the comparison. The stored models produce 3/3/7 goals and 5/4/14 routes for BSS, Y-chu doubles, and Simple Beam respectively. Computed conditions are non-assumable in every graph. No database runs were recorded by this review.

One additional integration note: the BSS `candidateEdits` collection returns in a different order from the adapter. Its three candidates and costs are intact, and the current default search evaluates all of them. Preserve a stable ordinal at ingestion/reconstruction or canonicalize the candidate order before budgeted search so a smaller `maxCandidates` budget and repair IDs are reproducible. This was observed, not inferred from query text alone.

Final reasoning validation for this checkpoint: **41 passed, 0 failed** with `node --test workbench/logic/logic.test.mjs`. Backend-specific tests and browser behavior were reported by the parent, not rerun by this reviewer.

Reviewed source on October 18, 2026. This is a code and API-contract review, not a browser verification. The UI changed during the review; the references below describe the later snapshot, after ordered condition edits and route inspection were added. No frontend or backend files were edited by the logic owner.

Snapshot SHA-256: `public/app.js` = `1b277b8215257f396b6ba2715b6cae603822d31d1f4d08c716467eaa45680293`; `backend/store.mjs` = `f54488b8baf023980a6083164c6e75dc64e36b82c2cb0f89e87f619c2e0e630d`. Verify these paths/functions against newer edits before applying findings.

## P1: AND flattening remains in the map and the inspector

`public/app.js:338` labels every plan→REQUIRES edge “Needs · all of …”. `:423` repeats “Needs (all)”. The backend deliberately emits all leaf incidence edges across the plan's routes (`backend/store.mjs:78`), so those edges are not a conjunction. The new “Routes · any one” inspector at `:428` improves the alternative-route display, but `:430` flattens each route with `leaves(...).filter(!satisfied)`, losing nested OR/NOT structure and including failed leaves inside an already-satisfied OR group.

Counterexample: `earthquake-partner` can use effective Levitate **or** an intact Air Balloon. The map says both are required. Within `avoid-friendly-fire:protect`, an eligible Raichu **or** Milotic Protect option is sufficient; a satisfied branch must not leave the other branch listed as a requirement. A negated true leaf is a failed absence requirement, not a green positive requirement.

Fix: render the returned `routeOptions[].explanation` recursively, respecting `operator`, `expectedTruth`, and `satisfied`. Treat direct graph REQUIRES edges as links for navigation or label them “conditions across routes”. If showing only unresolved requirements, stop descending into a group that already satisfies its expected truth.

## P1: computed-condition editability uses the wrong field

The UI checks `assumable === false` at `public/app.js:342` and `:444`; the backend emits `editable` at `backend/store.mjs:78`. Consequently computed membership, item and move conditions still receive assumption controls. “Assume all needs hold” at `public/app.js:438` also sends overrides for every leaf, including computed facts and alternatives.

Logic now explicitly rejects computed/derived facts both in the `conditions` input map and in `set_condition` edits. Its new `conditionStates[id]` includes `editable`, effective `truth`, `basis`, and `assessmentStatus`; rejected initial inputs appear in `conditionInputResults`.

Fix: make controls opt-in on `editable === true`, using the current evaluated record. Bulk assumptions should target a chosen route's scenario conditions and honor NOT expectations, or be removed. Do not offer a control that the evaluator will reject.

## P1: migration gives old assumptions an unsupported new chronology

The ordered `setCondition` implementation at `public/app.js:196` correctly places a new check after an earlier set edit. However, `:155` migrates every old `saved.conditions` entry to the end of the edit history. Under the previous contract, that bag applied before the edits. Appending it now can turn a deliberately invalidated assessment into a fresh true assessment without a recheck.

Counterexample: an old save has `beam-smash:order = true` in its condition bag and a later Choice Scarf removal in its edit history. Previously the order check became unknown; migration now asserts true after removing Scarf.

Fix: prepend migrated conditions before the historical edits, or migrate them to unknown with an explicit request to recheck. Existing chronology cannot be inferred from the old unordered bag. Keep the new ordered-toggle implementation.

## P1: rejected edits still determine the displayed team, sets and export

`currentTeam()` and `setFor()` replay every proposed edit (`public/app.js:58`, `:66`) without honoring `interventionResults[].applied`. Rejections are shown in the edit log, but team cards, pins, map membership and export still depict the rejected configuration. The evaluator returns the accepted configuration in `analysis.scenario`.

Counterexample: remove a pinned member, or add a seventh member to a six-member roster. Logic rejects it, while the local team renderer applies it. Pinning after a set edit also makes replay reject that earlier edit under the current logic contract, while the UI continues to show the edited set. The tooltip describes pins as affecting repairs only, which is a separate contract mismatch.

Fix: use `analysis.scenario.team` and `.sets` for the current accepted state, while preserving the proposal log separately. Export the accepted scenario and rejection results. Agree whether pins apply to explicit user edits or only repair search; the existing logic protects both and must not silently be presented as repair-only.

## P1: goal outcomes copied from source plans overstate alternate routes

`backend/store.mjs:83` copies the source plan's outcomes to every goal derived from it. The UI renders these as “Gets you” (`public/app.js:424`). This makes the broad `purpose:boost-torterra` goal appear to deliver the Simple-amplified outcome even through ordinary Shell Smash or Decorate. The new defense-clearing goal must also not imply that White Herb creates the boosts.

Fix, parent and Claude: expose `model.routes[].outcomes` with their route conditions. Keep practitioner outcomes labeled as source claims if displayed separately. Do not promote the source plan's outcome list into an unconditional goal guarantee. The route/model data already distinguishes the outcomes.

## P2: stale responses can be accepted during debounce or a case switch

`changed()` at `public/app.js:165` updates local inputs without advancing `S.seq`; the sequence changes only when `analyze()` begins. An earlier response arriving during the 160 ms debounce can therefore be accepted for the new input. `openCase()` at `:140` has no request-generation guard around the graph fetch, so a slower earlier case fetch can replace a newer case selection. Export remains available with the old analysis.

Fix: advance an input revision immediately on every input/case change, bind graph and analysis requests to the captured case/revision, and reject mismatched responses. Mark or disable export until its analysis matches the accepted revision. This was identified by source inspection, not exercised in the browser during this review.

## P2: collected agent context discards route logic and evidence

`buildExport()` at `public/app.js:572` serializes plans as flattened strings and omits `routeOptions`, explanation trees, route outcomes and evidence. The collected-only export also skips `/api/context`, so an agent receives the ambiguous flattened prerequisites without the underlying model. It cannot distinguish alternatives or reconstruct negation. The response now also carries `continuations`, identifying still-available alternatives after a route breaks.

Fix: retain stable IDs, route explanations, outcomes, evidence and continuations in the selected scope. Export the evaluated scenario and graph revision/run identity. The human and agent should receive the same causal structure.

## Logic-side fixes completed during this review

- Exported `analyzeModel(model, options)` so FalkorDB's reconstructed model is evaluated directly.
- Added canonical evaluated state for every condition and explicit rejected-input results.
- Fixed missing-set-ID matching that let pinning an alternative accidentally pin unrelated edits.
- Fixed stale third-member assessments, split amplified boosts from defense clearing, and pruned redundant repair supersets.
- Added the three documented BSS third-member candidates with their costs, labeled source restorations, and exposed retained alternate routes.

The end-of-cycle reasoning suite passes 41 tests. Browser behavior, live graph ingestion and frontend fixes remain with their owners.
