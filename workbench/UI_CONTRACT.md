# UI contract

Owner: Claude (`workbench/public/`). Backend and validation: parent Codex. Reasoning: logic collaborator (`workbench/logic/`, see `LOGIC_CONTRACT.md`). This file states what the frontend reads and sends. It replaces `FRONTEND_CONTRACT_REQUEST.md` where they differ.

The frontend is static (`index.html`, `styles.css`, `app.js`, `assets/`), served from `/` with the API on the same origin. No build step, no external requests except sprite images bundled in `assets/`.

## Identifiers

One ID space, shared by graph, analysis and export:

| Thing | ID | Example |
|---|---|---|
| Team member | canonical species ID from the case | `sableyemega` |
| Set | set ID from the case | `torterra-guard` |
| Plan | plan ID from the case (= logic plan ID) | `wideguard-window` |
| Condition (a plan prerequisite) | the logic condition ID | `beam-smash:survival` |
| Everything else | `<kind>:<id>` | `source:engine`, `alt:farigiraf-priority-control` |

The condition IDs the UI toggles must be the ones `POST /api/analyze` accepts in `conditions` and returns in `plans[].missing/unknown/blockers`. If the backend renames anything, keep this table true.

## GET /api/cases

```json
{"cases":[{"id","title","format","battleMode","bringSize","status","summary","question"}]}
```

## GET /api/graph?case=ID

```json
{
  "case": {"id","title","format","battleMode","rosterSize","bringSize","regulation","status",
           "question","summary","warnings":[],"nextCalculations":[],"hypotheses":[]},
  "team": ["speciesId"],
  "sets": [{"id","speciesId","name","itemId","abilityId","moveIds":[],"status","spreads"}],
  "species": [{"id","name","types":[],"abilities":{}}],
  "nodes": [{"id","kind","label","description?","status?","truth?","sourceIds?":[],"planId?"}],
  "edges": [{"id","source","target","type"}],
  "sources": [{"id","title","url","kind"}],
  "meta": {"engineRevision","snapshot":{"id","month","mode","population","cutoff","reportedBattles","meaning","topThreats":[]}}
}
```

Condition nodes carry `assumable`: `true` for scenario facts the player can assume (logic predicate `condition`), `false` for structural facts computed from team and sets (membership, move, item, ability). The UI shows ✓ ? ✗ toggles only on assumable conditions.

Node kinds the map lays out: `member`, `plan`, `condition`, `counter` (a failure case), `outcome`, `mechanism`, `alternative`, `source`. Unknown kinds appear in the inspector but not on the map.

Edge types: `USES` (plan → member or mechanism), `REQUIRES` (plan → condition), `BREAKS_IF` (plan → counter), `YIELDS` (plan → outcome), `SUPPORTED_BY` (plan → source), `ALTERNATIVE_FOR` (alternative → plan).

`team` is the source roster. `species` must include alternative species so "try in team" can show them.

## POST /api/analyze

Request:

```json
{"caseId","team":["speciesId"],"conditions":{"conditionId":true|false|"unknown"},
 "interventions":[{"type":"set_item","setId","itemId"}],"pinned":["speciesId|setId"]}
```

Assumptions are sent as `set_condition` edits inside `interventions`, in the order the player made them; `conditions` is always `{}`. This keeps the logic's invalidation correct when an edit follows an assumption. The UI reads effective truth back from `scenario.conditions`.

`interventions` uses the logic edit types verbatim (`remove_member`, `add_member`, `set_item`, `set_ability`, `replace_move`, `set_condition`). The UI sends the full ordered list each time; the backend applies it to a fresh copy of the case.

Response: the logic output passed through. Fields the UI reads:

- `plans[]`: `id`, `label`, `status`, `truth`, `routeOptions[{id,label,status,explanation}]` (shown per route; a plan needs any one route), `evidence`. Flat `missing`/`unknown`/`blockers` are used only as a fallback and for the unchecked-assumptions list.
- `repairs[]`: also `routeImprovements`, `resolvedStructural`. Identical edit sets across goals are shown once; a repair that only restores a source component is labeled "undo" and listed last.
- `comparison`: `changes[{id,label,before,after}]`, `restored`, `lost`, against the unedited case.
- `repairs[]` and `repairGroups[{purpose,goalId,repairs}]`: `id`, `label`, `purpose`, `edits[]`, `restored`, `improved`, `lost`, `unresolved`, `tradeoffs`, `status`.
- `alternatives[]`: `id`, `purpose`, `description`, `tradeoffs`, `status`.
- `interventionResults[{edit,applied,reason}]`, `summary` (string or object), `search`.

## GET /api/context?case=ID

Any JSON the backend wants an agent to see. The UI wraps it with the current revision (team, interventions, conditions, selected node IDs, latest analysis) when the user exports.

## Requests to the backend

1. Use logic condition IDs as condition node IDs.
2. Return `planId` on condition, counter and outcome nodes so the map can group them under their plan.
3. Include alternative species in `species`.
4. Return 4xx with `{"error": "..."}`; the UI shows the message and a retry.
