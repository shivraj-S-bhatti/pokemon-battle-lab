# gk_board: the discussion board

A small symbolic graph for the runthrough: plans, the mons they use, what they target or concede, the conditions and threats that decide them, alternatives, and checks. Every claim carries a status: `hypothesis`, `engine_checked` (science agent's Showdown execution, `workbench/RUNTHROUGH_CHECK.md`), `native_checked` (native Smogon Champions calculator, stored with inputs in `checks/`), or `rejected`. There is no strength score. Runtime graphs (`gk_meta`, `gk_chain`) stay separate.

```sh
node workbench/board/checks/staraptor-memento.mjs   # reruns the native calc, writes checks/staraptor-memento.json
node workbench/board/load-gk-board.mjs              # rebuilds gk_board from board.json + checks
```

Edit `board.json` to add or revise a plan; rerun the loader. Mon nodes are keyed by species ID (`id`) for sprite hydration.

## What it holds now

- **Gholdengo Memento into Contrary Mega Staraptor** (rejected for now). Works, but Gholdengo moves after Staraptor, so +2 starts on Staraptor's second attack, and opposing Follow Me steals Memento. Native calc: at +0 Staraptor already OHKOs Rillaboom, Sneasler, Incineroar and Archaludon; +2 changes Garchomp (2HKO → OHKO), Pelipper and Gholdengo (3HKO → 2HKO); E7 adds Kingambit (37.5% → guaranteed OHKO). Revisit only for a team that must beat Garchomp and Kingambit.
- **Alternatives:** Whimsicott Prankster Memento (should move first; hypothesis) and Gholdengo Memento into Malamar (rejected by E7: still only 2HKOs Kingambit at +2).
- **Simple Beam Snorlax → Psych Up Mega Slowbro** (worth a test). E6's path search found it unprompted. Native calc: at +6 / +6 the strongest top-10 hit does 27.2-32.1%; Body Press OHKOs Rillaboom and Incineroar and has 75% on Sneasler. Accepted losses: five Ghost types immune to Body Press. Base Audino only (engine checked).
- **Simple Beam Kommo-o Clangorous Soul, copied by Psych Up** (worth a test): +4 in all stats, Stored Power at 420 BP OHKOs every target checked, but without Soundproof Mega Gardevoir's Hyper Voice OHKOs Kommo-o during setup.
- **Quiver Dance copied** (rejected): same pattern, no Defense, physical hits OHKO the receiver.
- **E7 worth a test:** partner Swagger into Persim Unburden Sneasler (+2 makes Kingambit, Rillaboom, Farigiraf guaranteed OHKOs), Sash Reversal Rhyperior under Trick Room with Armor Tail Farigiraf, Beat Up into Justified Arcanine (+4 OHKOs Kingambit and Farigiraf), Scarf Ninetales Memento (moves before all of the top 15).
- **E7 rejected, kept for history:** Audino Simple Beam into Torkoal (+4 Speed costs six Trick Room move-order wins for one KO).

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

11 plans, 27 conditions, 11 threats, 16 native checks stored here (E6's calls are in `research/experiments/E6-boost-chains.md` and `.artifacts/experiments/E6/calc.json`; E7's 140 calls are in `research/experiments/E7-gimmick-outcomes.md` and `.artifacts/experiments/E7/outcomes.json`) (14 calculated; 2 Basculegion rows `native_partial` because Close Combat does not affect a Ghost type and the native description failed), 30 Mon nodes, 6 sources. Sets are `data/meta-sets.json` constructed candidates on a neutral field.
