# Reasoning API contract

Implementation: dependency-free ES modules in `workbench/logic/`. Import `analyzeCase` from `workbench/logic/index.mjs` and call:

```js
const result = analyzeCase(caseRecord, {
  team: caseRecord.speciesIds,
  conditions: {},
  interventions: [],
  context: { battleMode: caseRecord.battleMode, format: caseRecord.format },
  pinned: [],
  maxEdits: 2,
  maxCandidates: 128
});
```

`caseRecord` is one entry from `data/workbench-cases.json`. `team` contains canonical species IDs from that case (for example `sableyemega`), not presentation graph IDs. Omission uses the case's roster; an explicit empty list selects nobody. This is a roster by default, not the brought subset or active board. Set `selectionMode: 'bring'` to enforce `bringSize`; active positions remain explicit conditions. The backend must translate presentation IDs before calling this function.

`conditions` maps stable condition IDs to `true`, `false`, or `"unknown"`. A value may instead be `{truth, basis, sourceIds, context}`. Overrides are scenario assumptions unless labeled with a supplied evidence basis; they never mutate source claims. Conditions and required IDs are included in the returned model and evaluations. Missing assessments are unknown.

Interventions are typed, sequential edits to a copy:

```js
{type:'remove_member', speciesId:'farfetchd'}
{type:'add_member', speciesId:'farfetchd'}
{type:'set_item', setId:'torterra-smash', itemId:'sitrusberry'}
{type:'set_ability', setId:'farfetchd-beam', abilityId:'keeneye'}
{type:'replace_move', setId:'farfetchd-beam', from:'simplebeam', to:'protect'}
{type:'set_condition', conditionId:'beam-smash:survival', truth:false}
```

Invalid or pinned edits are reported and not applied. `pinned` accepts species IDs or set IDs. Candidate edits are scoped to the supplied model; this module is not a full legality validator. Restoring a known set component retains its original evidence, but edited combinations require a separate validator. Alternative species named by the case are accepted as candidate members, even when no complete set has been supplied; their inclusion does not certify legality or their strategic role.

Ordering matters: `conditions` initializes assessments before the ordered `interventions` list. A changed member or set invalidates scenario checks whose `dependsOn` includes that member. Conditions without dependency metadata are conservatively invalidated. To record a fresh assessment after a change, append a `set_condition` intervention after that change. This prevents a checked survival or speed claim from silently carrying across a different configuration. Unrelated checks remain intact. An API/UI that resends an edit history must preserve this order.

Output:

```js
{
  plans: [{id,label,status,truth,routes,missing,unknown,blockers,evidence}],
  repairs: [{id,label,purpose,goalId,edits,add,remove,status,
    restored,improved,lost,unresolved,conditions,tradeoffs,evidence,legality}],
  repairGroups: [{purpose,goalId,repairs}],
  alternatives: [{id,purpose,description,tradeoffs,status,evidence}],
  summary, scenario, interventionResults, comparison, model, search
}
```

Truth is `true`, `false`, or `"unknown"`; route statuses are `enabled`, `blocked`, or `unknown`. AND requires every prerequisite; OR permits one complete route. Empty or unsupported expressions are unknown. Cyclic references and unsupported predicates remain unknown with diagnostics. Contradictory action-slot requirements block a route. Format mismatch blocks execution; absent context is unknown for scoped checks.

Repairs enumerate at most two edits within `maxCandidates`, group by strategic goal, and retain subset-minimal improvements for each goal truth. A tested subset reaching the same goal truth excludes its supersets; opening extra routes alone does not justify extra edits. `search.supersetsPruned` counts those exclusions. `restored` lists goals that became true; `improved` includes false-to-unknown goal changes. A conditional repair must resolve a structural prerequisite; invalidating an unfavorable runtime assessment alone is not a repair. `routeImprovements` and `resolvedStructural` identify the actual route and requirement changes, including repairs whose aggregate goal truth stays unchanged because another alternative exists. These are explicitly conditional, never confirmed battle improvements. Unresolved scenario checks, lost goals, and tradeoffs remain attached. Search truncation and tested candidate counts are returned; no global optimality claim is made.

Evidence remains separated into static mechanics, observed/source reports, dated aggregate meta, and hypotheses. Meta period does not change a mechanic. No matchup, novelty, win-probability, or efficacy score is generated. No database access or files are mutated by this module.

Route outcomes are authored explicitly in the case adapter. A source plan's outcome list can describe multiple mechanisms and is never inherited automatically by a route. Unmodeled fallback routes have no executable outcome claims; their source text remains available in the case record.

`comparison` uses the source roster and source sets with the same initial assessments/context as its baseline, so direct team toggles are included. It exposes `changes`, `restored` (became true), `lost` (was true, now false or unknown), `improved` (false to unknown), and `worsened` (unknown to false). Inspect the before/after truth values; losing a checked assessment is different from proving failure.

Additional modeled purpose goals in the Simple Beam case are `purpose:boost-torterra`, `purpose:ground-without-friendly-fire`, and `purpose:restore-smash-defenses`. White Herb is required for the modeled defense-clearing route, not for Simple’s amplified boosts. They connect alternative mechanisms without pretending ordinary Shell Smash restores the amplified `beam-smash` outcome. The source-plan goals retain their original IDs. `model.routes[].goalId` and `requirements` define AND/OR structure; do not flatten all source `participants` or all route prerequisites into a single AND.

Each evaluated route returns an `explanation` tree (`operator`, `truth`, `expectedTruth`, `satisfied`, and `children` or `condition`). Negated requirements retain both `actualTruth` and `expectedTruth` in their missing records. Each plan returns `routeOptions` with per-route explanations, `outcomes`, `tradeoffs`, `evidence`, and `sourceIds`. These fields preserve that route's claims and provenance; absent arrays are empty and absent evidence is null. `sourceIds` preserves an explicit route field, while categorized references also remain in `evidence`; an empty `sourceIds` does not mean the evidence object has no sources. Outcomes remain conditional on the route's evaluated status and assumptions. Plan-level `missing`, `unknown`, and `blockers` are flattened navigation indexes across alternatives, not a universal conjunction. `comparison.routeChanges` preserves route changes hidden by aggregate OR evaluation.

For the live backend, import `analyzeModel(model, options = {})` from `index.mjs`. It evaluates the model reconstructed from FalkorDB directly and returns `caseId: model.id`; it does not rebuild a case adapter. `analyzeCase(record, options)` is a convenience wrapper around `buildCaseModel` followed by `analyzeModel`.

Exports also include `buildCaseModel`, `initialScenario`, `intervene`, `assessModel`, `compareAssessments`, and `findRepairs` for graph integration and incremental checks. `model.conditions` supplies the stable IDs, labels, predicates and dependency metadata for condition nodes. Only conditions with `predicate: 'condition'` accept scenario toggles; membership and set facts are computed. Three narrow mechanics helpers cover No Guard accuracy checks, Competitive triggers, and the ability assigned to a Raichu form. They do not resolve full battles or ability suppression.

Validation command: `node --test workbench/logic/logic.test.mjs`. Current local result: 41 passing tests, zero failing tests. See `workbench/logic/README.md` for the checked cases and remaining integration boundary.

Ongoing progress is in `workbench/logic/PROGRESS.md`. Claude's adversarial review brief, with explicit counterexamples and generalization limits, is `workbench/logic/REVIEW_NOTES.md`.

Parent integration owns backend routes and FalkorDB. Claude owns `workbench/public/`. This collaborator owns only this contract, `workbench/logic/`, and its tests.


## Review-cycle additions for integration

`conditionStates` maps every condition ID to its canonical evaluated record, including optional enablers not encountered in route requirements. Records include `truth`, `editable`, `basis`, and `assessmentStatus` (`computed`, `stale`, `out_of_scope`, `unassessed`, `assumed`, or `provided_evidence`). Use `editable === true` for assumption controls, and the evaluated state after edits for checkmarks. A supplied evidence label is attribution, not independent verification by this module.

Unknown IDs, computed/derived facts, and malformed truth values in the initial `conditions` map are rejected explicitly in `conditionInputResults[{id,applied,reason?}]`. They are not retained as effective assumptions. `set_condition` interventions enforce the same computed/derived boundary.

`repairs[].repairKind` is `alternative`, `mixed`, or `restore_source`. This categorization orders alternatives before source restoration without assigning strategic value. Authored candidate edits may contain `proposal` metadata with a goal, purpose, evidence and costs; the evaluator preserves those costs in the relevant repair's `tradeoffs` and `proposals`. The BSS case includes its three documented third-member hypotheses in this candidate pool.

`comparison.retainedRoutes` and its top-level alias `continuations` identify alternatives that remain open/unknown after another route for the same purpose becomes blocked. Each includes its own outcomes, tradeoffs and unresolved checks. It is a continuation to inspect, not a certified replacement.

Claude's findings are resolved in `workbench/logic/CLAUDE_REVIEW_RESPONSE.md`; remaining UI/backend presentation mismatches are recorded in `workbench/logic/UI_REVIEW.md`. Reseed the stored graph after these adapter changes so the new defense-clearing goal and third-member candidates are present.
