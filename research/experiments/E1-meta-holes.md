# E1: Holes in the Champions Reg M-C meta

Smogon chaos stats, September 2026, 1500 cutoff. Doubles: gen9championsvgc2026regmc (1,631,943 battles). Singles: gen9championsbssregmc. Mechanics from the pinned Showdown source with the champions mod applied.

## Findings

The sleep hunch holds, with one correction. Rillaboom is Grass, so it ignores Sleep Powder; it has no answer to Hypnosis, Yawn or Sing (99.5% of Rillaboom sets lack one). Mega Salamence lacks an answer to every sleep move in both formats: it is Flying, so terrain does not protect it, and the Mega Stone takes the item slot. Two engine facts make sleep a structural hole in Champions. Safety Goggles is `isNonstandard: "Past"` in the champions mod, so Lum and Chesto are the only legal item answers. Misty Surge has no legal user, and Electric Surge has two (Raichu-Mega-X, Pincurchin). Sleep is also shorter here. The champions `slp` condition samples a start time from [2, 3, 3], so a sleeping Pokémon misses one turn (1/3) or two turns (2/3). Standard Gen 9 samples [2, 3, 4].

Top five holes, ranked by exposure among mechanics the meta barely uses yet. Exposure is the usage-weighted share of top-60 slots with no answer. Pressure is the expected number of team members already using the mechanic.

1. **Doubles, sleep via Hypnosis/Yawn/Sing: 95.0% exposed, pressure 0.076 per team.** No answer on Rillaboom (43.0% usage), Sneasler (36.0%), Incineroar (28.7%), Mega Salamence (24.8%), Indeedee-F (22.4%), Kingambit (21.4%). The answers that exist: Good as Gold and other immunity abilities cover 3.8% of the meta, grounded Electric Terrain 1.3%, Lum/Chesto 0.07%. Exploiters: Milotic Hypnosis (13.0% usage, 35% of sets already run it), Mega Gardevoir Hypnosis (9.0%), Sylveon Yawn (8.0%), Politoed Hypnosis (6.6%, with Drizzle), Torkoal Yawn (5.9%, with Drought), Mega Gengar Hypnosis (4.8%). Hypnosis is 60% accurate and Sing is 55%; Yawn always hits but takes a turn.
2. **Doubles, Sleep Powder: 83.0% exposed, pressure 0.033.** Grass typing is the main answer (12.0% of the meta). Spore has no legal user: Amoonguss, Breloom and Toedscool are all `tier: "Illegal"` in the champions formats data. Seven legal Pokémon learn Sleep Powder. The best is Vivillon with Compound Eyes, which raises Sleep Powder to 97.5% accuracy (1.2% usage; 97% of its sets run Sleep Powder and 81% run Rage Powder). Venusaur follows (2.2% usage, 79% of its sets run it, Chlorophyll for sun).
3. **Doubles, paralysis: 88.4% exposed, pressure 0.016.** Only 3.8% of the meta is Ground (immune to Thunder Wave) and 2.9% is Electric. Thunder Wave is in the learnsets of Kingambit, Farigiraf, Archaludon, Mega Raichu Y (Nuzzle too), Mega Gardevoir and Mega Tyranitar, and almost none of their sets run it (0.4% or less each). The champions `par` condition cuts full paralysis to 1 in 8, so the payoff is mostly the speed drop, which matters less in a Trick Room-heavy meta.
4. **Doubles, Perish Song with Shadow Tag: 86.9% have no escape.** Only Ghost types (12.6%) and Soundproof (0.5%) escape, and Shed Shell sees no use. Mega Gengar is the only legal Shadow Tag user (4.8% usage, 72% of sets run Perish Song), and Politoed runs it on 42% of sets. Pressure is 0.065 per team, so the hole is known but thinly exploited.
5. **Singles, Sleep Powder: 86.9% exposed, pressure 0.012.** Mega Salamence (35.4% usage), Primarina (27.0%), Mega Golisopod (21.5%), Garchomp (21.4%) and Archaludon (19.9%) have no answer. Exploiters: Mega Venusaur (2.4% usage, 17% run it), Mega Victreebel (1.6%, 23%), Vivillon (0.2%, 95%).

Singles Yawn is the exposed hole the meta already exploits: 92.9% exposure, but 0.31 Yawn users per team, mostly Hippowdon (94% of 16.9% usage) and Umbreon. Doubles stat-drop spam is the same case: 88.7% exposed because Clear Amulet and Covert Cloak are both illegal in Champions, and Incineroar's Parting Shot already pushes pressure to 0.63 per team.

## Method

Top 60 species by usage in each format (5.23 of 6 doubles team slots, 4.79 singles). For each species I normalized ability, item, move and teammate counts by the species' total. The chance a set has no answer is the product of (1 minus each answer's probability). Answer probabilities: an ability share, a legal item share, a type (0 or 1), and a move share, where several listed moves are summed and capped at 1. Team answers (terrain setters, Sweet Veil, Armor Tail, Quick Guard, Trick Room, Taunt, Aroma Veil) are 1 minus the product over teammates of (1 minus co-usage rate times that teammate's answer probability). A terrain answer only counts when the species is grounded. Exposure is the usage-weighted mean. Burn is weighted to physical attackers only. Taunt/Encore is weighted by each species' share of status-move slots. An exploiter is legal when the champions formats data marks it neither Illegal nor Past and the champions learnset, inheriting from the base form, has the move.

## Numbers

Exposure, with the share of top-60 weight each row covers and the current pressure per team:

| Format | Mechanic | Exposure | Weight | Pressure |
|---|---|---|---|---|
| doubles | sleep (Hypnosis/Yawn/Sing) | 95.0% | 100% | 0.076 |
| doubles | Taunt/Encore lock (status users) | 94.5% | 20% | 0.225 |
| doubles | stat-drop spam | 88.7% | 100% | 0.629 |
| doubles | paralysis | 88.4% | 100% | 0.016 |
| doubles | Perish Song vs trapping | 86.9% | 100% | 0.065 |
| doubles | Sleep Powder | 83.0% | 100% | 0.033 |
| doubles | Will-O-Wisp (physical attackers) | 80.2% | 47% | 0.076 |
| doubles | priority attacks | 68.4% | 100% | 1.220 |
| doubles | Follow Me | 62.3% | 100% | 0.402 |
| doubles | Fake Out | 59.1% | 100% | 1.096 |
| doubles | weather (no setter or Cloud Nine on team) | 56.5% | 100% | 0.557 |
| doubles | Trick Room (no TR, Taunt or Imprison on team) | 52.5% | 100% | 0.572 |
| doubles | Rage Powder | 52.0% | 100% | 0.148 |
| doubles | Intimidate | 38.9% | 100% | 0.334 |
| singles | stat-drop spam | 97.4% | 100% | 0.220 |
| singles | priority attacks | 94.1% | 100% | 1.657 |
| singles | sleep (Hypnosis/Yawn/Sing) | 92.9% | 100% | 0.307 |
| singles | Taunt/Encore lock (status users) | 91.4% | 27% | 0.471 |
| singles | Sleep Powder | 86.9% | 100% | 0.012 |
| singles | Will-O-Wisp (physical attackers) | 86.9% | 56% | 0.178 |
| singles | Perish Song vs trapping | 83.9% | 100% | 0.033 |
| singles | paralysis | 79.3% | 100% | 0.096 |
| singles | weather | 61.2% | 100% | 0.459 |
| singles | Intimidate | 53.6% | 100% | 0.095 |

Answer supply in doubles: Psychic Terrain reaches 17.3% of grounded slots through Indeedee teammates. Armor Tail from a Farigiraf partner covers 12.6% against Fake Out and priority. Spread moves cover 37.7% against Follow Me, and Stalwart or Propeller Tail covers 0.06%. The weather share on teams is rain 18.4%, sun 14.5%, sand 8.5%. Legal sleep immunities are scarce: Insomnia (Banette, Gourgeist, Scovillain, Ariados), Vital Spirit (Annihilape, Lycanroc-Midnight), Sweet Veil (Slurpuff, Tsareena, Alcremie), Purifying Salt (Garganacl), Good as Gold (Gholdengo, the only one with real usage, at 16.6%).

Raw data in `.artifacts/experiments/E1/`: `holes.json` (per mechanic and format: exposure, unanswered species, answers, exploiters with current share), `raw.json` (per-species breakdown), `analyze.mjs`, `pressure.mjs`, `load.mjs`.
