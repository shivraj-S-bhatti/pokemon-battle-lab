# gk_board: the discussion board

A small symbolic graph for the runthrough: plans, the mons they use, what they target or concede, the conditions and threats that decide them, alternatives, and checks. Every claim carries a status: `hypothesis`, `engine_checked` (science agent's Showdown execution, `workbench/RUNTHROUGH_CHECK.md`), `native_checked` (native Smogon Champions calculator, stored with inputs in `checks/`), or `rejected`. There is no strength score. Runtime graphs (`gk_meta`, `gk_chain`) stay separate.

```sh
node workbench/board/checks/staraptor-memento.mjs   # reruns the native calc, writes checks/staraptor-memento.json
node workbench/board/load-gk-board.mjs              # rebuilds gk_board from board.json + checks
```

Edit `board.json` to add or revise a plan; rerun the loader. Mon nodes are keyed by species ID (`id`) for sprite hydration.

## What it holds now

Opposing matchups a plan concedes are left `undecided` on every plan (`Plan.concessions`) until Shivraj selects them. `COSTS` edges are what our own side pays (a donor fainting, an item, a turn). `WEAK_AGAINST` edges are checked facts about the plan (Ghost types are immune to Body Press), not chosen concessions.

- **Gholdengo Memento into Contrary Mega Staraptor** (engine checked, verdict undecided). With the tested spreads Staraptor attacks before Memento, so +2 starts on its second attack. Opposing Follow Me (tested with Clefable) wastes Gholdengo. Ordinary Fake Out cannot hit Gholdengo; base Scrappy Kangaskhan's can. Native calc over nine selected targets with each target's better move: +2 turns Garchomp, Kingambit, Pelipper and Basculegion into guaranteed OHKOs; Rillaboom, Sneasler, Incineroar and Archaludon are already OHKO at +0.
- **Alternatives:** Choice Scarf Gholdengo (engine checked: Memento lands before the attack; costs the item), Whimsicott Prankster Memento (hypothesis; Grass type ignores Rage Powder but not Follow Me), Malamar (rejected by E7).
- **Simple Beam Snorlax → Psych Up Mega Slowbro** (engine checked; viability unknown). Executed over four turns against opponents who Protected every turn: +6 / +6 copied and kept through Mega Evolution; base Audino only. Native thresholds on a neutral field pass (4HKO from the strongest top-10 hit; Body Press OHKOs Rillaboom and Incineroar). Setup under real pressure is untested.
- **Clangorous Soul copied** (worth a test, with E7's Soundproof caveat) and **Quiver Dance copied** (rejected: no Defense).
- **E7 worth a test:** Swagger into Persim Unburden Sneasler, Sash Reversal Rhyperior under Trick Room, Beat Up into Justified Arcanine, Scarf Ninetales Memento. **Rejected, kept for history:** Audino Simple Beam into Torkoal.

## Browser queries (http://localhost:4319, graph `gk_board`)

One plan with everything it depends on:

```cypher
MATCH p=(x:Plan {id:'memento-staraptor'})-[r]->(y) WHERE type(r) <> 'CHECKED_BY' RETURN p
```

What decides each plan:

```cypher
MATCH (p:Plan)-[:NEEDS]->(c:Condition {decisive:true}) RETURN p.title, c.status, c.text
```

Targets, unchanged matchups, costs and checked weaknesses, with status (concessions stay on the plan as `undecided`):

```cypher
MATCH (p:Plan)-[r:TARGETS|UNCHANGED_BY_PLAN|COSTS|WEAK_AGAINST]->(m:Mon) RETURN p.title, p.concessions, type(r), m.name, r.status, r.why
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
MATCH (:Plan)-[:CHECKED_BY]->(k:Check)-[:AGAINST]->(m:Mon) RETURN m.name, k.question, k.ko, k.attackerSet, k.defenderSet, k.field, k.evidence ORDER BY m.name
```

## Numbers observed

12 plans, 32 conditions (each with an evidence locator where one exists), 11 threats, 36 native checks for the Memento plan (both Brave Bird and Close Combat per target at +0 and +2; 32 calculated, 4 `native_partial` where Close Combat cannot hit a Ghost type), 31 Mon nodes with sprites, 7 sources. Sets are `data/meta-sets.json` candidates on a neutral field. Rebuilding is refused unless the target graph is exactly `gk_board`. After a reload, hydrate sprites with `node scripts/experiment-sprites.mjs gk_board`.
