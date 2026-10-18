# Gimmikghoul demo: a team theory graph built just in time

**Thesis:** an agent with a graph of Pokémon mechanics can take a team idea, find what it needs, check what a support move actually buys against chosen targets, list what breaks it, and keep alternatives, in minutes. The graph is built per idea, from engine data, calculator results and attributed source claims, and it grows as the theory is revised.

It does not promise the agent invents winning teams, and no edge is a win rate.

## Run (about 30 seconds of compute)

Prerequisites: `docker compose up -d --wait` (FalkorDB on 6388, Browser on http://localhost:4319), the Showdown cache (`npm run prepare:data`) and the native calculator (`node workbench/tools/prepare-calculator.mjs`).

```sh
node workbench/jit/build-jit.mjs 1   # resets gk_jit
node workbench/jit/build-jit.mjs 2
node workbench/jit/build-jit.mjs 3
node workbench/jit/build-jit.mjs 4
node workbench/jit/build-jit.mjs 5
node workbench/jit/build-jit.mjs 6
node scripts/experiment-sprites.mjs gk_jit
```

Each step prints what it added and a Browser query. In the Browser pick graph `gk_jit`, paste the query, and record the graph growing.

## Edge legend (relationship types)

No edge type means "good matchup" or "bad matchup". Edges record what was found and how.

| Edge | Meaning | Status values |
|---|---|---|
| `CORE` | The pair the source says the team is built around | `source_claim` |
| `CAN_LEARN` | Move is in the Champions learnset (or on the source's rental set); the set is not validated | `learnset_candidate`, `on_source_set` |
| `ENABLES` | A move feeds a partner: Decorate's +2, or a stat drop that Contrary would invert | `source_claim_and_move_data`, `rule_candidate` (ability present, targeting and set not checked) |
| `OHKO_AT_PLUS2` / `NOT_OHKO_AT_PLUS2` | Native calculator at +0 and +2; carries `at0`, `atPlus2`, `decorateFlips`, `attackerSet`, `defenderSet`, `conditions` | `native_checked` |
| `NO_EFFECT` | The move does nothing to that target (immunity) | `native_checked`, `engine_typechart` |
| `COUNTERPLAY` | Something that can stop the plan; carriers linked by `CARRIES` | `source_claim`, `meta_candidate_set` |
| `BLOCKS` / `HELMET_CHIPS` | Sweet Veil versus sleep; Rocky Helmet versus contact attackers | `engine_ability_text`, `engine_move_flags` |
| `ALTERNATIVE_TO` | Another mon that can do the same job | `hypothesis` |

Team sets come from the source's rental screen (`Mon.setSource`). Target sets are `data/meta-sets.json` candidates, constructed from usage, not observed full sets.

## Six beats for the video

1. **Seed** (`MATCH p=(:Mon)-[:CORE]->(:Mon) RETURN p`). A real top-16 team from Louisville Regionals: Alcremie, Mega Garchomp Z, Trick Room Torkoal. The cores come from the creator's explanation and are labeled as his claims.
2. **Index** (`MATCH p=(:Mon)-[:CAN_LEARN]->(:Move)-[:ENABLES]->(:Mon) RETURN p`). From engine data alone, every status move that raises a target's stats is an ally booster (Decorate, Coaching, Aromatic Mist, Howl, plus Swagger and Flatter flagged as confusing). Every move that lowers a target by 2 or more becomes a boost for a Contrary ally (Memento or Charm into Mega Staraptor, Malamar, Serperior). No hand-written list. These are learnset and rule candidates, not validated sets or traced interactions.
3. **What +2 buys** (`MATCH p=(:Mon {onTeam:true})-[r:OHKO_AT_PLUS2|NOT_OHKO_AT_PLUS2|NO_EFFECT]->(:Mon) RETURN p`). Native Smogon Champions calculator, eight chosen targets. Decorate turns Draco Meteor into a guaranteed OHKO on Rillaboom (31.3% at +0), Incineroar (2HKO at +0), Archaludon (93.8%) and Mega Charizard Y (2HKO at +0). Kingambit and Gholdengo are still 2HKOs, which is not a lost matchup, just no OHKO. Sylveon takes no damage. Torkoal's sun Eruption already OHKOs Rillaboom, Kingambit and Gholdengo at +0.
4. **What breaks it** (`MATCH p=()-[:COUNTERPLAY|NO_EFFECT]->(:Mon {onTeam:true}) RETURN p`). Redirection carriers in the meta (Indeedee-F, Sinistcha, Volcarona, Maushold) steal Decorate. Fairy types blank Draco. The creator's own warnings stay as source claims: faster Garchomp, specially bulky Charizard, Focus Sash, rain against Torkoal, Taunt against Trick Room. Note the tension: the creator says bulky Charizard survives, and our calc on the common Charizard set says +2 Draco OHKOs. Both stay on the graph.
5. **Why Alcremie, specifically** (`MATCH p=(:Mon {id:'alcremie'})-[:BLOCKS|HELMET_CHIPS]->() RETURN p`). Sweet Veil blocks sleep for itself and its partner, which answers the meta's sleep hole (Venusaur). Rocky Helmet: 10 of the top 30 meta sets carry 2 or more contact attacks (Rillaboom, Sneasler, Incineroar, Kingambit, Basculegion...), computed from engine move flags.
6. **Alternatives** (`MATCH p=()-[:ALTERNATIVE_TO]->() RETURN p`). Other ally boosters for the same job (Coaching on Annihilape, Pawmot, Sneasler; Aromatic Mist; Howl), kept beside the seed, not replacing it. Mega Staraptor's Memento line from `gk_board` sits next to Garchomp for the one-Mega slot.

Close on: every strategy has counterplay; the graph makes it explicit so the pilot can play around it.

## Numbers observed

51 Mon, 21 Move, 7 Threat nodes, 1 Source; 51 CAN_LEARN, 61 ENABLES, 8 OHKO_AT_PLUS2, 5 NOT_OHKO_AT_PLUS2, 7 NO_EFFECT, 9 COUNTERPLAY, 5 CARRIES, 1 BLOCKS, 10 HELMET_CHIPS, 9 ALTERNATIVE_TO, 2 CORE edges. 28 native calculator calls (neutral field; sun for Eruption). Learnsets are Champions mod data, not a full validator.
