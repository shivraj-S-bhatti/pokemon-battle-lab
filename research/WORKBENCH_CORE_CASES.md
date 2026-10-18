# Three cores for the Gimmikghoul workbench

October 18, 2026. The case bank is [data/workbench-cases.json](../data/workbench-cases.json). It supplies small, inspectable plans that a person and an agent can edit together. It separates practitioner examples, new hypotheses and checked game mechanics.

The strongest opening interaction is **“remove one enabler, then find different ways to recover the useful turn.”** The graph should reveal the consequence of the edit and retrieve alternative mechanisms. A damage calculator can then check the remaining quantitative questions.

## Mega Sableye and Galarian Slowking, singles bring six choose three

Shivraj supplied [SplashPlate's anti-meta video](https://www.youtube.com/watch?v=zQQH_5liolE) as the motivating example. The repository has metadata and the user-described core; it does not have extracted creator sets or a complete battle timeline. The two sets in the case bank are our candidate sets, not an attribution to SplashPlate. See [the earlier source record](SINGLES_CASES.md).

The initial plan is to use Sableye's disruption control and recovery, pivot Fairy pressure into Slowking, and use regeneration to preserve the cycle. The important question is which selected third member makes progress while that cycle operates.

```text
Reflectable disruption ---- Magic Bounce ---- Mega Sableye
                                             |
                                      Fairy pressure
                                             |
                                    Galarian Slowking
                                 Fairy resistance + recovery
                                             |
                              Chilly Reception / switch
                                             |
                               Third member makes progress
```

The graph must expose three qualifications before presenting a recommendation:

- **Sableye does not resist Ghost or Dark.** Dark/Ghost makes both neutral. Slowking is weak to both, so the pair has not automatically solved those switch-ins.
- **Fairy resistance does not certify a Primarina matchup.** Its Water attack is neutral against Slowking. Survival depends on its set, Slowking's spread and remaining health.
- **A defensive pair costs two of three selected slots.** The final slot may need immediate breaking power rather than another nominal type patch.

Those type results were checked through the pinned Champions Dex. Magic Bounce, Regenerator and the move behavior are in the [pinned abilities](https://github.com/smogon/pokemon-showdown/blob/a833737d8408322c8b1e821dee16af07b1fd9234/data/abilities.ts) and [moves](https://github.com/smogon/pokemon-showdown/blob/a833737d8408322c8b1e821dee16af07b1fd9234/data/moves.ts).

Three candidate directions are deliberately kept separate: Corviknight for a Ground-immune defensive pivot; Garchomp for physical progress; Primarina for special breaking pressure. None is ranked as best. The next meaningful query names an opposing six and asks what each selected third can accomplish, including whether it can force progress through recovery.

## Torterra, Mega Raichu Y and Milotic, doubles bring six choose four

This is Shivraj's proposed core. Its most interesting initial form is **Wide Guard Torterra**, rather than assuming Torterra must use Shell Smash.

```text
Torterra -- Wide Guard --> protects side from eligible spread attacks
   |                                  |
   +-- Headlong Rush                  +--> Mega Raichu Y gets an attack
       targeted Ground damage               No Guard + Zap Cannon

Opponent stat drop --> Milotic Competitive --> stronger special pressure
```

The attraction is turn access: can Torterra buy the fragile attacker a useful turn while Milotic discourages a relevant stat-drop line? The three mechanisms operate under different conditions. Keeping those conditions visible is more useful than storing an unconditional `SYNERGIZES_WITH` edge.

Several easy-to-miss details matter:

- Mega Raichu Y has **No Guard**. Base Raichu can have Lightning Rod; the ability changes on Mega Evolution. Mega Raichu Y does not continue redirecting Electric attacks for Milotic.
- No Guard checks whether its holder is the attacker or target. It does **not** make allied Milotic's Hypnosis accurate against an unrelated opponent. It also helps attacks aimed at Raichu connect.
- Competitive ignores boosts caused by an ally. Milotic must itself receive the opponent-caused stat drop while active.
- Torterra's Earthquake hits grounded allies, including Raichu and Milotic. Headlong Rush is a plausible alternative with a different cost: lowered defenses.
- Wide Guard does not protect against an ordinary single-target Earth Power or Ice Beam. That is a reason to retrieve alternatives such as eligible redirection, rather than declare the protected-turn problem solved.

These statements were checked against the [No Guard and Competitive callbacks](https://github.com/smogon/pokemon-showdown/blob/a833737d8408322c8b1e821dee16af07b1fd9234/data/abilities.ts) and the [Wide Guard move handler](https://github.com/smogon/pokemon-showdown/blob/a833737d8408322c8b1e821dee16af07b1fd9234/data/moves.ts). The relevant Champions learnsets and complete candidate sets also passed the individual-set validator.

A [primary Limitless team sheet](https://play.limitlesstcg.com/tournament/69d7ac9ab9ec970afa6068c1/player/luu34/teamlist) includes regular Lightning Rod Raichu, Torterra and Competitive Milotic. It records a 0–3 drop and uses a different Mega. It establishes an earlier use of the species trio, not success evidence for the proposed Y-chu version.

## Simple Beam Torterra, a known plan to inspect and repair

The [THATSAplusONE video](https://www.youtube.com/watch?v=XZrc4W-711Y) is recorded in [VIDEO_SOURCES.md, V04](VIDEO_SOURCES.md). That note uses the transcript and team sheets Shivraj supplied. The case bank preserves its reported species, moves, abilities and items; its stat spreads are still missing.

```text
Inner Focus + Choice Scarf Farfetch'd
                   |
              Simple Beam
                   v
Torterra becomes Simple --> Shell Smash --> +4 Attack / SpA / Speed
                   |                             |
          Shell Armor is lost           White Herb clears drops
                                                 |
                        Earthquake + Ground-immune active partner
```

A useful edit is to remove Air Balloon from Farigiraf. The graph should mark the Earthquake partnership as broken, then offer different repairs: change the partner to effective Levitate, change Earthquake to a suitable single-target move, or coordinate an ally Protect turn. The repair is conditional on legal sets and actual board state.

Removing Simple Beam produces a different question. Direct Shell Smash still supplies boosts with fewer dependencies, but it loses the extra amplification. Redirection or Fake Out may help buy a turn; neither replaces the missing amplification. This distinction is the point of representing **requirements and outcomes** rather than only Pokémon pairs.

Other breakpoints already encoded in the case bank include Choice Scarf locking, losing Shell Armor after Simple Beam, an early White Herb consumption, protecting Torterra from its own ally's Simple Beam, and choosing a Trick Room mode instead of blindly combining Trick Room with boosted Speed. These are mechanics-based concerns, not claims that the video creator made those errors.

## What the graph is doing

Use an ordinary property graph with explicit `Plan` and `Condition` nodes. A plan node reifies a multi-party interaction, so a dedicated hypergraph database is unnecessary for this demonstration.

```text
Species / set ---- PARTICIPATES_IN ---- Plan
Condition ------- REQUIRED_BY -------- Plan
Mechanism ------- ENABLES ------------ Plan
Threat ---------- BREAKS ------------- Condition
Source ---------- SUPPORTS ----------- Plan or mechanism claim
UsageObservation - IN_SNAPSHOT ------- Format + month + population
```

An agent can traverse from the edited set to dependent plans, find the requirements that became unsatisfied, and retrieve other mechanisms with the desired outcome. It should then launch the narrow calculation or ask the person to choose a tradeoff. The first measurable benefit is a more complete, inspectable explanation of what an edit changes. A relational implementation can represent the same information; this workbench does not assert a graph-only computational advantage.

Keep usage observations separate from static mechanics. Two snapshots can refer to the same species node without overwriting it. A query projection selects a format, month and cutoff. It must not mix singles and doubles usage or turn a popularity weight into a win probability.

## Numbers observed

The [Smogon monthly index](https://www.smogon.com/stats/) showed September 2026 as its latest listed month on inspection. The repo's cached JSONs provide these historical Showdown aggregates:

| Snapshot | Source-reported battles | Case usage |
|---|---:|---|
| [BSS M-C, September, cutoff 1500](https://www.smogon.com/stats/2026-09/chaos/gen9championsbssregmc-1500.json) | 69,462 | Mega Sableye 0.37051%; Galarian Slowking 2.16170% |
| [VGC M-C, September, cutoff 1500](https://www.smogon.com/stats/2026-09/chaos/gen9championsvgc2026regmc-1500.json) | 1,631,943 | Torterra 0.19671%; Mega Raichu Y 11.12367%; Milotic 13.00386% |

The JSON includes each source URL, file hash, the top 12 species by weighted usage in each format, and separate case-species usage. These counts describe source aggregates, not downloaded battle logs or official in-game rankings.

All **11 individual candidate sets** passed the pinned format validator using an explicitly nonoptimized smoke-test spread. We ran **zero battle simulations** and **zero full-video extractions** for this case-bank task. Individual legality is not evidence of strategic quality. The four-member subset and lead pair still need to be chosen for the opposing team.
