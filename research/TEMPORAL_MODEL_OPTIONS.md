# A small temporal evidence model for team ideas

Keep a stable vocabulary for evidence, sets, conditions, and plans. Build the relevant graph view when a question arrives. A new source should usually add claims and conditions, rather than invent new entity types. This is enough to demonstrate a useful research assistant without building a general ontology engine.

## The terms describe different operations

| Term | Meaning in this project | Example |
|---|---|---|
| Ontology | Definitions of entity types, relationships, and their intended meaning | A `Set` is a particular species/form plus moves, item, ability, nature, and stat allocation; a `Claim` is an attributed assertion, not a fact merely because it exists. |
| Just-in-time ontology | A proposed workflow that extends those definitions when a new question needs a concept | Add a defined `SpeedBenchmark` structure after finding repeated conditional speed claims. Version the definition and normalize existing evidence. |
| Query view / projection | A selected or derived view of stored evidence | Evidence available before a cutoff, for Champions doubles in a specified regulation, concerning Clawitzer. |
| Temporal knowledge graph | Entities and relationships whose assertions retain time and provenance | A creator's original set, a later revision, and the period or regulation to which each claim applies. |
| Context graph | Here, the evidence and dependencies selected to answer one question | Why this specific Clawitzer plan needs speed control, and which source supports each condition. |
| Algorithm projection | An intentionally constructed graph for an algorithm, with chosen node types, edge direction, and weights | Project verified plan dependencies into a graph for change-impact traversal; omit author and video nodes. |

OWL formalizes classes, properties, and logical constraints; adopting that distinction does not require implementing OWL. [W3C OWL primer](https://www.w3.org/TR/owl2-primer/). Graphiti permits explicit custom entity and edge types. [Graphiti custom types](https://help.getzep.com/graphiti/core-concepts/custom-entity-and-edge-types). “Just-in-time ontology” is our workflow description here, not a separate database capability established by these sources. Zep itself calls its temporal knowledge graphs “Context Graphs,” so those labels need not imply different machinery. [Graphiti overview](https://help.getzep.com/graphiti/getting-started/welcome).

Algorithm projection has a more specific operational meaning: Neo4j GDS, for example, loads selected labels, relationship types, and properties into an in-memory graph. That is an illustrative definition, not a recommendation to replace FalkorDB. [GDS projection](https://neo4j.com/docs/graph-data-science/current/management-ops/graph-creation/graph-project/).

## Smallest useful schema

```text
Source --CONTAINS--> Evidence --SUPPORTS/CHALLENGES--> Claim
                         |                              |
                         +--OBSERVED_IN--> Battle        +--ABOUT--> Set / Plan
                                                        +--REQUIRES--> Condition

TeamVersion --HAS_SET--> Set
Plan --USES--> Set
Plan --REQUIRES--> Condition
Claim / Plan --APPLIES_IN--> Context {game, format, regulation}
Claim --REVISES--> Claim
```

`Evidence` can be a post/comment, a timestamped video observation, or a calculator result. Preserve the source locator, author, extractor/model version, and extraction status. Keep commentary and visual observations separate: the narrator's intended plan is not necessarily the move actually selected. PROV-O provides reusable concepts for attribution, derivation, and generation, without requiring this prototype to implement its whole vocabulary. [W3C PROV-O](https://www.w3.org/TR/prov-o/).

A claim needs:

```text
id, statement, source_id, source_locator, attributed_to
status = reported | visually_verified | calculated | hypothesis
context_id, set_version_ids, condition_ids
published_at, observed_at, ingested_at
valid_from?, valid_until?, recorded_until?
```

The times answer different questions:

- `published_at`: when the source became public. A video uploaded today can show last month's match.
- `observed_at`: when the match or phenomenon occurred, if known. Video offset and battle turn are separate coordinates, not calendar timestamps.
- `ingested_at`: when our system acquired this record.
- `valid_from` / `valid_until`: the claimed domain of applicability. Regulation membership is categorical context and should also be explicit.
- `recorded_until`: when the stored interpretation was replaced, while preserving its historical version.

Do not infer exact dates from relative labels such as “6 days ago.” Unknown time stays unknown. Graphiti distinguishes database transaction time from validity time, including creation/expiry and validity bounds. [Graphiti temporal model](https://www.getzep.com/blog/beyond-static-knowledge-graphs/).

Two authors disagreeing does not automatically invalidate either claim. First compare their sets, opponents, conditions, and definitions of success. Preserve unresolved disputes; an LLM's latest extraction should not silently overwrite the earlier assertion.

## Clawitzer is already a useful case

The supplied [Reddit discussion](https://www.reddit.com/r/PokemonChampions/comments/1wwsk73/after_a_million_calculations_and_practice_games_i/) contains several distinguishable evidence types:

1. A pictured Timid Clawitzer set with 172 Special Attack and 95 Speed.
2. A commenter proposes Modest and a different allocation to retain 95 Speed while reaching 180 Special Attack; the author then asks which speed target is actually needed.
3. Other commenters propose Terrain Pulse plus terrain and speed-control support.
4. A counterargument identifies vulnerability to two opponents attacking it together.
5. A later exchange questions the Gholdengo matchup against a bulky set; the author reports success against the ones encountered.

These are source assertions and visible screenshot values. This note has not verified the mechanics, reproduced the calculations, reconstructed complete team sets, or established win rates.

The useful answer is conditional: recover the claimed purpose of a stat allocation, expose which opponent assumptions support it, then test an alternative. A species-level `Clawitzer BEATS Gholdengo` edge would erase the information we need.

## Proposed demo, with one visible change

Start with the thread and one manually checked battle segment from the video workflow. Display each extracted claim next to its source. Ask: “What is this set trying to achieve, and what breaks the plan?” Show the claimed speed/damage thresholds and their prerequisites. Change the opponent set or remove a supporting condition. Follow dependency edges to identify exactly which conclusions need recalculation, then rerun only those checks.

```python
evidence = select_sources(game="Champions", format="doubles", cutoff=cutoff)
claims = normalize(evidence, fixed_schema)
view = relevant_claims(claims, team_version, regulation, question)
plan = explain(view, include_sources=True, preserve_disputes=True)

changed_condition = user_changes_assumption()
affected = reverse_dependency_walk(view, changed_condition)
for claim in affected:
    if claim.has_executable_check:
        record_result(run_check(claim), inputs=claim.conditions)
    else:
        mark_needs_evidence(claim)
```

Historical reconstruction requires specifying the cutoff: “what was publicly available then?” filters publication time; “what did our system know then?” filters ingestion and record versions. Neither proves the source was correct at that time.

PageRank is optional. Its score measures a structural form of influence, not battle strength. [FalkorDB algorithms](https://docs.falkordb.com/algorithms/). Running it over a mixed graph of videos, Pokémon, conditions, and creators would conflate unrelated relationships. Dependency traversal directly serves this demo. If a later research question needs centrality, define the graph projection and target meaning before choosing the algorithm.

“Dreaming” can be a bounded hypothesis queue: propose a new supporting set, attach premises and counterexamples, schedule a calculator check, and promote only the checked result. Generated links must retain `hypothesis` status and must not become their own corroborating evidence.

## Numbers observed

- The screenshot reports Clawitzer's Special Attack as 172 and Speed as 95. The 180 Special Attack alternative is a commenter claim, not a result calculated in this task.
- Existing local evidence contains five graph queries with exact indexed-JavaScript result parity. That demonstrates retrieval agreement, not a graph-specific strategic benefit. [Experiment receipt](evidence/experiment.json).
- This task ran zero battle simulations and zero new graph algorithms. The schema and demo above are proposals.

The graph's value should be tested against an indexed-record baseline on source retrieval, conditional explanation, and correct change impact. All these records could be stored relationally. Graph storage earns its place if the dependency model makes these operations simpler or more reliable in the actual implementation; naming the graph “temporal” does not establish that result.
