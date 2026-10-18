# Claude review of `workbench/logic/`

Requested in `logic/REVIEW_NOTES.md`. Reviewed `cases.mjs`, `engine.mjs`, `index.mjs`, `mechanics.mjs` and the tests on 2026-10-18. `node --test workbench/logic/logic.test.mjs` passes 31/31. Probes call `analyzeCase` directly with the case records in `data/workbench-cases.json`. Mechanics claims were checked against the cached pinned Showdown revision (`.cache/showdown`). Implementation changes stay with the logic owner.

Shivraj, 2026-10-18: do not add tests now; tests get written at the end of a development cycle. The inputs below are for reproducing by hand.

Findings are grouped as the brief asks: correctness bugs, case-model omissions, future capability.

## Correctness bugs

### C1. A third-member assessment survives a swap of the third member

Input (`sableye-slowking-bss`, default roster mode):

```js
interventions: [
  {type:'add_member', speciesId:'corviknight'},
  {type:'set_condition', conditionId:'three-slot-progress:progress', truth:true},
  {type:'set_condition', conditionId:'three-slot-progress:opponent', truth:true},
  {type:'set_condition', conditionId:'three-slot-progress:bring', truth:true},
  {type:'remove_member', speciesId:'corviknight'},
  {type:'add_member', speciesId:'garchomp'},
]
```

Current: `three-slot-progress = enabled`; the scenario still holds `progress: true`. Expected: `progress` and `bring` invalidate to unknown when the third member changes, so the plan returns to unknown. "The third member has a checked progress line" is about whichever Pokémon fills slot three.

Cause: `fact()` sets `dependsOn` from the source plan's `participants` (`sableyemega`, `slowkinggalar`). The third slot is never a participant, so edits to it never invalidate. Invariant: an assessment must depend on every member its label refers to. Same pattern to check: any fact whose label says "selected", "third", "partner" or "active" refers to a slot, not a fixed species.

### C2. White Herb is modeled as required for the +4 boost

Input (`simplebeam-torterra`): `{type:'set_item', setId:'torterra-smash', itemId:'sitrusberry'}`.

Current: `beam-smash` goes unknown → false (blocked), and the only repair restores White Herb.

Expected: the amplified route still produces +4 Attack, Special Attack and Speed. Shell Smash under Simple gives +4 / +4 / +4 and -2 / -2 defenses whether or not White Herb is held. The engine's White Herb (`data/items.ts:7664`) only resets negative boosts after they apply; it does not gate the raise. Without it the route stays open with an added tradeoff: Torterra keeps -2 Defense and -2 Special Defense. This mirrors how the adapter already treats Choice Scarf and Inner Focus as `enablers` rather than requirements.

Suggested shape: White Herb as an enabler of a "defenses restored" outcome (or a separate goal), not an AND prerequisite of `beam-smash:amplified`. The source prerequisite list includes it, so this is also a reminder that a practitioner's list of what they relied on is not the same as what the mechanic requires.

### C3. Two-edit repairs that are supersets of one-edit repairs survive pruning

Input (`simplebeam-torterra`): remove both `farigiraf` and `chimechomega`.

Current: for `earthquake-partner`, repairs include `add farigiraf`, `add chimechomega` and the pair `add farigiraf + add chimechomega`. All three move the goal false → unknown. Same for `trickroom-fallback` and the ground purpose. Ten repair entries, four distinct edit sets.

Expected per the contract ("retain subset-minimal improvements for each goal"): the pair is dropped for each goal where a single edit reaches the same goal truth. If the pair is kept on purpose because it reopens two routes, the repair should say so (`routeImprovements` lists both) so the UI can explain the extra slot.

## Case-model omissions

### M1. The Sableye case's own question gets no repair

Baseline `sableye-slowking-bss`: `three-slot-progress` is blocked (two members, needs three) and `repairs` is empty. The case question is "Which third member turns the cycle into progress?", and the case lists Corviknight, Garchomp and Primarina as alternatives. Restoration only proposes components that were in the source team, so the obvious edits `add_member corviknight | garchomp | primarina` are never tested. Expected: three repairs for `three-slot-progress`, each false → unknown, with the alternative's `cost` attached as a tradeoff. Adding alternatives from `record.alternatives` to `candidateEdits` for goals that need membership would cover it.

### M2. Repairs mostly undo the user's edit

Removing Simple Beam proposes "put Simple Beam back"; removing White Herb proposes "put White Herb back". These are correct and useless to a player who removed the component deliberately. The hypothesis under test is that purpose-organized retrieval finds a different mechanism. Today the one authored non-restoration candidate is Earthquake → Headlong Rush. Suggest ranking restorations last, or labeling them "undo", so the alternative mechanisms (direct Shell Smash, Decorate, Levitate partner) lead.

### M3. Restored-goal routes for Torterra's boost already exist but are not offered as repairs

After Simple Beam is removed, `purpose:boost-torterra` stays unknown through the `direct` and `decorate` routes, which is right. Nothing in `repairs` or the summary tells the player "this purpose survives through ordinary Shell Smash and Decorate, at smaller boosts". `routeOptions` carries it, so this is mostly a presentation point, but an agent reading only `repairs` would miss it.

## Mechanics checked and correct

- Mega Raichu Y is Electric with No Guard; Mega Sableye is Dark/Ghost with Magic Bounce; Mega Chimecho is Psychic/Steel with Levitate (`data/pokedex.ts`).
- Decorate has no `protect` flag, so it passes through Protect (`data/moves.ts`, flags `{allyanim:1}`).
- Simple Beam is `protect` and `reflectable`, and fails into Simple or Truant (`onTryHit`). Ally Protect blocks it, as the case says.
- Redirection: Rage Powder's `onFoeRedirectTarget` fires on any single-target move from the opposing side, including one aimed at the user's ally, unless the user is powder-immune. So "opposing redirection can steal a redirectable ally-targeted move" is right for Simple Beam and for the Banette Swagger line.
- Changing Torterra's ability has no effect on `beam-smash`, correctly, because Simple Beam overwrites it.

## Future capability (not bugs)

- Repairs cannot reach species or moves outside the case. The interesting answers to "protect Clawitzer" live there. This is the job of the agent with catalog retrieval, as the product framing now says.
- No joint executor across goals, no calculator, no opponent incentives. Already listed in the brief; nothing to add.

## UI integration notes (owner: Claude, being fixed in `public/`)

- The UI sent condition toggles as a `conditions` map ahead of the edit list, so an assumption made after an edit was invalidated by that edit on every resend. The UI now records each toggle as a `set_condition` edit in chronological order.
- The UI showed `plans[].missing` as a flat list. It will switch to `routeOptions` so OR routes are not read as one AND.
- Identical edit sets across goals will be shown once, with every goal they affect.
