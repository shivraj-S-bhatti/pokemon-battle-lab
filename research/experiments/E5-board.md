# E5: one board in FalkorDB

E1 (meta holes), E2 (gimmicks), E3 (damage-calc threats and cores) and E4 (archetypes and gaps) now live in one graph, `gk_meta`, at redis://127.0.0.1:6388. Open FalkorDB Browser at http://localhost:4319, pick `gk_meta`, and paste a query below.

## What the board says

- Sleep is the biggest doubles hole: 95% of the usage-weighted meta has no answer to Hypnosis, Yawn or Sing. Sylveon is the sleep user that also threatens the most top-meta mons (10 of them above 10% usage). Venusaur is the Sleep Powder user that threatens the most (4).
- The low-usage mons that threaten the most of the top meta: Mega Camerupt (10 of the 15 mons above 10% usage), then Mega Blaziken, Hydreigon and Dragapult (9 each).
- Best hidden-gem cores, all under 3% usage: Dragapult + Mega Camerupt, Mega Dragonite + Sirfetch'd, Mega Dragonite + Dragapult. Venusaur + Mega Camerupt is fifth, which pairs the Sleep Powder hole with the strongest low-usage threat.
- The strongest gimmick on the board (E2 × E3): Gholdengo uses Memento on its own Mega Staraptor. Contrary turns the -2/-2 into +2 Attack / +2 Special Attack and Gholdengo's faint gives a free switch. Both are common picks (16.6% and 6.2%), the combo is on about 0.001% of teams, and the pair threatens 9 of the 15 top-meta mons.
- Sun is the most under-built archetype in E4: six of its 20 novelty gaps are sun setters and Fire attackers that almost never share a team.

## Queries for Browser

Sleep hole, who is exposed and who can exploit it:

```cypher
MATCH p=(m:Mon)-[:EXPOSED_TO|EXPLOITS]->(h:Hole {format:'doubles'}) WHERE h.mechanic STARTS WITH 'sleep' RETURN p
```

The best hidden-gem core and the top-meta mons it threatens:

```cypher
MATCH p=(k:Core {kind:'hiddenGem', rank:1})-[:HAS]->(m:Mon)-[:THREATENS]->(x:Mon) WHERE x.usage > 0.1 RETURN p
```

Venusaur's case: the hole it exploits and the meta it threatens:

```cypher
MATCH p=(v:Mon {name:'Venusaur'})-[:EXPLOITS|THREATENS]->(x) WHERE x:Hole OR x.usage > 0.1 RETURN p
```

Off-meta mons that beat the most of the top meta (table):

```cypher
MATCH (a:Mon)-[:THREATENS]->(b:Mon) WHERE b.usage > 0.1 AND a.usage < 0.03
WITH a, count(b) AS beats, collect(b.name) AS who RETURN a.name, a.usage, beats, who ORDER BY beats DESC LIMIT 10
```

Sleep users ranked by how much of the top meta they also threaten (table):

```cypher
MATCH (a:Mon)-[:EXPLOITS]->(h:Hole {format:'doubles'}) WHERE h.mechanic STARTS WITH 'sleep'
OPTIONAL MATCH (a)-[:THREATENS]->(b:Mon) WHERE b.usage > 0.1
RETURN a.name, a.usage, h.mechanic, count(b) AS beats ORDER BY beats DESC
```

Gimmicks (from E2) with the mons that run them and what those mons threaten:

```cypher
MATCH p=(g:Gimmick {format:'doubles'})<-[:RUNS]-(m:Mon)-[:THREATENS]->(x:Mon) WHERE g.score > 1 AND x.usage > 0.1 RETURN p
```

Novelty gaps through mechanics (from E4):

```cypher
MATCH (a:Mon)-[g:GAP]->(b:Mon) WHERE g.rank <= 8 MATCH p=(a)-[:PROVIDES]->(m:Mechanic)<-[:ABUSES]-(b) RETURN p
```

## Numbers observed

Added to `gk_meta`: 1,774 THREATENS edges (threat at least 0.6, from E3's 5,625 calculated pairs), 24 Hole nodes (14 doubles, 10 singles), 176 EXPOSED_TO and 188 EXPLOITS edges, 40 Core nodes with HAS edges, 60 Gimmick nodes from E2 with RUNS edges (`load-gimmicks.mjs`). Mons missing from E4's 80 were added with usage 0. Load time under one second. Loader: `.artifacts/experiments/E5/load-board.mjs`, rerunnable, touches only its own labels and edges.

E3's threats use a neutral field (no Intimidate, weather or terrain) and one set per species, so sun and rain attackers are understated. E1's exposure adds answer shares across moves and treats a species' ability, item and moves as independent.
