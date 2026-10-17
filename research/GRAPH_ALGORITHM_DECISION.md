# Use dependencies first; add graph algorithms when the question needs them

The smallest useful demo is: remove a team member, identify which documented plans lose support, retrieve candidate replacements, then choose the next calculation that distinguishes those candidates. FalkorDB can supply those dependencies and evidence paths directly. A PageRank score would not establish whether a replacement works.

## What the hackathon requires

The official rules require FalkorDB to support a central product function. Submissions include their graph model and the Cypher queries **or** graph algorithms on which the product depends, alongside code, setup instructions and a working demo video. They do not require PageRank, shortest paths or a minimum number of algorithms. The main implementation must be work completed during the event. AI assistance must be disclosed and participants must understand and verify their work. No numerical scoring weights appear on the rules or overview pages inspected on 17 October 2026. [Rules](https://www.wemakedevs.org/hackathons/falkordb/rules), [overview](https://www.wemakedevs.org/hackathons/falkordb)

My interpretation of the removal test in those rules: the submitted system must actually depend on FalkorDB. It does not demand a proof that no relational implementation could reproduce it. Algorithms and representations are portable.

## Procedures that actually exist

A read-only query against the running pinned local container confirmed these registered names: `algo.AStar`, `algo.betweenness`, `algo.BFS`, `algo.HarmonicCentrality`, `algo.labelPropagation`, `algo.maxFlow`, `algo.MSF`, `algo.pageRank`, `algo.SPpaths`, `algo.SSpaths`, `algo.WCC`. All report `READ` mode. This checks installation, not correctness or speed on our workload.

```sh
docker exec pokemon-core-lab-graph-1 redis-cli --raw \
  GRAPH.RO_QUERY pokemon_mc_202609 \
  'CALL dbms.procedures() YIELD name, mode RETURN name, mode'
```

| Procedure signature in current official docs | Appropriate meaning for this project |
|---|---|
| `algo.pageRank(label, relationshipType) YIELD node, score` | Structural prominence in the chosen relation. The documented interface has no edge-weight or personalization argument. It does not estimate winning probability. |
| `algo.BFS(startNode, maxDepth, relationshipType) YIELD nodes, edges` | Reachable dependencies, with one relationship type or all types. Useful once dependency chains become deeper than a fixed query. |
| `algo.SPpaths({sourceNode, targetNode, relTypes, weightProp, costProp, maxCost, maxLen, relDirection, pathCount}) YIELD path, pathWeight, pathCost` | Paths minimizing additive edge weight subject to optional limits. A chain of supporting claims is not automatically a valid battle plan. |
| `algo.WCC({nodeLabels, relationshipTypes}) YIELD node, componentId` | Find disconnected regions or orphaned evidence. Connected components are not necessarily strategic archetypes. |
| `algo.labelPropagation({nodeLabels, relationshipTypes, maxIterations}) YIELD node, communityId` | Explore clusters in a carefully constructed co-selection graph. Labels require interpretation; clusters do not prove synergy. |
| `algo.maxFlow({sourceNodes, targetNodes, relationshipTypes, capacityProperty, nodeLabels}) YIELD nodes, edges, edgeFlows, maxFlow` | Capacity-constrained allocation. Team slots and conditional move sequences do not naturally reduce to this procedure. |

Signature sources: [PageRank](https://docs.falkordb.com/algorithms/pagerank), [BFS](https://docs.falkordb.com/algorithms/bfs), [SPpaths](https://docs.falkordb.com/algorithms/sppath), [WCC](https://docs.falkordb.com/algorithms/wcc), [label propagation](https://docs.falkordb.com/algorithms/cdlp), [max flow](https://docs.falkordb.com/algorithms/maxflow).

The BFS documentation's friends-of-friends example uses `nodes[2]` as if it identifies depth two. Do not copy that inference: an array position is not a distance. The [implementation](https://raw.githubusercontent.com/FalkorDB/FalkorDB/master/src/procedures/proc_bfs.c) emits reachable nodes by sparse-vector iteration; it does not yield a per-node depth field. Use explicit path lengths when depth matters. The fetched source is upstream master, not proof of the exact container revision.

## The current demo already has the right question

`research/evidence/plan-demo.json` records four manually extracted author-claim plans. Removing Sceptile leaves two support roles absent, while the Dragon Pulse and Dark Pulse plans remain supported by the remaining documented components. Catalog queries find Pikachu and Raichu for Lightning Rod plus Upper Hand; partial-set validation succeeds under the pinned community simulator's M-C doubles assumption. This is candidate generation, not a justified team substitution.

For this small graph, the existing fixed-hop dependency query is sufficient. Adding BFS now would demonstrate an API rather than improve the answer. A future larger graph can use a dependency projection with edges oriented prerequisite to dependent:

```text
Sceptile present -> Lightning Rod available -> electric-cover plan -> recommendation
                -> Upper Hand available   -> priority-cover plan --^

Clawitzer + Dark Pulse ---------------------> Gholdengo-pressure plan
```

Then a read-only traversal can nominate claims to recheck:

```cypher
MATCH (changed:Fact {id: $changedId})
CALL algo.BFS(changed, 8, 'AFFECTS') YIELD nodes
UNWIND nodes AS affected
RETURN affected.id, labels(affected)
```

This is a proposed schema/query, not a query executed against the current demo. `AFFECTS` means 're-evaluate this dependency', not 'this claim is now false'. An alternative provider may still satisfy the same role. Scope the projection to the relevant rules, time window and source population before traversing it; filtering only the returned nodes can accidentally allow paths through out-of-scope edges.

## Why paths and pairs are insufficient

A strategy often requires several conditions simultaneously: the correct ability, sufficient speed, the right target action, survival, and a teammate in position. Represent a `Plan` or `RequirementGroup` node with explicit AND/OR semantics. Pairwise edges alone can accidentally treat one satisfied condition as enough.

```python
for plan in plans_reachable_from(changed_fact):
    missing = [r for r in plan.required_roles if not any_live_provider(r)]
    if missing:
        candidates = query_legal_providers(missing)
        next_check = choose_check_that_separates(candidates, plan.failure_modes)
```

The meaningful next action in the current demo is a targeted speed, survival or lost-role check. For example, replacing Sceptile with Raichu may restore the two retrieved roles while losing other offensive or defensive properties. A result that never checks those losses would overstate the graph's recommendation.

## PageRank and 'dreaming'

PageRank over partner co-usage would rank structural prominence in the sampled metagame. That can help decide which common threats deserve analysis, but it tends to reward connected, familiar choices. Low rank does not imply unexplored potential. High rank does not imply synergy or causality. An ability/move graph is even easier to distort: a ubiquitous move can become central simply because many species learn it.

For creative exploration, use agents to propose a missing relationship with a falsifiable condition: 'this member supplies these two roles, provided this speed threshold holds.' Store the hypothesis separately from source observations. A calculator or narrow simulation supplies a test result. Only then promote the relationship, retaining its conditions and evidence. Do not let repeated model-generated claims increase their own credibility through centrality.

Possible later formulation: select a small portfolio of conditional plans that covers specified threats while sharing a legal six-member team. This is a constrained coverage/optimization problem with interactions. A graph can retrieve relevant constraints; a solver or explicit enumeration evaluates them. It is not automatically shortest path or maximum flow.

## Baseline and experiment

Keep the same facts in an indexed map of `role -> providers` and `role -> plans`. Run the same intervention in memory. Compare affected plans, omitted counterexamples and next-check choices. This tests whether evidence structure helps reasoning. Compare databases separately if scale later justifies performance work.

A flat-source LLM versus graph-assisted LLM can test retrieval organization, but it must use the same source material and output budget. Otherwise improved answers could come from extra information rather than graph structure. A two-hop graph winning against a deliberately impoverished baseline would not be persuasive evidence.

## Numbers observed

- 11 algorithm procedures registered in the running container, all read-only.
- 4 author-claim plans in `research/evidence/plan-demo.json`; 2 lose documented support in the Sceptile-removal scenario.
- 2 replacement candidates pass a one-move partial-set validator; no full team viability result.
- 0 new algorithm benchmark runs and 0 database mutations performed for this investigation.
- No numerical judging weights found in the official overview/rules inspected on 17 October 2026.

Local research note only. No claim of novelty, win rate or graph-specific computational advantage.
