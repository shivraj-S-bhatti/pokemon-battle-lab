# Gimmikghoul: make the team's reasoning editable

Build a small graph that lets a player inspect a plan, change a premise, and explore ways to repair it. The useful hypothesis is that an agent with explicit dependencies finds more relevant alternatives and notices more tradeoffs than an agent reading disconnected team descriptions. The current implementation should make that interaction work before adding a learned evaluator or large battle search.

This note proposes the workbench schema and queries. It follows the existing [algorithm decision](GRAPH_ALGORITHM_DECISION.md), [temporal model](TEMPORAL_MODEL_OPTIONS.md), and [PokeSynergy inspection](POKESYNERGY_HANDS_ON.md). The competitor inspection already found useful matchup calculations and teammate recommendations. Our next comparison should therefore ask whether a change preserves the team's intended plan, rather than compare basic coverage charts.

## Five useful hypotheses

| Hypothesis | Interaction to build | Signal worth watching |
|---|---|---|
| Organizing alternatives by purpose expands creative suggestions. | Click “survive to act”; explore redirection, mitigation, disruption, speed control, or a different board arrangement. | Suggestions include meaningfully different mechanisms, with their costs and required conditions. |
| Explicit AND prerequisites prevent plausible but broken combos. | Change an item or ability and watch the affected route become blocked or uncertain. | The system identifies the actual missing prerequisite without invalidating unrelated plans. |
| Small repairs preserve the player's idea better than wholesale replacement. | Pin the core; ask for one-slot or one-move repairs. | A useful repair restores a route while exposing the roles it sacrifices. |
| Scoped evidence prevents strategy advice from leaking across formats and dates. | Switch from doubles to BSS or change the metagame snapshot. | Inapplicable routes disappear, while mechanics remain stable where their rules version permits it. |
| A graph can direct the next computation. | Click an uncertain survival or speed condition. | The agent runs the calculation that distinguishes two candidates, then updates the same visible claim. |

These are product experiments. They do not require a claim that graphs uniquely represent this information or already improve win rate. The graph's potential advantage is a reusable, inspectable interface between retrieval, reasoning, calculations, and the player.

## Representation

Use a property graph with a node standing for each multi-condition route. This represents a hyperedge without introducing a hypergraph database.

```text
TeamVersion --HAS_SET--> Set --OF_SPECIES--> Species
                         |--HAS_MOVE------> Move
                         |--HAS_ABILITY---> Ability
                         `--HOLDS---------> Item

Plan --HAS_ROUTE--> Route --OFFERS-------> Goal
                     |--REQUIRES-------> Condition
                     |--USES-----------> Set / Move / Ability / Item
                     `--APPLIES_IN-----> Context

Scenario --ASSESSES {truth, resultId}----> Condition
Condition --AFFECTS--> Route --AFFECTS--> Plan

Source <--FROM-- Evidence --SUPPORTS--> Claim --ABOUT--> Route / Condition
UsageSnapshot --MEASURES {usage, sampleSize}--> Species
```

A route's requirements are AND. Alternative routes for a goal are OR. Nested logic can be represented by additional requirement-group nodes if an actual case needs it. Every condition is bound to actors, targets, a phase/turn, and a scenario. “The ally is immune to Earthquake” and “the attacker ignores powder redirection” are different predicates even if both mention a Grass type elsewhere in the data.

Store condition evaluations as `true`, `false`, or `unknown`; absence of evidence is `unknown`. An enabled route means its modeled prerequisites currently pass. It does not mean the opponent cannot respond or that the battle is won. Legality, execution, and strategic value are separate checks.

For a first implementation, conditions can use a small typed intermediate representation:

```json
{
  "id": "cond:sneasler-item-consumed-before-action",
  "predicate": "item_consumed",
  "actor": "slot:2",
  "before": "action:slot2-turn1",
  "contextId": "champions-mc-doubles",
  "check": "engine_or_trace"
}
```

Do not execute arbitrary strings as code. Rules define the reusable predicates; sources bind them to particular plans. An engine-hook index can retrieve candidate mechanics, but a matching hook name does not certify the mechanic's scope.

## Search for the same purpose, then check the differences

The user's Clawitzer objection is the most important design input. Searching only for another Lightning Rod user repeats one author's mechanism. A goal such as “Clawitzer survives the relevant attack and still acts this turn” invites other mechanisms.

Those mechanisms have different applicability. An immunity on a teammate does not automatically protect Clawitzer. Switching Clawitzer out can preserve it but spends its action. Damage mitigation still needs a damage threshold check. Redirection needs an eligible attack and the right board. The graph should expose these differences rather than label every provider “equivalent.”

For the requested cases:

- **Mega Sableye BSS:** start with the source's intended three-Pokémon bring and game plan. Retrieve routes for handling specified Fairy sets and preserving the core's tempo. A favorable type matchup is a candidate check, not a demonstrated switch-in. Doubles ally-support routes must be excluded.
- **Torterra with Y-chu and Milotic:** resolve “Y-chu” to the intended legal form before attaching mechanics. Treat the pairing as a hypothesis to investigate. Identify the jobs each partner is meant to do, then compare alternative routes to those jobs. Do not invent a confirmed successful core from the names alone.
- **Banette/Sneasler:** use the documented Swagger/Lum/Unburden route as a regression case. Removing Lum changes both confusion handling and the proposed item-consumption trigger. Repairing just one condition need not restore the whole line. The exact route still needs engine or trace checks.

## Minimum repair and propagation

For a bounded demo, enumerate legal one-edit and two-edit candidates. The graph retrieves routes and prerequisites; application code checks slot, move, item, timing, and resource constraints. Rank a Pareto shortlist by unresolved requirements, disruption to pinned choices, lost roles, and relevant matchup checks. Show these dimensions separately instead of inventing a calibrated win probability.

```python
affected = graph.dependents(changed_premise, context)
for route in affected.routes:
    route.state = evaluate_all(route.requirements, scenario)

for goal in affected.goals:
    alternatives = graph.routes_offering(goal, context)
    for edits in enumerate_edits(alternatives, max_edits=2):
        if not legal(edits, pinned_choices):
            continue
        trial = apply_to_copy(team, edits)
        checks = evaluate_requirements(trial, scenario)
        yield repair(edits, restored=checks.restored,
                     lost=checks.lost, unresolved=checks.unknown)
```

This is bounded constraint search over a dependency graph. Ordinary shortest path would incorrectly let one predecessor stand in for an AND group. Weighted set cover is a useful relaxation for role coverage, but candidate roles can conflict or require the same action/slot. Preserve those constraints before recommending a repair.

Graphplan offers a relevant precedent: its planning graph exposes preconditions, effects, and mutual exclusions, then performs a separate plan-extraction search. A compact graph does not remove planning complexity. Our adaptation would use explicit action-slot conflicts and delete effects to reject impossible combinations; adversarial, stochastic Pokémon battles exceed Graphplan's deterministic STRIPS setting. [Blum and Furst, 1997](https://www.cs.cmu.edu/~avrim/Papers/graphplan.pdf)

## FalkorDB query templates

The following five templates passed `GRAPH.EXPLAIN` against the running local FalkorDB on October 18, 2026. That checks parsing/planning only; the proposed labels are not populated by this research task. `GRAPH.EXPLAIN` constructs a plan without executing it. [Command reference](https://docs.falkordb.com/commands/graph.explain)

Retrieve different routes to a shared goal:

```cypher
MATCH (route:Route)-[:OFFERS]->(g:Goal {id:$goalId}),
      (route)-[:APPLIES_IN]->(:Context {id:$contextId})
OPTIONAL MATCH (route)-[:REQUIRES]->(condition:Condition)
RETURN route.id, route.name, collect(condition.id) AS conditions
ORDER BY route.id
```

Evaluate each AND group in one scenario:

```cypher
MATCH (r:Route)-[:REQUIRES]->(c:Condition)
OPTIONAL MATCH (:Scenario {id:$scenarioId})-[a:ASSESSES]->(c)
WITH r, collect(coalesce(a.truth,'unknown')) AS states
RETURN r.id,
 CASE WHEN any(s IN states WHERE s='false') THEN 'blocked'
      WHEN all(s IN states WHERE s='true') THEN 'enabled'
      ELSE 'unknown' END AS status
```

Enforce one current assessment per scenario-condition pair when writing. This query intentionally excludes routes with no requirements; validate those at ingestion rather than interpreting an empty AND as proof of success. Restrict the scenario to its context and selected team version before evaluation.

Show what needs rechecking after a premise changes:

```cypher
MATCH p=(c:Condition {id:$changedId})-[:AFFECTS*1..6]->(dependent)
RETURN p LIMIT 80
```

The `AFFECTS` projection must belong to the selected context. Traversal nominates dependents; the evaluator determines their new state. Cycles need visited-node handling. For deeper projections the installed `algo.BFS` procedure can retrieve reachable dependencies, but the returned node-array index must not be treated as depth. [BFS reference](https://docs.falkordb.com/algorithms/bfs), [existing implementation warning](GRAPH_ALGORITHM_DECISION.md)

Return an explanation graph with its sources:

```cypher
MATCH p=(s:Source)<-[:FROM]-(e:Evidence)-[:SUPPORTS]->(:Claim)
        -[:ABOUT]->(r:Route {id:$routeId})
RETURN p LIMIT 30
```

Load a dated usage context independently of mechanics:

```cypher
MATCH (u:UsageSnapshot {contextId:$contextId, period:$month})
      -[m:MEASURES]->(s:Species)
RETURN s.id, m.usage, m.sampleSize
ORDER BY m.usage DESC LIMIT 20
```

Use stable application IDs, not internal node IDs. FalkorDB documents `all`, `any`, `collect`, `coalesce`, path returns, and list comprehensions. Its internal `id()` is explicitly not immutable. [Functions](https://docs.falkordb.com/cypher/functions). Index node IDs and frequently selected context/snapshot identifiers; the supported indexing options are documented separately. [Indexing](https://docs.falkordb.com/cypher/indexing)

## Temporal context and ranking

The same database can hold stable mechanics and dated observations. A separate physical database is unnecessary for each month. Select a context projection by game, singles/doubles, regulation, source population, rank band where known, and observation period. Retain publication and ingestion times so old knowledge can be reconstructed. Do not overwrite September usage with October values.

Rank checks using exposure and severity as distinct quantities. A rare hard counter can be devastating when present while contributing little to an average over the field. Species marginals do not identify a full joint distribution of sets and teams. Human-selected showcase videos cannot supply an unbiased ladder win rate.

Sahovic's team-building formulation and pairwise interaction model are useful prior art for a later learned ranker. Its experiment uses simplified Gen 1 teams and a fixed heuristic pilot, so its learned interactions cannot be transferred directly to current Champions. A learned value can prioritize which candidate to inspect; it should retain its training scope and never silently replace the route's mechanistic explanation. [Algorithmic Pokémon Teambuilding](https://sahovic.fr/algorithmic-pokemon-teambuilding.html)

PageRank over co-usage may describe structural popularity. It is not the first algorithm for discovering unusual but workable plans. Prefer targeted dependency retrieval, explicit prerequisite evaluation, and bounded repair search for this demo.

## Interface and agent contract

Show a small selected subgraph, with sets on the left, routes in the middle, goals on the right, and evidence available on click. Provide actions: **pin core**, **change premise**, **find alternatives**, **run check**, **compare revision**. An agent receives the same selected node IDs and scenario revision that the human sees, then returns proposed graph changes and source-linked reasoning. Persist accepted changes as a new team/scenario revision so a delayed agent response cannot silently edit a newer team.

FalkorDB Browser already supplies interactive graph results and property inspection. Its first-party web component can also embed a graph in a focused workbench; the old `falkordb-canvas` repository now points to `falkordb-ui/web-components/canvas`. [Browser features](https://github.com/FalkorDB/falkordb-browser/blob/staging/readme-browser.md), [canvas migration](https://github.com/FalkorDB/falkordb-canvas)

The agent needs narrow tools such as `inspect_plan`, `find_routes`, `evaluate_conditions`, `propose_edit`, and `record_check`. Store inferred claims separately from source observations. A generated claim repeated by another agent is not independent evidence.

## Numbers observed

- Five proposed Cypher templates parsed and produced execution plans in the existing local FalkorDB.
- Eleven algorithm procedures were present in `dbms.procedures()`, including BFS, PageRank, shortest paths, WCC, and max flow; all reported read mode.
- This research task ran zero battles and made zero graph-data mutations. It does not establish team strength, novelty, or a database performance advantage.
