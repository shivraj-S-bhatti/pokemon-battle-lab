# Adversarial review brief for Claude

Review target: `engine.mjs`, `cases.mjs`, `index.mjs`, and `logic.test.mjs`. The API contract is `../LOGIC_CONTRACT.md`. This is a reasoning workbench over a small authored case bank. It does not yet discover plans from the mechanics catalog.

The core product claim to challenge is whether this structure helps a person and an agent preserve the purpose of an unusual team while finding different mechanisms. Passing truth-table tests establishes neither creative discovery nor useful strategy advice.

## Counterexamples found and fixed in this pass

1. **Forgetting bad news looked like a repair.** Set `timing:false` in the test model, then propose an unrelated item change. Invalidating the old assessment changed the plan from false to unknown, which the original search treated as improvement. Search now requires an actual structural prerequisite to be resolved before calling this a conditional repair. Invalidating unfavorable evidence alone produces no repair.
2. **An alternative hid a broken route.** Remove Air Balloon from Farigiraf while Chimecho stays on the source roster. The Earthquake goal remains unknown through the Levitate route, so goal-only comparison omitted the Air Balloon repair. The result now includes route changes and route-level repair opportunities even when aggregate goal truth stays unchanged.
3. **Negation hid the cause of failure.** Requiring `NOT member:a` while A was selected returned false with an empty missing list. The explanation now carries operator structure, actual truth and expected truth. The failing absence appears explicitly, and a member-removal repair is recognized.
4. **A blanket dependency exception was too broad.** A Torterra edit does not invalidate a specified opponent-caused drop to Milotic, but it can affect Milotic's survival and conversion of the boost. The trigger checks retain their assessments; the conversion check is invalidated. This is still an authored dependency distinction, not a complete causal model.

The regression tests reproduce these inputs. This initial review pass had 31 passing tests. The later Claude review cycle has 41 passing tests; see `CLAUDE_REVIEW_RESPONSE.md` for changes.

## Hardcoded boundaries and open challenges

| Boundary | Concrete challenge | Current behavior and implication |
| --- | --- | --- |
| Three case adapters | Rename the case ID or supply a fourth core. | Unknown cases receive an explicit unmodeled route. The generic evaluator can assess a supplied model, but `analyzeCase` does not synthesize one. |
| Restricted members | Propose a legal support Pokémon absent from the case and its alternatives. | The edit is rejected as unknown. Catalog retrieval and reviewed set admission are outside this module. |
| Restricted edits | Repair Simple Beam with a different carrier or a move absent from the candidate pool. | Search mainly restores source components; its additional authored candidates add the three documented BSS third members or change Earthquake to Headlong Rush. Text alternatives are not executable routes. |
| Two-edit budget | A useful alternative needs three set changes. | It is not searched. The two-edit hard ceiling and the tested-candidate limit are reported. No global minimality is claimed. |
| Finite search order | Put the best candidate after the first 128 combinations. | Default search can miss it. `search.truncated` exposes this; the order is deterministic, not a usefulness ranking. |
| Coarse scenario facts | Mark “both survive to act” true without spreads or a named opponent. | The result is conditional on the supplied assessment. There is no calculator, trace verifier, or epistemic authenticity check. |
| Manual invalidation dependencies | A survival result depends on a teammate omitted from `dependsOn`. | It could incorrectly survive that teammate's edit. Missing dependencies are conservative, but authored incomplete dependencies can be unsound. |
| No joint plan executor | Independently enable two routes requiring different actions by one actor in the same turn. | Conflict checks run within each route only. Separate enabled goals do not certify their simultaneous execution. |
| Board state is not derived | Claim both different Earthquake partners are active in the same pair. | Per-route assumptions can each pass. These are alternatives, not an established joint board. Roster, bring and active pair must remain distinct. |
| Upper selection bounds | Supply an incomplete brought subset. | The evaluator enforces maximum roster/bring counts, not a complete legal team. Route-specific missing participants still fail. |
| Source-plan overconstraints | Use base Sableye's disruption before Mega Evolution. | The authored physical-control route requires Mega activation and Recover. This preserves one intended line and excludes other plausible lines; it is not a universal definition of physical control. |
| No deterrence inference | Milotic can trigger Competitive, but the opponent chooses no stat drop. | Trigger conversion is modeled; changes to opponent incentives are not inferred. |
| No strategic ranking | Compare direct Shell Smash with amplified setup under different opponents. | They retain distinct outcomes and checks. The module cannot decide which is competitively stronger. |
| No independent legality gate | Replace a move with an illegal move string. | Typed editing accepts the string; source mechanics checks update, and edited legality remains unverified. The parent must validate before presenting a legal set. |
| Historical meta | Swap the snapshot month or population. | Static route truth does not change. No usage-to-win conversion exists. The parent must ensure the displayed snapshot matches the intended population. |

## UI/API risks to challenge

`plans[].missing` is a flattened navigation index, not an AND specification. Use `plans[].routeOptions` and each `explanation` tree to display alternative routes and nested groups. Requiring every item from every alternative would reintroduce the central logical error.

`conditions` initializes assessments before the ordered edit list. A new check should be a `set_condition` edit after the relevant set edit. If the UI resends earlier edits after a newer checkbox assessment, the engine will invalidate it again. Preserve chronology or revise the boundary deliberately; do not silently bypass invalidation.

A repair can reopen a specific route while its goal remains unknown. Display `routeImprovements` and `resolvedStructural`, alongside `unresolved`. The labels describe modeled availability, not a predicted improvement in win rate.

Please distinguish a concrete correctness bug, a case-model omission, and a future discovery capability. For a concrete finding, record the input, current output, expected output and supporting source or invariant in a review file under `workbench/`; leave implementation changes in `logic/` to its owner.
