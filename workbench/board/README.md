# gk_board: the discussion board

A small symbolic graph for the runthrough: plans, the mons they use, what they target or concede, the conditions and threats that decide them, alternatives, and checks. Every claim carries a status: `hypothesis`, `engine_checked` (science agent's Showdown execution, `workbench/RUNTHROUGH_CHECK.md`), `native_checked` (native Smogon Champions calculator, stored with inputs in `checks/`), or `rejected`. There is no strength score. Runtime graphs (`gk_meta`, `gk_chain`) stay separate.

```sh
node workbench/board/checks/staraptor-memento.mjs   # reruns the native calc, writes checks/staraptor-memento.json
node workbench/board/load-gk-board.mjs              # rebuilds gk_board from board.json + checks
```

Edit `board.json` to add or revise a plan; rerun the loader. Mon nodes are keyed by species ID (`id`) for sprite hydration.

## What it holds now

- **Gholdengo Memento into Contrary Mega Staraptor** (engine checked). Works, but Gholdengo moves after Staraptor, so +2 starts on Staraptor's second attack, and opposing Follow Me steals Memento. Native calc: at +0 Staraptor already OHKOs Rillaboom, Sneasler, Incineroar and Archaludon; +2 changes Garchomp (2HKO → OHKO), Pelipper and Gholdengo (3HKO → 2HKO). Narrow.
- **Alternatives:** Whimsicott Prankster Memento (should move first; hypothesis) and Gholdengo Memento into Malamar (keeps the Mega free; hypothesis).
- **Simple Beam Snorlax → Psych Up Mega Slowbro** (engine checked that base Audino works and Mega Audino breaks it). Thresholds still to check.
- **Kommo-o → Psych Up Toucannon** from E6's path search (hypothesis).

## Browser queries (http://localhost:4319, graph `gk_board`)

One plan with everything it depends on:

```cypher
MATCH p=(x:Plan {id:'memento-staraptor'})-[r]->(y) WHERE type(r) <> 'CHECKED_BY' RETURN p
```

What decides each plan:

```cypher
MATCH (p:Plan)-[:NEEDS]->(c:Condition {decisive:true}) RETURN p.title, c.status, c.text
```

Targets, accepted losses and matchups the plan does not change, with status:

```cypher
MATCH (p:Plan)-[r:TARGETS|ACCEPTS_LOSS|UNCHANGED_BY_PLAN]->(m:Mon) RETURN p.title, type(r), m.name, r.status, r.why
```

Threats and who carries them:

```cypher
MATCH p=(m:Mon)-[:CARRIES]->(t:Threat)<-[:BLOCKED_BY]-(x:Plan) RETURN p
```

Alternatives:

```cypher
MATCH p=(a:Plan)-[:ALTERNATIVE_TO]->(b:Plan) RETURN p
```

Native calculator results:

```cypher
MATCH (:Plan)-[:CHECKED_BY]->(k:Check)-[:AGAINST]->(m:Mon) RETURN m.name, k.question, k.ko ORDER BY m.name
```

## Numbers observed

5 plans, 13 conditions, 7 threats, 16 native checks (14 calculated; 2 Basculegion rows `native_partial` because Close Combat does not affect a Ghost type and the native description failed), 22 Mon nodes, 5 sources. Sets are `data/meta-sets.json` constructed candidates on a neutral field.
