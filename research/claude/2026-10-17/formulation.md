# Strategy formulation: what to calculate and how

Thread 2, Pokémon Strategy Lab. Written 2026-10-17. Status: formulation plus one executed pilot (`clawitzer_example.md`) and a phased plan (`experiment_proposal.md`); nothing here commits the project to a design.

## 0. Scope, sources and conventions

| Item | Value | How it was checked |
|---|---|---|
| Game / regulation | Pokémon Champions, Regulation Set M-C, 2026-09-09 to 2026-12-02 | victoryroad.pro and metavgc.com regulation pages (fetched 2026-10-17) |
| Doubles | VGC 2026 Reg M-C: bring 6, pick 4, Open Team Sheets | Showdown `config/formats.ts` (`Flat Rules`, `Open Team Sheets`, picked size Auto = 4) |
| Singles | BSS Reg M-C: bring 6, pick 3, no team sheets | same file (`Picked Team Size = Auto` = 3 for singles) |
| Mechanics oracle | Showdown `data/mods/champions`, commit `7244fe8` (2026-10-16), built locally | `sim/team-validator.ts`, `sim/dex-formats.ts` |
| Stats | Level 50, IVs 31, Stat Points ≤ 32 per stat and ≤ 66 total; stat = base + SP + 20 (HP: base + SP + 75), then nature | `validateStats`, `dex-formats.ts` (`evLimit = 66`), `mods/champions/scripts.ts` |
| Other differences that matter here | No Terastallization; Mega Evolution allowed; Protect has 8 PP; Fake Out disabled after the first action; paralysis full-stop 1/8; sleep lasts 1-2 turns; Megas keep their form when revived | `mods/champions/{scripts,moves,conditions}.ts` |

Showdown is a community re-implementation and its ladders are a community proxy, not official Champions telemetry. Where this document says "engine-verified" it means "verified in Showdown's Champions mod at that commit", not on cartridge.

The local experiment at `/Users/apple/Projects/pokemon-core-lab` is not reachable from this cloud thread, so nothing here reads or modifies it. The Reddit report is also unreachable from this container (proxy refuses reddit.com), so the Clawitzer sets below are hypothetical and labelled as such.

## 1. Objects

**Static catalog `K`.** Species/forms, moves, abilities, items, type chart, learnsets, and the regulation's legal pool. In this thread `K` is the engine itself, queried through `Dex.forFormat(...)` and `TeamValidator`. Mechanics are code (event handlers), so the catalog's job is to index them, not to restate them.

**Plan.** A plan for key Pokémon `k` is a predicate over a battle trajectory τ, for example
`E_k(τ) = [k executes ≥ m attacking actions within H turns] ∧ [k alive at turn H]`.
"Keep Clawitzer alive and able to execute its plan" is `E_Clawitzer`; the protection mechanism is whatever raises `P(E_k)`, not a named ability.

**Threat.** An opponent action that lowers `P(E_k)`: `θ = (actor, move, target slot, priority, category, type, spread?, contact?)`. Threats come from the opponent's known or believed sets.

**Interception stages.** Every way to blunt θ acts at one point in the engine's move-resolution order. The stage is read from which event a handler hooks, which is what makes candidate generation mechanical rather than anecdotal:

| Stage | Engine hooks (examples) | Members found in the Reg M-C pool |
|---|---|---|
| S0 deter / exposure | none: changes opponent policy or removes `k` from the slot | switching to a resist (Archaludon vs Electric/Grass), offensive threat, Protect mind games |
| S1 prevent the action | `onBeforeMove`, `onDisableMove` | Fake Out, Taunt, Encore, Disable, flinch, sleep, KO first |
| S2 retarget | `onFoeRedirectTarget`, `onAnyRedirectTarget` | Follow Me, Rage Powder, Lightning Rod |
| S3 block on target | `onTryHit`, `onFoeTryMove`, `onTryHitSide` | Protect/Detect, Quick Guard, Wide Guard, Psychic Terrain, Armor Tail, Queenly Majesty, Volt Absorb / Water Absorb / Sap Sipper / Levitate (holder only), Magic Bounce (holder only) |
| S4 reduce damage | `onAnyModifyDamage`, `onSourceModifyDamage`, stat modifiers | Friend Guard, Light Screen / Reflect / Aurora Veil, resist berries, Intimidate / Snarl, Multiscale |
| S5 survive / recover | `onDamage`, berries | Focus Sash, Sitrus Berry, Sturdy, Endure |
| S6 reorder | `onModifySpe`, `onModifyPriority`, pseudo-weather | Trick Room, Tailwind, Icy Wind / Electroweb, Prankster, Choice Scarf |
| bypass (counterplay) | `onModifyMove` (`tracksTarget`, `ignoreAbility`), move target | Stalwart and Snipe Shot ignore S2; Mold Breaker ignores breakable abilities (Lightning Rod, Friend Guard, Armor Tail); spread moves are never retargeted; Grass types and Overcoat ignore Rage Powder; Fake Out (+3) beats Follow Me (+2) |

`exp/stages.js` builds this index automatically from handler names (42 S3 entries, 38 S4, 23 S6, 3 S2, plus 18 bypass entries in Reg M-C). It over-generates on purpose, since the simulator is the filter.

**Mechanism instance.** `μ = (stage, effect, carrier, prerequisites, scope, duration, bypass set, cost)`, where carrier is a (species, ability/move/item) slot, scope is one of {holder, ally, side, field}, and cost counts the team slot, move slots, item (Item Clause), Mega slot (one per battle) and the tempo of spending the turn. Scope is the field that stops the old error: Volt Absorb, Magic Bounce and a Ground typing have scope = holder, so they never protect a partner except through S0 positioning.

## 2. State and belief: the minimum needed to compare mechanisms

**Tactical state `x`** (per turn): for each active and benched Pokémon, its form (Mega or not), HP, status, stat stages, whether its item is still held, whether Fake Out is still available (first turn out), the Protect/Quick Guard success counter, choice lock and volatile durations. Per side: Tailwind, screens, Mega used, `totalFainted` (Last Respects reads this). On the field: terrain, weather and Trick Room with their remaining turns. Everything else (exact log, cosmetic data) is irrelevant to the comparisons below.

**Hidden information differs by format, and this decides how big the belief is:**

- *Doubles Reg M-C (Open Team Sheets).* Species, item, ability, moves and, on Showdown, nature are revealed before leads (`Battle.showOpenTeamSheets`). Hidden: Stat Point split (66 points), which four are brought, the leads, and the action policy. Belief `b(SP | species)` can be a small mixture of spread archetypes (bulky vs fast), updated by observed speed order and damage.
- *Singles BSS Reg M-C (no sheets).* Hidden: the full set. Use `b(set | species, date) ∝ usage prior × likelihood of reveals` (moves used, item consumed, speed order, damage consistent with SP), the standard Bayesian set inference.

The opponent's **action policy** is the largest uncertainty in both formats. Three models, in increasing reliance on data: (i) zero-sum equilibrium of the local game (robust, data-free); (ii) level-k responses; (iii) dated empirical frequencies of leads and targets from Thread 1's evidence, kept separate from mechanics and always carried with their date and source.

## 3. Three decision levels, three different problems

**(a) Team construction (static, 6 Pokémon).**
`max_T  Σ_o w_o(t) · V_sel(T, o)  −  λ·cost(T)`  subject to legality (species clause, Item Clause, one Mega used per battle, learnsets, regulation pool at date `t`).
`o` ranges over opponent archetypes with dated weights `w_o(t)`. Because `V_sel` is expensive, generation uses a cheap surrogate first: for each plan `E_k` and each important threat θ, require coverage by at least `r` mechanisms from distinct stages or with disjoint bypass sets. This is a set-multicover (ILP/CP-SAT) over threats × stages. It produces diverse alternatives because a counter that defeats one stage (Stalwart vs S2) does not defeat another (S3 Armor Tail, S6 Trick Room).

**(b) Selection at team preview (bring 3 or 4, plus leads).**
A simultaneous zero-sum matrix game `M[s, s']` where `s` is our (subset, lead pair) and `s'` theirs. Doubles: C(6,4) × C(4,2) = 90 options per side; singles: C(6,3) × 3 = 60. Solve with LP or Hedge for an equilibrium mix. Each entry is estimated by (c) at low fidelity.

**(c) Short tactical sequences (1-3 turns).**
At each turn, a simultaneous-move game over joint actions. Evaluate `M[a, a'] = E[U(τ) | x, a, a', continuation π]` by sampling the engine over RNG seeds and the SP belief. Prune joint actions by stage relevance: keep only actions that attack, act on a stage touching a live threat, or switch. Continuations past the first turn come from a scripted policy (pilot), later from a learned value if horizon sensitivity says so.

## 4. What to measure

For each (candidate partner or mechanism, opponent archetype):

- **Plan value** `U = E[#k attacks over H turns] + P(k alive at H)` (pilot: H = 3). Optional tempo term: `+ E[opponent HP removed]`.
- **Robust value**: the equilibrium value of the matrix game, with its duality gap (Hedge lower and upper bounds).
- **Exploitability**: the naive value (best row against a uniform opponent) minus the equilibrium value. A large gap means the mechanism only works if the opponent cooperates (for example, Follow Me without anyone using Fake Out).
- **Worst archetype**: the minimum over `o`, which exposes the hard counters (Stalwart, spread moves).
- **Mechanism attribution**: how often the engine log shows the stage firing (Lightning Rod activation, Follow Me, Psychic Terrain, Armor Tail, Quick Guard, Clawitzer flinched).
- **Cost**: slots, item, Mega, and the tempo lost (damage not dealt).
- **Uncertainty**: binomial SE per cell (n seeds), a bootstrap over seeds, and sensitivity to the continuation policy and the SP belief. A ranking that flips under a different continuation is reported as unresolved, not as a result.

Legality and viability are separate outputs. Legality is a hard validator verdict per regulation and date (`TeamValidator`); viability is a number with an uncertainty attached. A legal set can have zero viability; an illegal set is never scored.

## 5. Method options, judged against the simplest baseline

| Option | Use it for | Verdict |
|---|---|---|
| Interpretable heuristics (type chart × BP, speed tiers) | pruning, a turn-2 scripted policy | Necessary but insufficient: it cannot see priority brackets, Stalwart, terrain overwrite order or Fake Out timing |
| Constraint optimization (ILP / CP-SAT set multicover) | team construction over stage coverage with costs | Cheap and transparent; the right generator for level (a) |
| Selective simulation with the engine as oracle + small matrix games | levels (b) and (c) | **Recommended baseline.** Exact mechanics, honest uncertainty, explains its answer through logs; about 15 ms per 3-turn sample on one core |
| MCTS / deeper search | long tactical lines (Trick Room turns, pivot-and-return) | Only where the pilot shows horizon sensitivity. Simultaneous moves need decoupled UCT or equilibrium backups; not required up front |
| Policy/value net or learned ranker | replacing scripted continuations; amortizing level (b) | Only if it beats the sim baseline on withheld teams and mechanisms at equal compute (§6). No labelled data exists yet, and selected wins are not win-rate data |

## 6. Evaluation that does not overfit to one anecdote

1. **Withheld mechanisms.** Freeze the stage index and the scoring before looking at a mechanism family, then test whether the generator proposes it and the evaluator ranks it sensibly. For example, tune on Follow Me / Lightning Rod scenarios, then test on Armor Tail, Psychic Terrain, Quick Guard and pivoting. Success means the withheld families appear in the top-k when the sim says they should.
2. **Withheld teams and archetypes.** Split opponent archetypes by date and source; weights tuned on M-B-era or one creator's teams are tested on others.
3. **Counterexample suite** (must pass before any ranking is trusted): Stalwart / Snipe Shot vs redirection; a spread Electric move vs Lightning Rod; Rage Powder vs a Grass attacker; Fake Out (+3) before Follow Me (+2); Mold Breaker vs Friend Guard; Volt Absorb on the partner (protects only itself); Psychic Terrain vs Grassy Surge with a speed tie.
4. **Cheap vs expensive agreement.** Kendall τ and top-k recall between the cheap evaluator (H = 3, 40 seeds) and an expensive one (longer horizon, more seeds, best-response continuation) on held-out cells.
5. **Evidence check, qualitative only.** Thread 1's extracted expert choices (leads, targets) can test whether the opponent model is plausible. They are never used as win rates.

## 7. Development cases (engine-verified, Showdown Champions mod `7244fe8`)

**Mega Sableye + Galarian Slowking.** Both are legal in Reg M-C doubles and singles and in M-B.
- Mega Sableye: Dark/Ghost, 50/85/125/85/115/20, Magic Bounce. Galarian Slowking: Poison/Psychic, 95/65/80/110/110/30, abilities Curious Medicine / Own Tempo / Regenerator; it learns Trick Room, Eerie Spell and Chilly Reception.
- *Prankster is lost on the Mega turn.* Sableye's Will-O-Wisp moved last on the turn it Mega Evolved, and before a faster Jolteon when it did not (`exp/devcases.js` A1). Priority is computed with the post-Mega ability.
- *Magic Bounce protects only the holder.* A Prankster Taunt aimed at Sableye was reflected; the same Taunt aimed at Slowking landed and stopped its Trick Room (A3).
- *Curious Medicine works as a partner mechanism.* On entry it cleared Sableye's Intimidate drop (A2). It also clears allies' positive boosts, which is a real cost.

**Mega Banette + Pawmot + Basculegion.** This case is legal only from Reg M-C: Pawmot (and Indeedee) are absent from Showdown's M-B mod, and metavgc's M-C page marks both as new.
- Mega Banette: Ghost, 64/165/75/93/83/75, Prankster. Pawmot: Volt Absorb / Natural Cure / Iron Fist; it learns Revival Blessing, Fake Out and Upper Hand. Basculegion: Swift Swim / Adaptability / Mold Breaker; it learns Last Respects.
- *Prankster is gained on the Mega turn.* Base Banette has no Prankster, but its Mega-turn Destiny Bond went ahead of a faster Choice Scarf Jolteon (B1). This is the mirror image of Sableye.
- Revival Blessing brought back Banette-Mega at 49% HP, still in Mega form.
- Last Respects power is `50 + 50 × side.totalFainted`, a counter that never decreases (`data/moves.ts`). So a revived Banette that faints again adds another 50 BP in the engine. Cartridge behaviour is not verified.
- Last Respects is banned in Showdown's Champions OU (a singles ladder format) but legal in VGC and BSS Reg M-C.
- Destiny Bond fails if it is used twice in a row (`onPrepareHit`).

## 8. Interfaces this needs from the representation thread

- `legal(set, format, date) → {ok, problems}`: hard constraints only.
- `effects(stage | hook) → [(effect_id, kind, scope, bypass_tags)]` and `carriers(effect_id, format, date) → [species/form + slot]`: the stage index, regenerable from the engine.
- `threats(opp_set_belief, our_slot) → [θ]`
- `simulate(state | teams+leads, joint_actions, seed, continuation) → (outcome vector, log events)`: the engine.
- Observations, claims and usage stay outside the mechanics catalog, each with its source, date and status (observed, stated or inferred). Computed hypotheses such as a matrix entry or a ranking are stored as derived records with their seeds, commit hash and continuation policy, never as facts.
