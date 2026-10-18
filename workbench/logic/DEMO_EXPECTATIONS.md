# Demo acceptance oracle

Use a fresh source scenario for each named fixture below. Requests replay the complete ordered intervention list, not a delta from the previous response. Use `conditions:{}`, `pinned:[]`, `selectionMode:'roster'`, and omit `team` to use the case's source roster. For HTTP requests, obtain `expectedGraphRevision` from that case's current `/api/graph` response; do not hardcode a revision. These expectations were evaluated with the actual logic at commit `261cf18`.

All listed edits must return `interventionResults[].applied === true`; their `invalidated` arrays are empty for these fresh fixtures. `selectionErrors` must be empty. These results do not validate an edited set/team or establish a battle outcome. `unknown` means an assessment remains open; `enabled` means the modeled requirements pass, including any explicitly supplied assumptions. The optional true assessments below are hypothetical demo inputs, not newly obtained evidence. No battle simulations are run.

## 1. BSS: add a third without claiming progress is solved

Case: `sableye-slowking-bss`. Compare B0, `interventions:[]`, with B1:

```json
{
  "caseId":"sableye-slowking-bss",
  "conditions":{}, "pinned":[], "selectionMode":"roster",
  "interventions":[{"type":"add_member","speciesId":"garchomp"}]
}
```

| Route ID | B0 | B1 | Exact route outcome |
| --- | --- | --- | --- |
| `fairy-pivot:reception` | unknown | unknown | Slowking exits through Chilly Reception and Regenerator restores health on switching out. |
| `fairy-pivot:switch` | unknown | unknown | Slowking switches manually to the checked destination and Regenerator restores health on switching out. |
| `physical-control:burn` | unknown | unknown | The target is burned, reducing damage from its burn-sensitive physical attacks. |
| `physical-control:foulplay` | unknown | unknown | Foul Play uses the target’s Attack for damage against the checked target. |
| `three-slot-progress:design` | blocked | unknown | The selected third member has a checked progress line against the specified opposing six. |

B1 acceptance:

- `scenario.team` is exactly `['sableyemega','slowkinggalar','garchomp']`.
- `conditionStates['three-slot-progress:third-member'].truth === true`; this condition is computed and not editable.
- `three-slot-progress:opponent`, `three-slot-progress:bring`, and `three-slot-progress:progress` remain unknown. The outcome text is conditional on those checks; it is not a report that they passed.
- Goal `three-slot-progress` changes from blocked to unknown; both other goals remain unknown. No goal is enabled. Adding the candidate does not supply a Garchomp set or establish a legal bring.

The useful demo question is: “What still has to be checked before this third member makes progress?” The answer must identify the opponent, bring, and progress assessments rather than declare Garchomp the best third.

## 2. Simple Beam: lose amplification, retain ordinary setup

Case: `simplebeam-torterra`. S0 uses no interventions. S1 removes Farfetch’d:

```json
{
  "caseId":"simplebeam-torterra",
  "conditions":{}, "pinned":[], "selectionMode":"roster",
  "interventions":[{"type":"remove_member","speciesId":"farfetchd"}]
}
```

| Route ID | S0 | S1 |
| --- | --- | --- |
| `beam-smash:amplified` | unknown | blocked |
| `purpose:boost-torterra:beam` | unknown | blocked |
| `purpose:restore-smash-defenses:whiteherb` | unknown | blocked |
| `purpose:boost-torterra:direct` | unknown | unknown |
| `purpose:boost-torterra:decorate` | unknown | unknown |

The other routes remain unchanged: `earthquake-partner:levitate`, `earthquake-partner:balloon`, `decorate-mode:base`, `decorate-mode:simple`, both `trickroom-fallback` setter routes, `ground:earthquake-partner:levitate`, and `ground:earthquake-partner:balloon` are unknown. `purpose:ground-without-friendly-fire:targeted` remains blocked because Headlong Rush is absent.

S1 acceptance:

- Accepted team is `['torterra','farigiraf','chimechomega','alcremie','arbok']`.
- The three newly blocked routes contain `member:farfetchd` in `missing`.
- Goals `beam-smash` and `purpose:restore-smash-defenses` are blocked; the other five goals remain unknown. The defense goal specifically models clearing the **amplified** Shell Smash drops; its failure says nothing about an unmodeled ordinary Shell Smash + White Herb route.
- `continuations` has one entry for `purpose:boost-torterra`, whose alternatives are `purpose:boost-torterra:direct` and `purpose:boost-torterra:decorate`, both unknown.
- The direct route has only `direct-smash:window` unresolved. Its exact outcome is “Ordinary Shell Smash boosts Attack, Special Attack and Speed without Simple amplification.” Its tradeoff is “Smaller boosts than the Simple route. Defense drops remain unless an effective clearing mechanism is present.”
- The amplified routes retain their conditional outcome text: “Simple amplifies Shell Smash to +4 Attack, Special Attack and Speed; defense drops are -2 before any clearing effect.” A blocked route must not present this as achieved.
- The defense-clearing route's exact outcome remains “White Herb clears negative stat stages when it activates; it does not create the amplified boosts.” It stays blocked in S1 and S2.
- The Decorate continuation says “Decorate boosts its ally and can pass through Protect. Amplification requires Simple to be active.” Its outstanding check is `decorate-mode:execution`.

Optional S2 closes one explicitly hypothetical check. Send the complete list:

```json
[
  {"type":"remove_member","speciesId":"farfetchd"},
  {"type":"set_condition","conditionId":"direct-smash:window","truth":true}
]
```

Expected changes from S1: `purpose:boost-torterra:direct` and goal `purpose:boost-torterra` become enabled, with `conditional === true`. The assessment has `basis:'scenario_assumption'` and `assessmentStatus:'assumed'`. The amplified routes and amplified defense-clearing route stay blocked; Decorate stays unknown. All other route statuses are unchanged. Continuations still list direct and Decorate, now enabled and unknown respectively. Do not describe this input as a verified safe setup turn.

## 3. Y-chu doubles: preserve the distinction between guard and Ground routes

Case: `torterra-raichuy-milotic`. The source Torterra set `torterra-guard` contains `wideguard`, `headlongrush`, `woodhammer`, and `protect`.

Y0 uses `interventions:[]`. Y1 swaps the Ground move while keeping Wide Guard:

```json
{
  "caseId":"torterra-raichuy-milotic",
  "conditions":{}, "pinned":[], "selectionMode":"roster",
  "interventions":[
    {"type":"replace_move","setId":"torterra-guard","from":"headlongrush","to":"earthquake"}
  ]
}
```

Y2 is a separate fork from the source, replacing Wide Guard instead:

```json
[
  {"type":"replace_move","setId":"torterra-guard","from":"wideguard","to":"earthquake"}
]
```

| Route ID | Y0 | Y1 | Y2 |
| --- | --- | --- | --- |
| `wideguard-window:spread` | unknown | unknown | blocked |
| `intimidate-deterrence:competitive` | unknown | unknown | unknown |
| `avoid-friendly-fire:headlong` | unknown | blocked | unknown |
| `avoid-friendly-fire:protect` | blocked | unknown | unknown |

Exact route outcomes:

- `wideguard-window:spread`: “Wide Guard blocks the specified opposing spread move for the side.” and “Mega Raichu Y executes Zap Cannon against the susceptible target with No Guard removing its accuracy check.”
- `intimidate-deterrence:competitive`: “Competitive can trigger on an opponent-caused stat drop to Milotic. Deterrence and damage conversion still require separate evidence.”
- `avoid-friendly-fire:headlong`: “The chosen Ground move does not damage the ally. This does not establish a KO.”
- `avoid-friendly-fire:protect`: “The protected ally avoids this Earthquake if its protection remains effective.”

Y1 acceptance: all three goals remain unknown and `comparison.changes` is empty, even though the Ground routes change. `continuations` identifies `avoid-friendly-fire:protect` under goal `avoid-friendly-fire`. Its unresolved checks are `avoid-friendly-fire:ground-action` and `avoid-friendly-fire:protect-execution`. The eligible partner condition is Raichu Protect **or** Milotic Protect, not both. Its tradeoffs are “Protect spends the partner’s action. Spread damage can be blocked by opposing Wide Guard.”

Y2 acceptance: `wideguard-window:spread` is missing `move:torterra:wideguard`, and goal `wideguard-window` becomes blocked. Both Ground routes remain unknown. These are alternative executable lines to inspect, not proof that Torterra uses Wide Guard and attacks in the same turn. The model does not solve a joint active board or validate the edited move combination.

For Y0/Y1, the guard route retains four unknown checks: `wideguard-window:spread`, `wideguard-window:guard-action`, `wideguard-window:raichu-action`, and `wideguard-window:target`. Competitive retains its active-holder, opponent-drop, and conversion checks. No Guard is not an allied accuracy aura, and merely selecting Milotic does not trigger Competitive.

Optional Y3 extends Y1 with hypothetical execution assumptions:

```json
[
  {"type":"replace_move","setId":"torterra-guard","from":"headlongrush","to":"earthquake"},
  {"type":"set_condition","conditionId":"avoid-friendly-fire:ground-action","truth":true},
  {"type":"set_condition","conditionId":"avoid-friendly-fire:protect-execution","truth":true}
]
```

The Protect route and friendly-fire goal become enabled and conditional. Headlong Rush stays blocked; Wide Guard and Competitive stay unknown. The accepted move edit still needs separate legality validation. Place checks after the move edit so they apply to the edited scenario.

## Recommended human–agent loop

Use S1 → S2 for the short reasoning demonstration:

1. Human removes Farfetch’d and exports the accepted scenario with the boost goal, route explanations, and continuations. Ask: “Keep Farfetch’d out. What setup remains, and what must I check?”
2. Agent identifies ordinary Shell Smash and its smaller boost outcome, retains Decorate as another uncertain option, and names `direct-smash:window`: Torterra must have an executable setup turn and survive to use the boosts. It should not propose restoring Farfetch’d as the only solution.
3. Human explicitly chooses the hypothetical safe-window assumption. Apply S2's ordered `set_condition` edit and compare the same goal and its routes. Export the accepted result and assumption attribution together.

The insight to show: a broken mechanism can coexist with a surviving purpose, and the surviving route has a different result and cost. S1 keeps the broader boost goal unknown while amplification is blocked; S2 enables only the ordinary route under the chosen assumption. For a brief second example, Y1 shows why route-level comparison matters: the goal status is unchanged even though the safe Ground line switches from Headlong Rush to ally Protect.

Acceptance check: `demo.mjs` and `DEMO.md` have no material mismatch with this oracle; all eight saved scenarios and 22 retained route records in `evidence/demo-run.json` match local logic replay, including accepted teams, rejection/assumption results, statuses, outcomes, unresolved checks, and evidence; recording remains pending.
