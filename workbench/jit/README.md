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

| Edge | Meaning | Where it comes from |
|---|---|---|
| `CORE` | The pair the team is built around | Source claim (Cybertron video) |
| `ENABLES` | A mon can use a move; a move feeds a partner | Engine learnsets and move data |
| `GOOD_VS` | Guaranteed OHKO on a selected target, or a checked useful effect | Native calculator or engine |
| `NOT_OHKO` | Hits but does not OHKO, even at +2 | Native calculator |
| `BAD_VS` | Counterplay: immunity, redirection, a threat the source names | Engine or source claim |
| `CARRIES` | Which meta mons bring that counterplay | Meta candidate sets |
| `ALTERNATIVE_TO` | Another mon for the same job | Engine index, hypothesis |

Every edge has a `status`: `source_claim`, `engine`, `native_checked` or `hypothesis`.

## Six beats for the video

1. **Seed** (`MATCH p=(:Mon)-[:CORE]->(:Mon) RETURN p`). A real top-16 team from Louisville Regionals: Alcremie, Mega Garchomp Z, Trick Room Torkoal. The cores come from the creator's explanation and are labeled as his claims.
2. **Index** (`MATCH p=(:Mon)-[:ENABLES]->(:Move)-[:ENABLES]->(:Mon) RETURN p`). From engine data alone, every status move that raises a target's stats is an ally booster (Decorate, Coaching, Aromatic Mist, Howl, plus Swagger and Flatter flagged as confusing). Every move that lowers a target by 2 or more becomes a boost for a Contrary ally (Memento or Charm into Mega Staraptor, Malamar, Serperior). No hand-written list.
3. **What +2 buys** (`MATCH p=(:Mon {onTeam:true})-[r:GOOD_VS|BAD_VS|NOT_OHKO]->(:Mon) RETURN p`). Native Smogon Champions calculator, eight chosen targets. Decorate turns Draco Meteor into a guaranteed OHKO on Rillaboom (31.3% at +0), Incineroar (2HKO at +0), Archaludon (93.8%) and Mega Charizard Y (2HKO at +0). Kingambit and Gholdengo are still 2HKOs. Sylveon is immune. Torkoal's sun Eruption already OHKOs Rillaboom, Kingambit and Gholdengo at +0.
4. **What breaks it** (`MATCH p=()-[:BAD_VS]->(:Mon {onTeam:true}) RETURN p`). Redirection carriers in the meta (Indeedee-F, Sinistcha, Volcarona, Maushold) steal Decorate. Fairy types blank Draco. The creator's own warnings stay as source claims: faster Garchomp, specially bulky Charizard, Focus Sash, rain against Torkoal, Taunt against Trick Room. Note the tension: the creator says bulky Charizard survives, and our calc on the common Charizard set says +2 Draco OHKOs. Both stay on the graph.
5. **Why Alcremie, specifically** (`MATCH p=(:Mon {id:'alcremie'})-[:GOOD_VS]->() RETURN p`). Sweet Veil blocks sleep for itself and its partner, which answers the meta's sleep hole (Venusaur). Rocky Helmet: 10 of the top 30 meta sets carry 2 or more contact attacks (Rillaboom, Sneasler, Incineroar, Kingambit, Basculegion...), computed from engine move flags.
6. **Alternatives** (`MATCH p=()-[:ALTERNATIVE_TO]->() RETURN p`). Other ally boosters for the same job (Coaching on Annihilape, Pawmot, Sneasler; Aromatic Mist; Howl), kept beside the seed, not replacing it. Mega Staraptor's Memento line from `gk_board` sits next to Garchomp for the one-Mega slot.

Close on: every strategy has counterplay; the graph makes it explicit so the pilot can play around it.

## Numbers observed

51 Mon, 21 Move, 7 Threat nodes; 111 ENABLES, 19 GOOD_VS, 16 BAD_VS, 5 NOT_OHKO, 9 ALTERNATIVE_TO, 5 CARRIES, 2 CORE edges. 28 native calculator calls on a neutral field (sun for Eruption). Team sets are read from the rental screen in the video; targets use `data/meta-sets.json` candidate sets (constructed from usage, not observed full sets). Learnsets are the Champions mod data, not a full validator.
