# Gimmikghoul reasoning layer

Delivery: local, uncommitted. The parent collaborator owns backend/FalkorDB integration; Claude owns the UI. Import `analyzeModel` from `index.mjs` for the FalkorDB-reconstructed model, or `analyzeCase` for a source case record. The full JSON boundary is in [LOGIC_CONTRACT.md](../LOGIC_CONTRACT.md).

Claude review dispositions are in `CLAUDE_REVIEW_RESPONSE.md`; current frontend/backend findings are in `UI_REVIEW.md`.

The module assesses explicit route prerequisites with three-valued logic. Each route requires its AND expression; a goal needs one complete alternative route. Missing battle-state evidence remains unknown. An enabled result means the modeled requirements pass under the supplied assessments, not that a team wins.

The case adapter reads the supplied case record without mutation. It preserves source-plan IDs and adds two shared-purpose goals for Torterra. This lets ordinary setup remain available after Simple Beam is removed without claiming the amplified outcome survives. Ground-pressure repairs can restore Air Balloon, select the recorded Levitate partner, or propose replacing Earthquake with a single-target move, with new checks and costs attached.

Changed configurations invalidate dependent speed, survival and board assessments. Unrelated Milotic trigger checks survive a Torterra move edit. Pins, roster/bring limits, action-slot conflicts, format scope, and unsupported or cyclic predicates are handled explicitly. The bounded search tests at most two edits, never fills unknown battle conditions with favorable assumptions, and returns its search limit and truncation state.

Run the checks:

```sh
node --test workbench/logic/logic.test.mjs
```

The latest local run passed 41 tests. Coverage includes exhaustive three-input truth tables, incomplete AND routes, alternate OR routes, missing evidence, cycles, action conflicts, scope mismatches, immutable interventions, pinned choices, invalidated checks, subset-minimal repairs, lost roles, and the actual three case records. Mechanics regressions cover Mega Raichu Y losing Lightning Rod, No Guard not benefiting an unrelated allied attacker, and Competitive requiring an opponent-caused drop to its active holder.

No battle simulations, damage calculations, full team legality validation, or database calls run in this module. The tests validate the reasoning implementation and the explicitly modeled distinctions. They do not independently reproduce the practitioner teams or establish competitive efficacy. Additional alternative species remain research candidates until their sets, routes and conditions are supplied. The search is minimal only within its tested edit universe and per goal/truth outcome.

Integration details that matter:

- Keep canonical species IDs, set IDs and logic condition IDs unchanged across graph, UI and analysis.
- A source roster is not the selected bring or active pair. `selectionMode: 'bring'` enforces the case's bring count; active-board facts still need checks.
- Only scenario predicates accept condition overrides. Team membership and move/item/ability configuration are evaluated from the scenario.
- `conditions` precedes `interventions`. Append a new `set_condition` after edits when recording a recheck.
- Source context is the default. Explicitly projecting doubles into singles blocks those routes.
- Alternative source participants can be OR choices. Use the typed route expressions rather than interpreting every name in a source plan as jointly required.
- Individual source-set validator results are not carried forward as certification for edited combinations.

Sources: `data/workbench-cases.json`, `research/WORKBENCH_CORE_CASES.md`, `research/GRAPH_WORKBENCH_HYPOTHESES.md`, and the repository's original storyboard review. The source bank's evidence and meta records remain owned by the evidence collaborator.

The broader coordination record is SSB Agency issue #5. No issue comments, commits, pushes, backend edits, or UI edits were made by this collaborator after the role change. The parent should record this local handoff with its integration delivery status.
