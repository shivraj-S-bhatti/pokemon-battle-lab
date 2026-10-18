# E6: Boost chains as graph paths (Champions Reg M-C)

## Findings

The path search rediscovers the Audino / Snorlax / Slowbro chain without being told about it. The Cypher path query returns the effect sequence `amp:simple -[ally]-> boost:def+spd -[ally]-> copy -[same]-> harden:crit -[same]-> harden:recover -[same]-> win:bodypress`, and the concretization step fills it with the only Simple Beam users in the format (Audino, Farfetch'd, Sirfetch'd), the Stockpile holders and the 69 Psych Up users:

Audino: Simple Beam -> Snorlax: Stockpile x3 -> Slowbro: Psych Up -> Slowbro: Mega Evolve (Shell Armor) -> Slowbro: Slack Off -> Slowbro: Body Press

- Stages: Simple doubles each Stockpile, so 3 uses reach +6 Def / +6 SpD (Stockpile's 3-use cap and the +6 cap land on the same turn). Five setup moves in all (Simple Beam, 3 Stockpiles, Psych Up) plus a switch to bring Slowbro in. Audino (50 base Speed) outspeeds Snorlax (30), so Simple Beam and the first Stockpile share turn 1; in the science agent's executed route the setup took three turns and the first attack came on turn four (workbench/RUNTHROUGH_CHECK.md). The survival check below is post-setup bulk, not evidence the setup survives.
- Survival, native calculator, receiver on its most common usage spread (Quiet, 32 HP / 32 SpA / 2 SpD) at +6/+6: the strongest hit from the top 10 candidate sets is `32 SpA Life Orb Gholdengo Shadow Ball vs. +6 32 HP / 2 SpD Slowbro-Mega: 55-65 (27.2 - 32.1%) -- guaranteed 4HKO`. With Slack Off and no crits, nothing in the top 10 breaks it.
- Payoff: Body Press at +6 Def, with 0 Def stat points: `vs. 2 HP / 0 Def Rillaboom: 123.7 - 145.7% -- guaranteed OHKO`, `vs. 32 HP / 0 Def Incineroar: 216.8 - 255.4% -- guaranteed OHKO`, `vs. 2 HP / 0 Def Sneasler: 95.5 - 112.7% -- 75% chance to OHKO`. Body Press does nothing to Ghosts: Basculegion, Gholdengo, Sinistcha, Mega Gengar and Mega Froslass are in the top 60.
- Dealbreakers (species-level estimate from usage marginals, not a share of teams): Whimsicott Encore (69% of its sets), Mega Gengar Perish Song (72%), Politoed Perish Song (42%), Mega Raichu-Y Encore (18%). No top-60 species runs Haze, Clear Smog or Unaware on 10% or more of its sets.
- Current usage: Snorlax runs Stockpile and Body Press often, but the Snorlax-with-Slowbro pairing is close to zero in the teammate data, so the full chain scores near-zero usage.

It ranks 491st of 62,531 concrete chains on the ranking index. The ones above it either copy a bigger boost (Clangorous Soul raises all five stats) or pay off with Stored Power. With every stat at +4, Stored Power has 420 BP.

## Top chains

All numbers below are native calculator output (smogon/damage-calc c1eb09be through `workbench/tools/calculator.mjs`). Receiver sets use the receiver's most common usage spread and fill the moves from the chain. Attacker and target sets are the constructed candidate sets in `data/meta-sets.json`. These are marginal-mode candidates, not observed full sets. "Strongest hit" is the highest-damage move any of the top 10 candidate sets has into the boosted receiver. Exposure figures are species-level estimates from usage marginals. Doubles exposure after setup (Taunt and Encore excluded) is 0.091 expected answer-carriers per opposing team. Counting Taunt and Encore, it is 0.262.

| # | Chain | Final stages | Setup actions | Strongest top-10 hit into receiver | Payoff threshold |
|---|---|---|---|---|---|
| 1 | Audino Simple Beam -> Kommo-o Clangorous Soul x2 -> Farigiraf Psych Up, Rest, Stored Power | +4 all five | 4 | Mega Golisopod Leech Life: 32.4-38.7%, 7.1% to 3HKO after Leftovers | Stored Power 420 BP OHKOs Rillaboom (577%+), Sneasler, Mega Salamence |
| 2 | Same, receiver Slowbro, Mega Evolve (Shell Armor), Slack Off, Stored Power | +4 all five | 4 | Gholdengo Shadow Ball: 36.1-43.5%, guaranteed 3HKO | 420 BP OHKOs all three targets by 7x or more |
| 3 | Same, receiver Oranguru (Rest) | +4 all five | 4 | Mega Golisopod Leech Life: 31.4-37.5%, 0.1% to 3HKO | 420 BP OHKOs all three targets |
| 4 | Audino Simple Beam -> Volcarona Quiver Dance x2 -> Galarian Slowking Psych Up, Slack Off, Stored Power | +6 SpA/SpD/Spe | 5 | Kingambit Kowtow Cleave: 98-115.8%, 81.3% to OHKO | 380 BP OHKOs all three |
| 5 | Same, receiver Reuniclus | +6 SpA/SpD/Spe | 5 | Mega Golisopod Leech Life: 124.4-146.5%, guaranteed OHKO | 380 BP OHKOs all three |
| 6 | Same, receiver Slowking | +6 SpA/SpD/Spe | 5 | Rillaboom Wood Hammer: 99-116.8%, 87.5% to OHKO | 380 BP OHKOs all three |
| 7 | Audino Simple Beam -> Falinks No Retreat (once) -> Metagross Psych Up, Rest, Clear Body, Steel Roller | +2 all five | 3 | Gholdengo Shadow Ball: 54-64.1%, guaranteed 2HKO | Steel Roller fails with no terrain, so the calculator returns nothing. The chain needs a terrain partner. |
| 8 | Audino Simple Beam -> Falinks No Retreat, Battle Armor, Rest, Focus Blast | +2 all five | 2 | Mega Salamence Hyper Voice: 59.3-69.7%, guaranteed 2HKO | Focus Blast OHKOs Rillaboom and Incineroar, 2HKOs Sneasler |
| 9 | Audino Simple Beam -> Falinks No Retreat -> Armarouge Psych Up, Rest, Stored Power | +2 all five | 3 | Basculegion Wave Crash: 66.6-79.1%, guaranteed 2HKO | 220 BP OHKOs all three |
| 10 | Audino Simple Beam -> Slowbro Nasty Plot x2, Mega Evolve, Slack Off, Future Sight | +6 SpA | 2 | Gholdengo Shadow Ball: 105.4-124.7%, guaranteed OHKO | Future Sight OHKOs all three |

What the calculator changes:

- Copying Def and SpD is what makes the receiver hard to kill. Quiver Dance chains (4 to 6) hit just as hard, but Kowtow Cleave, Leech Life and Wood Hammer still OHKO a receiver with no Def boost. The Stockpile and Clangorous Soul chains hold under 45% from every top-10 hit. That is the threshold that separates the two families.
- Clangorous Soul under Simple is capped by its HP cost: two uses (2/3 HP) give +4 all, not +6. The receiver copies the boosts at full HP, so Psych Up removes that drawback.
- Stored Power is overkill against every target checked. The real limit is Psychic's immune list: Kingambit and the Dark types. Body Press reaches 3 OHKOs with only Def boosts but loses to Ghosts. The choice between the two payoffs is a matchup choice, not a damage choice.
- Chain 10 is the cheapest at 2 setup actions, but it gives no bulk: Mega Slowbro at +0 SpD takes an OHKO from Gholdengo.

Singles (BSS) chains have no ally step, so Simple Beam and Psych Up drop out. The best are self-contained: Kommo-o Clangorous Soul, Rest, Focus Blast or Body Press (+2 all after one use), and Falinks No Retreat with Battle Armor. Singles exposure is much higher: 0.714 expected answer-carriers per opposing team, led by Encore (0.287), Dragon Tail (0.121), Whirlwind and Roar.

Novelty: every concrete chain in the top 60 scores under 0.001 on usage (holder usage x P(setup move) x P(teammate) x P(payoff move)). The meta does not run any of these chains as complete lines.

## Cypher

The chain search (run by `chains.cjs`; 4,422 effect paths in about 110 ms):

```cypher
MATCH p=(s:Effect)-[:ENABLES*2..5]->(w:Effect {kind:'win'})
WHERE s.kind IN ['amp','self','boost']
  AND size([n IN nodes(p) WHERE n.kind IN ['boost','invert']]) = 1
  AND size([n IN nodes(p) WHERE n.kind IN ['copy','pass']]) <= 1
  AND (w.needs = 'any' OR any(n IN nodes(p) WHERE w.needs IN n.stats))
  AND all(n IN nodes(p) WHERE n.carriers > 0)
RETURN [n IN nodes(p) | n.id] AS steps, [r IN relationships(p) | r.hand] AS hands,
       [n IN nodes(p) | n.carriers] AS carriers
```

`hand` on each ENABLES edge says whether the state stays on the same mon (`same`) or lands on a partner (`ally`). The JS step cuts each path at `ally` edges and gives each segment a mon that has a CAN edge to every effect in it.

Browser query 1, every Simple-to-Body-Press route in the effect graph:

```cypher
MATCH p=(s:Effect {id:'amp:simple'})-[:ENABLES*1..4]->(w:Effect {id:'win:bodypress'}) RETURN p LIMIT 40
```

Browser query 2, the reference chain as one pattern over mons and effects:

```cypher
MATCH (a:Mon {name:'Audino'})-[r1:CAN]->(e1:Effect {id:'amp:simple'})-[x1:ENABLES]->(e2:Effect {id:'boost:def+spd'})<-[r2:CAN {via:'Stockpile'}]-(h:Mon {name:'Snorlax'}),
      (e2)-[x2:ENABLES]->(e3:Effect {id:'copy'})<-[r3:CAN]-(s:Mon {name:'Slowbro'}),
      (e3)-[x3:ENABLES]->(e4:Effect {id:'harden:crit'})<-[r4:CAN]-(s),
      (e4)-[x4:ENABLES]->(e5:Effect {id:'win:bodypress'})<-[r5:CAN]-(s)
RETURN a, r1, e1, x1, e2, r2, h, x2, e3, r3, s, x3, e4, r4, x4, e5, r5
```

Browser query 3, the human view: plans, their mons, their targets and dealbreakers, and the calculator check that decides each one. Edges carry `status`: `hypothesis` (from search or usage) or `calculator_checked` (native adapter output).

```cypher
MATCH (p:Plan)-[r]->(n) RETURN p, r, n
```

## Method and numbers

- Legality uses the rules from E2 `mine.cjs`: validator format `gen9championsvgc2026regmc`, species from usage files or the validator, moves from `checkCanLearn`, nothing nonstandard. 293 base species are legal. Megas attach to their base species as a mid-battle step, and the Mega's ability counts from that step on.
- Graph `gk_chain`: 293 Mon, 30 Effect, 2,081 CAN (with `via` = move, ability or Mega Evolution), and 182 ENABLES (with `hand`). The 40 top chains are written back as (:Chain)-[:STEP]->(:Mon), and 11 (:Plan) nodes as the human view.
- Effects come from engine data: status self-boost moves (Stockpile counts as +1 Def/+1 SpD, up to 3 uses), Curse for non-Ghosts, Contrary inversion of self-drop moves, Simple Beam, and Skill Swap or Entrainment from a Simple or Contrary holder. Psych Up copies; Baton Pass passes. Shell Armor and Battle Armor (native or by Mega) give crit immunity. Clear Body, White Smoke, Mirror Armor and Full Metal Body give drop immunity. Recovery covers Recover and its relatives, Rest and Wish. Payoffs are Body Press, Stored Power or Power Trip, and the best boosted-stat STAB move of 80 BP or more. Doodle and Spectral Thief are not in the format.
- One setup node per chain. Allowing setup-to-setup edges made the path count explode (the query timed out), and multi-stat moves already exist as single nodes.
- Stages respect +6 and each move's own limits: Stockpile 3 uses, Clangorous Soul 2 (HP cost), No Retreat 1. Speed boosts count only when they change the share of the top 60 the receiver outspeeds by 0.1 or more.
- The ranking index (used only to order chains before calculator checks) multiplies HP x boosted Def and SpD, payoff BP x boosted attacking stat, and the Psychic or Fighting immune share of the top 60. It divides by setup actions and discounts by the species-level exposure estimate. Every damage and KO number in this report comes from the native calculator.
- Files: `.artifacts/experiments/E6/chains.cjs` (loader, path search, ranking, writes `chains.json`), `.artifacts/experiments/E6/calc.mjs` (calculator thresholds, Plan nodes, writes `calc.json`).
