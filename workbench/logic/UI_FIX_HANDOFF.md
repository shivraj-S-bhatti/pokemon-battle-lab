# UI integration handoff

For Claude and the parent, October 18, 2026. This supersedes the open-item disposition in `UI_REVIEW.md`; it is a source review, not browser sign-off. Frontend findings describe the snapshot before the parent's concurrent narrow integration edits; use this as their acceptance checklist. Ownership remains Claude for frontend and parent for backend. No frontend/backend files were edited by the logic owner.

## Final scoped review disposition

The scoped source review used frontend SHA-256 `1beb5ce4e69f97a5cf0bf54ba1a4c8bfcd39ab3846b54e69e668d04fe9038edf`; the final loading-guard regression passed against `03082eaeabd99eaefff031a66edf14b9bc0a8f1e7cbf9c387628f4831ac0ce37`. The parent reports browser verification that a rejected pinned removal retains Sableye and that export contains the rejection plus graph/evaluator/run identities. This reviewer inspected source and executed in-memory callbacks; no browser state, frontend/backend files, or database state was changed. The final pass was limited to the previously failing loading boundary.

| Finding | Disposition |
| --- | --- |
| Case-loading mutation race | **Resolved; reproducer passes.** Try it and tray Clear now return before mutation while loading. Central `store.save()` also refuses loading or a case/graph ID mismatch. |
| Export format/scope race | **Resolved in reviewed source.** `exportSeq` guards success and failure publication; completed format/case metadata drives download. Both graph and evaluator revisions are compared. |
| Missing non-requirement route causes | **Resolved in reviewed source.** The inspector uses full evaluated routes and renders scope, active blockers, unresolved blockers, and tradeoffs beside the explanation. |
| Compact context drops route provenance | **Resolved in reviewed source.** The backend compact projection preserves evidence, source IDs, tradeoffs, blockers, unresolved blockers, and scope. |

The original loading failure overwrote B's saved state with A's interventions/pins when the old tray Clear was clicked while B loaded. The exact in-memory callback sequence now produces zero storage writes and leaves the proposal and collection unchanged. No real saved case was touched in either probe.

Preserved in `frontend-boundary.test.mjs`: the actual repair/tray callback sequence and central persistence checks for loading, case mismatch, and a valid matched save. `node --test workbench/logic/frontend-boundary.test.mjs`: **2 passed, 0 failed**. The test uses Node's built-in VM and stubbed rendering/storage, with no browser, network, or third-party dependencies. No material issue remains open from this scoped review. Restart/reseed and full integration tests remain with the parent; this is not a new broad review or browser sign-off.

## Follow-up after the parent's UI integration

Read-only inspection confirms accepted scenario rendering, canonical condition truth, immediate input revisions, guarded graph fetches, old-save prepend migration, all-owner condition navigation, recursive explanations, route outcomes, removal of bulk assumptions, and structured Markdown/JSON export are now present. The earlier sections below remain the detailed contract, not a claim that all their fixes are still outstanding.

Browser feedback exposed a separate adapter defect: source-plan outcomes were inherited by routes requiring only one of that plan's mechanisms. `cases.mjs` now authors every modeled route's outcomes explicitly. Manual switching no longer claims Chilly Reception, Burn/Foul Play are separated, and Trick Room no longer claims Simple + Coil. Source-outcome additions cannot propagate into routes; unmodeled fallback routes expose no executable outcomes. Two new regressions pass with **44 reasoning tests, 0 failures**. The parent must restart/reseed the server for the changed adapter model to appear in FalkorDB.

Earlier frontend findings from source, superseded by the final disposition above:

- **P1, case loading (`openCase`, lines 131–153; `changed`, line 158):** while the new graph fetch is pending, the old graph, proposal list, and interactive cards remain. Clicking an old control increments the same generation, saves the old proposal under the new case ID, and causes the new graph response to be discarded. Disable/clear case-editing controls until the graph is installed, and guard mutation handlers against case/graph mismatch. Keep case-load generation separate from input revision if editing during fetch is supported.
- **P2, export format/scope races (`refreshExport`, lines 611–619):** concurrent refreshes have no export-specific generation. A slow JSON/all request can overwrite a newer Markdown/collected request while the download handler uses the currently selected format. Bind a generation to each refresh and check it before publishing text, status, or enabled controls; bind download metadata to the completed export. Also compare `context.meta.evaluatorRevision` with `analysis.graph.evaluatorRevision` at line 568; matching graph hashes alone do not establish current evaluator results.
- **P2, non-requirement causes (`inspectPlan`, lines 418–423):** the route card renders only the requirement tree and outcomes. It still omits evaluated `blockers`, `unresolvedBlockers`, and `scopeTruth`, so a fully satisfied tree can accompany a blocked/unknown route without its cause. Read these from `res.routes` by route ID, display them alongside the tree, and label outcomes as conditional on the whole route. Route tradeoffs and categorized evidence are also available for this panel.

At that earlier snapshot the compact backend context omitted route evidence/sourceIds/tradeoffs. The final scoped review above confirms those fields are now preserved.

## 1. Render the accepted scenario

Replace proposal replay in `currentTeam()`, `setFor()`, and exports with the matching analysis response. Preserve proposals in the edit log and show each rejection there. The response has this shape; field names below are literal, values are descriptive:

```js
{
  caseId,
  scenario: {
    team: [speciesId], sets: [{id, speciesId, itemId, abilityId, moveIds}],
    conditions: {[conditionId]: true /* or false, 'unknown', assessment object */},
    context, selectionMode, pinned: [speciesIdOrSetId], conditionInputResults
  },
  interventionResults: [
    {edit, applied: true, invalidated: [conditionId]},
    {edit, applied: false, reason: 'This member or set is pinned.'}
  ],
  conditionInputResults: [{id: conditionId, applied: false, reason}],
  conditionStates: {[conditionId]: {id, label, predicate, truth, editable,
    basis, assessmentStatus, assessmentEvidence: [sourceId]}}
}
```

For example, pinning `torterra` and requesting `{type:'remove_member',speciesId:'torterra'}` returns `applied:false` with the reason above; `scenario.team` still contains Torterra. The team card, membership checks, and export must agree. Pins protect explicit edits as well as repair search under the current contract. Update the repair-only tooltip. `scenario.sets` includes available sets; membership comes from `scenario.team`.

Use `conditionStates[id].truth` for every evaluated condition, including optional enablers. Controls require `editable === true`. Do not fall back to the latest proposed toggle as an evaluated truth while pending or after a rejection. `assessmentStatus` is `computed`, `stale`, `out_of_scope`, `unassessed`, `assumed`, or `provided_evidence`; an evidence label records supplied attribution, not independent verification. False is a valid value, not a missing record.

Keep the existing ordered `setCondition()` behavior. Migrate an old `saved.conditions` bag **before** historical interventions, matching its old semantics, or mark its assessments unknown for recheck. Appending it invents a later recheck. A dependent edit yields `{truth:'unknown',basis:'invalidated_by_intervention',previousAssessment:...}`; only a subsequent explicit check can restore it.

## 2. Render each explanation recursively

`analysis.plans[].routes` and top-level `analysis.routes` contain full evaluated routes. `plans[].routeOptions` now also preserves `outcomes`, `tradeoffs`, `evidence`, and `sourceIds`, alongside its existing `id`, `label`, `truth`, `status`, `explanation`, `missing`, `unknown`, and `blockers`. Missing arrays default to `[]`, missing evidence to `null`. Explicit `sourceIds` may be empty while categorized sources exist in `evidence.staticMechanics`, `.sourceReports`, or `.datedMeta.sourceIds`; retain the evidence object.

An explanation node has `{operator,truth,expectedTruth,satisfied}` plus either `children` or `condition`. Operators are `all`, `any`, `not`, `derived`, `condition`, and `unsupported`. Derived nodes additionally carry `id` and `label`. The following projection of a synthetic expression `all(any(A,B),not(C))` shows the exact tree fields; condition definition metadata is omitted:

```json
{
  "operator":"all", "truth":false, "expectedTruth":true, "satisfied":false,
  "children":[
    {"operator":"any", "truth":true, "expectedTruth":true, "satisfied":true,
     "children":[
       {"operator":"condition", "truth":true, "expectedTruth":true, "satisfied":true,
        "condition":{"id":"A","label":"A holds","truth":true}},
       {"operator":"condition", "truth":false, "expectedTruth":true, "satisfied":false,
        "condition":{"id":"B","label":"B holds","truth":false}}
     ]},
    {"operator":"not", "truth":false, "expectedTruth":true, "satisfied":false,
     "children":[
       {"operator":"condition", "truth":true, "expectedTruth":false, "satisfied":false,
        "condition":{"id":"C","label":"C holds","truth":true}}
     ]}
  ]
}
```

This route needs C to be false. B is not an outstanding requirement because its OR group is already satisfied. In an unresolved-only view, stop descending whenever `satisfied === true`. Keep unsatisfied group boundaries. At leaves, show the expected value and actual value; a raw true fact under NOT can fail its requirement. Unknown remains unresolved regardless of expectation.

Group labels must respect expectation: `all` expecting true requires all true; `all` expecting false requires at least one false; `any` expecting true requires at least one true; `any` expecting false requires all false. A `not` node already inverts its child's `expectedTruth`; do not invert it again. Expand `derived` through its child and show unsupported expressions as unresolved.

A tree covers **requirements only**. Use the route's returned status, and show `blockers`, `unresolvedBlockers`, and `scopeTruth` from the full evaluated route alongside it. Scope, active blockers, unknown blockers, selection errors, or action conflicts can prevent enablement even when the requirement tree is satisfied. Do not recalculate route status from the tree.

Remove the current bulk “Assume scenario checks hold” control for this integration. Selecting every editable leaf across alternative routes ignores branch choice and negative expectations. Individual ordered controls already suffice for the demonstration.

## 3. Keep outcomes under their routes

Show `route.outcomes` beneath that route's status and evidence, with `route.tradeoffs`. Ordinary Shell Smash's outcome is “Ordinary Shell Smash boosts Attack, Special Attack and Speed without Simple amplification.” The amplified route instead specifies +4 boosts; the White Herb route clears negative stages. A broad setup goal cannot inherit the amplified outcome from its source plan.

The parent's current graph projection links `route:<routeId>` → `YIELDS` → outcome and goals to routes; the old plan-level `targets(id,'YIELDS')` inspector lookup will no longer supply those claims. Prefer evaluated routes for the inspector. Shared conditions now expose `planIds` and `routeIds`; replace scalar `planOf()` assumptions in navigation and collection. Keep all owning goals, or derive them from incidence edges. REQUIRES edges remain navigation links across alternatives.

## 4. Bind requests and exports to one revision

Advance a local input revision immediately on every edit, pin change, reset, or case switch, before debounce. Capture case ID, input revision, graph revision, and an immutable request payload. Accept graph/analysis successes **and errors** only while their captured identifiers still match. Clear pending timers on case switch. After accepting analysis, rerender team and bench as well as map, inspector, and edit log.

Send `expectedGraphRevision: graph.meta.graphRevision` to `/api/analyze`. The parent's current backend returns HTTP 409 for a changed graph; reload and require rechecking assessments. Analysis returns `graph.revision`, `graph.evaluatorRevision`, and `run`; preserve these identities. Local edit count is not a revision identity because undo/reset can reuse it.

Build export from one captured, fresh analysis plus its matching graph and proposal log. Disable export/copy/download while stale or pending; recheck identity after any awaited context fetch. Key context caching by graph/evaluator revision as well as case. `/api/context.latestRun` may refer to another scenario even when `stale === false`; graph freshness does not prove it is the current UI run. Use the captured analysis as authoritative and retain or omit historical runs explicitly.

For both whole-case and collected exports, preserve accepted `scenario`, rejection results, canonical condition states, stable goal/route IDs, recursive explanations, route outcomes/tradeoffs/evidence, and relevant continuations. A minimal safe collected export can carry selected IDs plus the full matching analysis/model; pruning requires retaining all referenced routes, conditions, and sources. Markdown exports must carry the same structured payload or an equivalent recursive rendering. Flattened missing-label strings alone lose the logic.

The parent's compact `/api/context` projection currently retains outcome/explanation fields but still needs to copy the newly available route `evidence`, `sourceIds`, and `tradeoffs` if that compact object is used independently of its model.

## Demonstration gate

The remaining frontend blockers are accepted-state agreement after rejection, nested OR/NOT explanations, route-specific outcomes, and exports that match the displayed revision and retain its evidence. Old-save migration must also preserve chronology. These are observable correctness fixes; no layout redesign is required.

Check a pinned-member rejection; a satisfied OR branch with a failed unused sibling; a true fact that fails a NOT requirement; ordinary versus amplified setup outcomes; and an edit/case switch during a pending response followed by collected export. Existing individual condition controls are sufficient once canonical state and revision binding are used.

Logic contract verification: added one regression that checks compact route outcomes, tradeoffs, explicit source IDs, and categorized evidence against distinct alternatives under the same goal, plus empty-field defaults. `node --test workbench/logic/logic.test.mjs`: **42 passed, 0 failed**. No additional logic contract gap prevents these corrections. Browser verification and the parent's compact-context field copy remain with their owners.
