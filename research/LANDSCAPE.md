# Competitive Pokémon AI: what is solved, what is open

Scope: team building, team preview, and battling in VGC doubles, random battles and Battle Stadium Singles. The single-player RPG is out of scope. Sources are the notes in this folder ([bot history](bot-history.md), [reading list](reading-list.md), [video sources](VIDEO_SOURCES.md), [review](CLAUDE_AND_PERPLEXITY_REVIEW.md), [formulation](claude/2026-10-17/formulation.md)) and the FalkorDB idea research in `hivemind/citations/notes/2026-10-16-falkordb-idea-research.md`. Ladder results are self-reported unless stated.

## Status by problem

| Problem | Status | Evidence | Why |
|---|---|---|---|
| Legality, learnsets, stats | Lookup | Showdown validator, pinned Champions mod | Rules are code. |
| Type coverage and weakness holes | Arithmetic | See "Coverage as matrices" below | 18 types, 6 slots. |
| Damage, speed order, one exact turn | Computed | Showdown engine, damage calc | Deterministic given state and seed. |
| Best mix for one turn, once payoffs are known | Polynomial | Two-player zero-sum matrix game, solvable by linear programming | The PPAD result in [complexity notes](complexity-notes.md) covers general-sum games; a two-player battle is zero-sum. |
| Fast simulator | Done, and it was the bottleneck | V02 4:33; Jaxcalibur's JAX engine | Learning needs 10^5 to 10^8 games. |
| Battling with a given team | Bot-favoured as of Sept 2026 | Jaxcalibur #1 randbats (Aug 2026); two VGC ladder #1 bots (V02 2:02); Metamon 90th to 99th percentile in singles | Learned value plus shallow search. The Bo1 bot looked one turn ahead (V02 3:33). |
| Team preview: bring four, choose leads | Open; bots weak | V02 4:03 | A 90 × 90 simultaneous game per matchup (formulation §3b), each cell an expensive estimate. |
| Hidden information: sets, Stat Points, benched Pokémon | Partly handled | Jaxcalibur samples "worlds" from predicted sets; V02 calls it a bot weakness | Beliefs need set-level data; usage files give only per-Pokémon marginals. |
| Team building and the meta call | Open | V01 43:00; VGC-Bench reports degradation as team diversity grows | Value depends on the opponent distribution and the pilot, and has no agreed theory. |
| Explaining why a team works | Open | No bot explains itself; V02 20:34 on missing vocabulary | Learned values are not mechanisms. |

Long-running work: Showdown (2011), Smogon usage statistics, damage calculators, type-coverage builders, poke-env (about 2020), Future Sight AI's battle predictor (2022). Recent work: PokéLLMon (2024); PokéChamp, Metamon, VGC-Bench (2025); Jaxcalibur and the Champions VGC bots (Aug to Oct 2026).

## The question we care about

Is a team generally good, good only in the current field, a gimmick, or bad? This is a proposal. Each label has a measurable signature, given a simulator, a set of pilots `π` and an opponent distribution `w`:

| Label | Signature |
|---|---|
| Generally good | High mean win rate; holds when `w` is perturbed and when `π` changes. |
| Situational | High against some archetypes; mean moves a lot when `w` shifts. |
| Gimmick | Wins when opponents do not know the team. The gap between results against unprepared and prepared opponents is large and closes once the team is seen. V02 26:11 describes this decay; V01 23:03 gives the Trick Room Whimsicott example. |
| Bad | Dominated: another legal team matches or beats it against every archetype. |

Prior art covers pieces of this: matchup and synergy models with metagame equilibria (Sahovic), adversarial team building and metagame balance (Reis et al. 2023), and pilot-dependence of team results (VGC-Bench). We have not found the four-way classification with explicit perturbation of `w`, `π` and opponent knowledge, but we have not run a full literature search.

## Rules over attributes, not facts per Pokémon

"Rillaboom ignores Rage Powder" should never be stored as a fact. It follows from two facts and one rule:

- Rillaboom is Grass type.
- Grass type has `powder: 3` (immune) in Showdown's type chart (`data/typechart.ts:230` in the cached pinned revision).
- Rage Powder redirects only if `source.runStatusImmunity('powder')` passes (`data/moves.ts:14616`).

The engine checks the attacker's type at the moment the move is used. Forest's Curse, Soak, Overcoat and Safety Goggles are covered by the same rule with no extra entries. Storage is linear in rules plus facts, and deriving "who ignores Rage Powder" is a join.

The exponential part is elsewhere: combinations of six-Pokémon teams, four-of-six brings, joint actions and chance outcomes. No representation removes that. Only search, sampling and learned evaluation reduce it.

Practical consequence for the graph: index the engine's rules by the effect they have (the formulation's interception stages S0 to S6, generated from handler names), and derive species-level consequences at query time. The review's warning still applies: a hook name suggests a candidate, but scope and conditions need checking.

## Coverage as matrices

Let `E` be the 18 × 18 type chart, attacking type by defending type, with entries 0, 0.5, 1 or 2. A dual-typed defender's multiplier is the product of its two columns.

- **Defensive holes.** For each attacking type `a` and team member `m`, `D[a, m] = E[a, t1(m)] · E[a, t2(m)]`. A hole is a row where several members take 2× or more and none resists.
- **Offensive coverage.** With the team's attacking move types `S`, the best multiplier against defender type `d` is `max over s in S of E[s, d]`. That is a matrix product in the max-times semiring (sum replaced by max). Holes are defender types where the best is below 1.

Static builders stop here. Type math ignores abilities (Levitate, Water Absorb), items, Stat Points, speed, field effects and whether the opponent's species actually carries those types in the current field. Weighting each defender column by usage turns this into a crude version of `E_O`.

**Everyone against everyone.** A matchup matrix `M[i, j]` from simulations can be ranked with Elo or Bradley–Terry, but those assume a single strength order. Rock-paper-scissors cycles between archetypes break that. Nash averaging (Balduzzi et al. 2018, [Re-evaluating Evaluation](https://arxiv.org/abs/1806.02643)) ranks against the equilibrium of the matrix and is not distorted by adding near-duplicate teams.

## Transfer

The same structure, a portfolio chosen before a simultaneous, partly hidden, stochastic contest against a population, appears in:

- Deck building in card games (V01 41:26).
- Drafts in MOBAs and team sports: the draft or roster is team building, the pick and ban phase is team preview.
- Robust portfolio construction: the market scenarios play the role of the metagame, and stress tests play the role of perturbing `w`.
- Security: defences chosen before an adaptive attacker, with red-team exercises playing the role of the gauntlet.
- Model and agent evaluation: ranking agents against a population is the matchup-matrix problem, and Nash averaging came from there.

## For the writing

Arc for the "how good were the bots actually" video: bots went from LLM agents near the median (PokéLLMon) to ladder #1 in under three years. The enabling step was a fast simulator plus learned evaluation, not reasoning (V02). That solves the part both expert speakers consider tractable (battling), and leaves the part both call open (team building, preview, the meta call). The hard question is the classification table above.
