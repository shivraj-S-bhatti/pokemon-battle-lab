# E4: Reg M-C archetypes and novelty gaps in FalkorDB

Graph `gk_meta` holds the top 80 doubles species from Smogon's September 2026 gen9championsvgc2026regmc 1500+ chaos stats (1,631,943 battles), 17 mechanic nodes, and six edge types. FalkorDB's own `algo.labelPropagation`, `algo.WCC`, `algo.pageRank` and `algo.betweenness` ran on a "CORE" projection of the co-usage graph, and the novelty-gap ranking is a single Cypher query.

## Findings

### The four most-used mons are glue, not archetypes

Rillaboom (43.0% usage), Sneasler (36.0%), Incineroar (28.7%) and Kingambit (21.4%) end up in no archetype. Each sits on a third or more of its partners' teams, but never much more often than its own usage predicts: Rillaboom's top partner, Incineroar, appears with it at a lift of 1.28, and Sneasler at 0.91. On raw co-usage these four dominate PageRank and betweenness. Once the projection keeps only pairs at lift 2.5 or more, they drop out and the specialist cores remain.

### Archetypes found (label propagation on CORE, named by usage-weighted PROVIDES shares)

| Archetype | Members (by usage) |
|---|---|
| Rain, with a Trick Room mode | Golisopod-Mega, Farigiraf, Pelipper, Archaludon, Charizard-Mega-Y, Politoed, Grimmsnarl, Gengar-Mega, Pawmot, Swampert-Mega, Kommo-o, Sableye, Raichu-Mega-X, Espathra, Staraptor, Vivillon |
| Psychic Terrain + redirection | Indeedee-F, Whimsicott, Torkoal, Gallade |
| Trick Room (Gardevoir-Mega) | Gardevoir-Mega, Armarouge, Hatterene, Camerupt-Mega, Venusaur, Mawile-Mega, Blaziken-Mega, Typhlosion-Hisui, Alakazam-Mega |
| Redirection + Trick Room (Sinistcha) | Sinistcha, Annihilape, Delphox-Mega, Blastoise-Mega, Maushold |
| Sand | Indeedee, Tyranitar-Mega, Tyranitar |
| Tailwind pairs | Sylveon, Garchomp, Aerodactyl-Mega; Raichu-Mega-Y, Staraptor-Mega; Milotic, Dragonite; Excadrill, Corviknight; Dragapult, Hydreigon |
| Volcarona redirection | Volcarona, Sirfetch'd, Aegislash |
| No shared mechanic | Gholdengo, Arcanine-Hisui, Ceruledge; Garchomp-Mega-Z, Glimmora-Mega |

The Rain cluster is the largest (16 members, summed usage 106%). Label propagation folded Charizard-Mega-Y into it through Grimmsnarl, which has CORE edges to both Pelipper/Archaludon and Charizard-Mega-Y. So the cluster reads as "Grimmsnarl screens plus a weather setter" as much as pure Rain. Trick Room splits three ways by setter: Farigiraf inside the Rain cluster, Gardevoir-Mega/Hatterene, and Sinistcha. Indeedee-F's Psychic Terrain group carries Torkoal, which is Trick Room sun.

Inside the CORE projection, PageRank ranks Torkoal (0.037), Archaludon (0.033), Politoed, Staraptor-Mega and Staraptor highest. Betweenness ranks Venusaur, Torkoal, Grimmsnarl and Charizard-Mega-Y highest. These are the bridges between specialist cores.

### Top 20 novelty gaps

A gap is a pair where A PROVIDES a mechanic (at least 20% of A's sets) that B ABUSES, and the two share a team on less than 2% of either's teams. Score = provide share × abuse strength × sqrt(usage A × usage B), halved for two Megas. The query drops pairs where B already sets the same mechanic, where the two would run clashing weathers, and Rain-setter-plus-Fire or Sun-setter-plus-Water pairs.

| # | Provider | Abuser | Mechanic | Co-usage | Why |
|---|---|---|---|---|---|
| 1 | Indeedee | Farigiraf | Psychic Terrain | 1.3% | Farigiraf sets Trick Room and fires Psychic STAB; Indeedee-M's terrain boosts it. Players choose Indeedee-F for Follow Me instead. |
| 2 | Indeedee | Hatterene | Psychic Terrain | 2.0% | Hatterene runs Expanding Force and Trick Room; same Indeedee-F-over-M choice. |
| 3 | Charizard-Mega-Y | Arcanine-Hisui | Sun | 1.7% | Flare Blitz is its main attack, and Drought boosts it 1.5x. |
| 4 | Whimsicott | Grimmsnarl | Tailwind | 1.9% | Weak signal: Grimmsnarl is a screens support, so its attack stat flagged it. |
| 5 | Politoed | Milotic | Rain | 0.0% | Milotic's Scald and Muddy Water gain 1.5x, and it already runs Icy Wind for speed. |
| 6 | Charizard-Mega-Y | Volcarona | Sun | 0.0% | Heat Wave in sun from Volcarona, which already brings Rage Powder and Tailwind. |
| 7 | Whimsicott | Swampert-Mega | Tailwind | 1.3% | Swampert-Mega without rain still wants speed control. |
| 8 | Torkoal | Arcanine-Hisui | Sun | 0.0% | Same Flare Blitz logic as #3, with a Trick Room sun setter. |
| 9 | Charizard-Mega-Y | Armarouge | Sun | 1.8% | Armor Cannon and Heat Wave in sun; Armarouge also sets Trick Room. |
| 10 | Volcarona | Armarouge | Rage Powder, Tailwind | 0.0% | Redirection covers Armarouge's Trick Room turn. |
| 11 | Talonflame | Arcanine-Hisui | Tailwind | 0.0% | Base 90 speed attacker under Gale Wings Tailwind. |
| 12 | Rillaboom | Venusaur | Grassy Terrain | 1.5% | Weak: a Grass-type bonus only, and Venusaur is a Chlorophyll sun mon. |
| 13 | Volcarona | Ceruledge | Rage Powder, Tailwind | 0.0% | Fire-type pair; redirection lets Ceruledge set up. |
| 14 | Pelipper | Kommo-o | Tailwind | 1.8% | Pelipper's Tailwind mode for a mid-speed attacker. |
| 15 | Talonflame | Charizard-Mega-Y | Tailwind | 1.3% | A fast Tailwind setter that does not fight the sun. |
| 16 | Torkoal | Volcarona | Sun | 0.0% | Sun Heat Wave, but Volcarona is fast and Torkoal is a Trick Room setter. |
| 17 | Aerodactyl | Archaludon | Tailwind | 1.8% | Archaludon outside rain. |
| 18 | Tyranitar-Mega | Arcanine-Hisui | Sand | 1.5% | The Rock half gets the sand Special Defense boost. |
| 19 | Raichu-Mega-Y | Hatterene | Fake Out | 0.0% | Fake Out covers Hatterene's Trick Room turn. |
| 20 | Torkoal | Meganium-Mega | Sun | 0.0% | A sun abuser (by kit) that nobody pairs with a sun setter. |

The sun cluster (#3, #6, #8, #9, #16, #20) is the clearest result. Charizard-Mega-Y and Torkoal are both popular, Fire attackers that gain from sun are popular, and the stats say almost none of those pairs share a team. #4 and #12 are artifacts of the coarse "attacker by base stat" rule.

## Demo queries for FalkorDB Browser (http://localhost:4319, graph `gk_meta`)

1. One archetype as a graph (the Gardevoir-Mega Trick Room core and its CORE links):

```cypher
MATCH p=(a:Mon)-[:CORE]-(b:Mon)
WHERE a.archetype STARTS WITH 'Trick Room ('
RETURN p
```

2. Who sets Rain and who cashes in on it:

```cypher
MATCH p=(a:Mon)-[:PROVIDES]->(m:Mechanic {name:'Rain'})<-[:ABUSES]-(b:Mon)
WHERE a.usage > 0.03 AND b.usage > 0.03
RETURN p
```

3. Top novelty gaps as paths through the mechanic that links them:

```cypher
MATCH (a:Mon)-[g:GAP]->(b:Mon) WHERE g.rank <= 8
MATCH p=(a)-[:PROVIDES]->(m:Mechanic)<-[:ABUSES]-(b)
RETURN p
```

4. The gap finder itself, live. This compact form skips the redundancy and weather-clash filters, so raw pairs such as Politoed to Pelipper (two Rain setters) appear; the full query is `gapCypher` in `results.json`.

```cypher
MATCH (a:Mon)-[p:PROVIDES]->(m:Mechanic)<-[u:ABUSES]-(b:Mon)
WHERE a <> b AND a.base <> b.base AND p.share >= 0.2
OPTIONAL MATCH (a)-[w:PAIRS_WITH]-(b)
WITH a, b, m, p, u, coalesce(max(w.weight), 0.0) AS co WHERE co < 0.02
RETURN a.name, m.name, b.name, round(co*1000)/1000 AS coUsage,
       p.share * u.strength * sqrt(a.usage * b.usage) AS score
ORDER BY score DESC LIMIT 20
```

5. Archetypes recomputed on the spot with label propagation:

```cypher
CALL algo.labelPropagation({nodeLabels:['Mon'], relationshipTypes:['CORE']})
YIELD node, communityId
WITH communityId, collect(node.name) AS members WHERE size(members) >= 3
RETURN communityId, members ORDER BY size(members) DESC
```

6. Most central mons (PageRank and betweenness on CORE):

```cypher
CALL algo.pageRank('Mon', 'CORE') YIELD node, score
RETURN node.name, node.archetype, round(score*1000)/1000 AS pagerank
ORDER BY pagerank DESC LIMIT 10
```

```cypher
CALL algo.betweenness({nodeLabels:['Mon'], relationshipTypes:['CORE']}) YIELD node, score
RETURN node.name, node.archetype, score ORDER BY score DESC LIMIT 10
```

7. How Rain teams reach Trick Room teams (shortest CORE path):

```cypher
MATCH (a:Mon {name:'Pelipper'}), (b:Mon {name:'Hatterene'})
WITH shortestPath((a)-[:CORE*]->(b)) AS p
RETURN p
```

Returns Pelipper, Golisopod-Mega, Staraptor, Camerupt-Mega, Hatterene.

8. What checks the top threats:

```cypher
MATCH p=(c:Mon)-[k:CHECKS]->(t:Mon)
WHERE t.usage > 0.15
RETURN p
```

## Method

Loader: `.artifacts/experiments/E4/load-gk-meta.mjs`, run with `node .artifacts/experiments/E4/load-gk-meta.mjs` from the repo root. It wipes and rebuilds `gk_meta` only and writes `results.json` beside itself.

- Mon nodes: top 80 by usage, with types, base speed, mega flag and base species from the pinned Showdown pokedex, plus top ability, item and six moves from the usage file.
- PROVIDES share: the summed weight of the mechanic's moves or abilities divided by the mon's weighted team count, kept at 0.05 or more. "Priority" covers every damaging move with positive priority except Fake Out (from Showdown moves data). I added Psychic Terrain and Grassy Terrain because Indeedee-F and Rillaboom set them on most teams.
- ABUSES strength (0 to 1), from kit: weather abilities and moves (Swift Swim, Electro Shot, Chlorophyll, Solar Beam, Slush Rush, Sand Rush and so on), plus a typed-attacker bonus. Trick Room: base speed 60 or less and attack or special attack of 95 or more. Tailwind: base speed 60 to 105 with 100+ offense. Redirection and Fake Out: setup and Trick Room users. Perish Song: Shadow Tag and Mean Look. Psychic Terrain: Expanding Force and Trick Room users.
- PAIRS_WITH: both directions for every pair, `cond` = P(B on team | A), `weight` = mean of the two conditionals, `lift` = cond / usage(B); kept at weight 0.01 or more.
- CORE: PAIRS_WITH edges with weight 0.1 or more and lift 2.5 or more, built in Cypher. On mean co-usage alone (thresholds 0.15 to 0.25), label propagation put about 60 mons in one Rillaboom-centred community; lift fixed that.
- CHECKS: Smogon "Checks and Counters" entries with p of 0.55 or more and n of 2000 or more, among the top 80.
- GAP: the 20 ranked gaps, stamped as edges so Browser can draw them.

Numbers observed (final run): 80 Mon and 17 Mechanic nodes; 5,006 PAIRS_WITH, 166 CORE, 98 PROVIDES, 180 ABUSES, 31 CHECKS and 20 GAP edges. `dbms.procedures()` lists algo.AStar, betweenness, BFS, HarmonicCentrality, labelPropagation, maxFlow, MSF, pageRank, SPpaths, SSpaths and WCC. On CORE, WCC found 26 components and label propagation found 37 communities, 13 of them with two or more members (the rest are singletons such as the four glue mons). Label propagation gave the same 13 communities across three runs. Timings: load about 0.1 to 0.6 s; WCC 2 to 7 ms; label propagation 3 to 11 ms; PageRank 1 to 7 ms; betweenness 1 to 4 ms; gap query 40 to 90 ms.

Limits: ABUSES is a heuristic, and the Grimmsnarl (#4) and Venusaur (#12) gaps show its false positives. Label propagation ignores edge weights. The usage file records only what players bring, so a gap can also mean the pair loses; the CHECKS edges are where to test that next.
