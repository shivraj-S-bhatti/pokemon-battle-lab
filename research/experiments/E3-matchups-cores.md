# E3: Damage-calc matchup graph and core search, Reg M-C doubles

## Findings

Mega Golisopod is in 11 of the 15 best cores. It takes the least damage of any top-40 species (mean incoming threat 0.26 against the meta, tied with Milotic), walls 9 of the top 40 (each does under 25% to it with its best move), and its Leech Life OHKOs Rillaboom. Its best partner is Primarina, at 3.9% usage. Cores with two Megas are excluded, because a team can Mega Evolve only once. Before that filter, Golisopod-Mega + Garchomp-Mega-Z led at 0.785.

Score is the usage-weighted share of the top-40 meta that the core threatens (best member), minus the usage-weighted share of the meta that threatens two or more core members at threat 0.5 or higher. Coverage and shared weakness are listed as shares of top-40 usage.

### Top 15 cores (top 40 plus Vivillon, Venusaur, Hatterene)

| # | Core | Coverage | Shared weakness | Score |
|---|---|---|---|---|
| 1 | Golisopod-Mega + Primarina | 0.816 | 0.067 | 0.749 |
| 2 | Golisopod-Mega + Arcanine-Hisui | 0.857 | 0.110 | 0.747 |
| 3 | Golisopod-Mega + Garchomp | 0.758 | 0.030 | 0.728 |
| 4 | Golisopod-Mega + Sylveon | 0.826 | 0.122 | 0.704 |
| 5 | Incineroar + Golisopod-Mega | 0.766 | 0.063 | 0.703 |
| 6 | Golisopod-Mega + Torkoal + Primarina | 0.904 | 0.203 | 0.701 |
| 7 | Golisopod-Mega + Torkoal | 0.775 | 0.089 | 0.686 |
| 8 | Milotic + Armarouge | 0.754 | 0.074 | 0.680 |
| 9 | Golisopod-Mega + Armarouge | 0.817 | 0.136 | 0.680 |
| 10 | Incineroar + Golisopod-Mega + Milotic | 0.793 | 0.135 | 0.658 |
| 11 | Torkoal + Primarina | 0.797 | 0.140 | 0.657 |
| 12 | Golisopod-Mega + Milotic + Armarouge | 0.838 | 0.191 | 0.647 |
| 13 | Gholdengo + Garchomp-Mega-Z | 0.849 | 0.204 | 0.645 |
| 14 | Golisopod-Mega + Pawmot | 0.838 | 0.203 | 0.636 |
| 15 | Milotic + Garchomp-Mega-Z | 0.725 | 0.097 | 0.628 |

Pairs dominate because a third member adds coverage at the top end but raises shared weakness. The best trio, Golisopod-Mega + Torkoal + Primarina, has a coverage of 0.904 and still ranks 6th. `cores.json` also lists the top 15 trios (`top15_3`).

### Constrained: no Garchomp (either form), Incineroar or Rillaboom

Rillaboom never made the top 15, so the constraint removes five cores: Golisopod-Mega + Garchomp, the two Garchomp-Mega-Z cores, and the two Incineroar cores. The top two stay Golisopod-Mega + Primarina (0.749) and Golisopod-Mega + Arcanine-Hisui (0.747). The new entries are Armarouge + Primarina (0.626), Sylveon + Torkoal (0.622), Milotic + Staraptor-Mega (0.615), Golisopod-Mega + Milotic + Torkoal (0.627), and Golisopod-Mega + Volcarona + Primarina (0.613). Five of the 15 have no Golisopod: Milotic + Armarouge (0.680), Torkoal + Primarina (0.657), Armarouge + Primarina, Sylveon + Torkoal and Milotic + Staraptor-Mega. The constrained top-15 trios are in `top15NoGarchompIncinRilla_3`.

### Hidden gems: every member under 3% usage

The pool for this list adds usage ranks 41 to 75 as candidate core members, still scored against the top-40 meta.

| # | Core (usage %) | Coverage | Shared weakness | Score |
|---|---|---|---|---|
| 1 | Dragapult (2.6) + Camerupt-Mega (2.2) | 0.898 | 0.258 | 0.640 |
| 2 | Dragonite-Mega (2.7) + Sirfetch'd (1.2) | 0.781 | 0.162 | 0.619 |
| 3 | Dragonite-Mega (2.7) + Dragapult (2.6) | 0.763 | 0.162 | 0.601 |
| 4 | Dragonite-Mega (2.7) + Typhlosion-Hisui (1.1) | 0.725 | 0.136 | 0.590 |
| 5 | Venusaur (2.2) + Camerupt-Mega (2.2) | 0.849 | 0.261 | 0.588 |
| 6 | Dragonite-Mega (2.7) + Gallade (1.2) | 0.732 | 0.162 | 0.570 |
| 7 | Kommo-o (2.7) + Camerupt-Mega (2.2) | 0.824 | 0.254 | 0.570 |
| 8 | Camerupt-Mega (2.2) + Typhlosion-Hisui (1.1) | 0.829 | 0.266 | 0.563 |
| 9 | Ceruledge (2.4) + Camerupt-Mega (2.2) | 0.819 | 0.266 | 0.553 |
| 10 | Mawile-Mega (1.6) + Typhlosion-Hisui (1.1) | 0.871 | 0.323 | 0.548 |

Dragapult + Camerupt-Mega (0.640) would rank 14th on the main board. Nine of the ten include Dragonite-Mega or Camerupt-Mega. Venusaur, one of the requested off-meta picks, pairs best with Camerupt-Mega. Before the one-Mega filter, Dragonite-Mega + Camerupt-Mega scored 0.759, the best score in either pool.

### The requested off-meta picks

Vivillon (1.2%), Venusaur (2.2%) and Hatterene (3.2%) are legal and in the usage data. Amoonguss, Breloom and Smeargle are flagged `isNonstandard: Past` in the Champions mod and have no usage entry, so the search left them out. Vivillon threatens little (mean outgoing threat 0.35) and takes a lot (0.84 incoming). In the main pool, all three pair best with Golisopod-Mega: Vivillon at 0.454, Venusaur at 0.509 and Hatterene at 0.578, all below the top 15.

## Method

Route (a): the pinned Showdown build in `.cache/showdown/dist` (already compiled, used read-only) with format `gen9championsvgc2026regmc`. For each ordered pair, one Battle holds the attacker and the defender as active Pokemon. Stats come from the engine's Champions `statModify` at level 50, with the Smogon spread's stat points as the stat inputs; Rillaboom's Jolly 32 Speed spread computes to 150, matching hand math. For each damaging move the script runs the engine's `ModifyType`/`ModifyMove` events (so Aerilate, Life Orb and similar apply), checks `TryHit`/`Immunity` for ability immunities, flags spread moves with `spreadHit` (the 0.75 modifier), forces no crit, and calls `battle.actions.getDamage` once for each of the 16 damage rolls. The best move is the one with the highest mean damage. OHKO, 2HKO and 3HKO chances come from exact roll enumeration (16, 256 and 4096 combinations).

Sets: top ability, item, nature/spread, and the four most used moves from the Sept 2026 chaos stats at cutoff 1500. Megas use the Mega forme directly.

threat(A to B) = P(OHKO) + 0.5 * (P(2HKO) minus P(OHKO)) + 0.2 * (P(3HKO) minus P(2HKO)). M[A][B] = threat(A to B) minus threat(B to A). walls[A][B] = 1 when A's best move does under 25% max to B. speedFaster uses each set's computed Speed, including Choice Scarf.

## Numbers observed

- 75 species in the matrix: top 40, 3 off-meta picks, 32 gem candidates. 5,625 ordered pairs (self-pairs included), 16 rolls each, every damaging move tried.
- Calc time 10 to 31 seconds per full run, depending on machine load; the core search scores 70,300 cores in under 1 second.
- Within the 43-species main pool, 513 of 1,806 ordered pairs have at least a 50% OHKO chance and 123 are walls. 61 top-40 pairs have M of 0.99 or more.
- Fastest sets: Lucario-Mega-Z (223), Garchomp-Mega-Z (203), Raichu-Mega-Y and Gengar-Mega (200).

Limitations:
- The field is neutral. Switch-in abilities do not fire, so there is no Intimidate, weather (Drought, Drizzle) or terrain (Grassy Surge, Psychic Surge). Sun-boosted Fire moves, Grassy Glide priority and Intimidate's cut to physical attackers are not in the numbers.
- No boosts. Swords Dance, Calm Mind and Tailwind sets are scored as if they never set up. Unburden is not triggered.
- Each species has one set (its most common one). Last Respects is scored at 50 base power (no fainted allies). Variable multi-hit moves count 3 hits unless the set has Skill Link or Loaded Dice.
- Threat counts damage only. Fake Out, redirection, Follow Me and speed control count only when their damage is the highest.
- Megas are scored in Mega form from turn 1. The reported lists drop cores with two or more Megas. The unfiltered scores are not saved.

Files: `.artifacts/experiments/E3/run.cjs`, `sets.json`, `matrix.json` (species, threat, speedFaster, M, walls, per-pair detail), `cores.json`.
