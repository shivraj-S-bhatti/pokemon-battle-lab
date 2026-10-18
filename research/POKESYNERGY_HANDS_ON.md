# PokeSynergy: observed overlap with Gimmikghoul

Inspected https://pokesynergy.app/ through its public browser UI on October 17, 2026. Tested the storyboard's Banette/Sneasler six, then removed Sylveon and requested a sixth member. No sign-in was needed. This is a bounded workflow inspection, not an exhaustive feature audit or correctness benchmark.

## Observed

- Import retained the six species, abilities, items and moves. Banettite produced Mega Banette with both Frisk and Prankster shown. The input omitted natures and stat allocations, so threat results are not an evaluation of the original competitive team.
- Analysis offered defensive typing, offense and stats views, with a selectable subset of the team.
- Threat analysis offered Singles/Doubles, Speed, Trick Room, Optimal and Edge Cases switches, plus usage filters.
- Its help explains threat classification using counts of favorable versus unfavorable individual matchups and attacks required to KO. Speed optionally resolves equal short KO races. Doubles changes damage assumptions such as spread reduction.
- The help describes Optimal as supplying favorable conditions for selected moves, including terrain, status, weather, item conditions and a fainted ally for Last Respects. These assumptions are useful calculator conveniences; their presence does not demonstrate that a team can establish them in play.
- Guided Auto Build preview retained our specified moves/items while proposing missing natures and stat allocations. It did not display a justification for these choices in that panel.
- With Sylveon removed, Auto Build offered Rillaboom, Incineroar, Kingambit and Basculegion-Male, each with a complete build. The visible recommendation panel showed no explanation connecting those choices to the Swagger/Lum/Unburden plan or its sacrifices.

Local evidence: `.artifacts/pokesynergy-audit/fill-slot.txt` and `fill-slot.jpg`. Browser snapshots of the threat-help dialog were also read during the session. Screenshot and transient full DOM capture remain ignored scratch artifacts.

## Decision

PokeSynergy already supplies a useful team-editing, matchup-checking and candidate-build workflow. Gimmikghoul should use it as a baseline when evaluating whether a new suggestion helps a player, rather than treating existing builders as mere type charts.

The tested surfaces did not produce a conditional multi-action plan, an explanation of what a change enables or breaks, alternatives organized by strategic requirement, or paired battle evaluation of the change. That leaves our proposed experiment worth testing; it does not prove those features are absent from every part of the product.

A discriminating next test is to change Sneasler's Lum Berry and ask whether the tool identifies the changed prerequisites of the ally-Swagger plan and proposes ways to repair it. We did not run that controlled edit comparison in this inspection. The first Gimmikghoul evaluation should include it.

## Numbers observed

One six-member input, one five-member variant, four sixth-slot suggestions. Zero full battles, zero paid inference calls, zero measured gains in win rate. The page identified its meta data as M-C Doubles, updated September 26, 2026. No source-code audit or authenticated-feature inspection performed.
