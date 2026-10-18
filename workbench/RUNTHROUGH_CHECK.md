# Runthrough mechanism check

**Gholdengo → Mega Staraptor is mechanically executable, with important timing and counterplay corrections. Base Audino → Snorlax → Mega Slowbro is also executable; evolving both Audino and Slowbro in the same battle is not.** These findings support a mechanism walkthrough. Target-matchup viability remains untested.

## Gholdengo's ally-targeted Memento

Executed actual doubles choices in `gen9championsvgc2026regmc`, including `move memento -2` and Staraptor's Mega Evolution. The engine accepted the ally target, Mega Evolved Staraptor before actions, applied Contrary, raised its Attack and Special Attack by two stages, and fainted Gholdengo. This checks the move-selection and execution path, beyond reading the two handlers separately.

| Controlled branch | Observed execution | Runthrough correction |
| --- | --- | --- |
| Ordinary opening | Staraptor used Brave Bird before Gholdengo used Memento. | With the tested Timid Spe32 Gholdengo and Jolly Spe32 Staraptor, the first attack does **not** receive the boost. Show turn-two value or explicitly change the speed plan. |
| Choice Scarf Gholdengo | Memento and the boosts occurred before Brave Bird. | A same-turn version exists, at the cost of Gholdengo's item and sacrificed team slot. This does not establish its value against a named opposing lead. |
| Rillaboom Fake Out into Gholdengo | `-immune` on Gholdengo; Memento still boosted Staraptor. | Ordinary Fake Out on this Ghost-type donor is not a dealbreaker. |
| **Base Scrappy Kangaskhan** Fake Out into Gholdengo | Gholdengo flinched; Staraptor stayed unboosted. | This is a specific legal Fake Out counterexample. The fixture did not Mega Evolve Kangaskhan and lose Scrappy. |
| Clefable Follow Me | Memento redirected to Clefable, lowered Clefable's offenses, and fainted Gholdengo; Staraptor stayed unboosted. | Redirection can consume the donor without delivering the intended boost. This branch should be visible in the plan graph. |

After successful Memento, the engine requested a replacement after the turn's upkeep. Describe that as replacing a fainted teammate, rather than implying an extra mid-turn action. No attack-damage or KO estimate was derived from these traces.

Relevant pinned-engine code: [Memento](../.cache/showdown/data/moves.ts#L11620), [Contrary](../.cache/showdown/data/abilities.ts#L678), [target-location validation](../.cache/showdown/sim/battle.ts#L2403).

## Audino / Snorlax / Slowbro chain

The following controlled sequence passed full-team validation and executed:

1. **Turn 1:** base Audino uses Simple Beam on Snorlax; Snorlax uses Stockpile and reaches +2 Defense / +2 Special Defense.
2. **Turn 2:** Audino switches to base Slowbro; Snorlax Stockpiles to +4 / +4.
3. **Turn 3:** Snorlax Stockpiles to +6 / +6 before Slowbro uses Psych Up on its ally. Slowbro copies both stages while retaining its own ability.
4. **Turn 4:** Slowbro Mega Evolves, gains Shell Armor, retains +6 / +6, and selects Body Press.

The fixture gave Snorlax 4 Speed points and used Relaxed Slowbro with no Speed points, so the third Stockpile preceded Psych Up. Opponents selected Protect throughout. This demonstrates an executable four-turn route with cooperative opponents; it does not show that setup survives real pressure. Slowbro's Body Press was blocked by Protect in this trace.

Repeating the route with **Audino Mega Evolving on turn 1** still copied the boosts, but the engine rejected Slowbro's later Mega choice: `Can't move: Slowbro can't mega evolve`. Holding both stones is distinct from evolving both Pokémon. The plan must reserve the battle's Mega Evolution for Slowbro; base Audino already supplies Simple Beam.

Relevant code: [Simple Beam](../.cache/showdown/data/moves.ts#L16477), [Stockpile](../.cache/showdown/data/moves.ts#L17955), [Psych Up](../.cache/showdown/data/moves.ts#L14206), [Mega Evolution disables later Mega choices](../.cache/showdown/sim/battle-actions.ts#L1889).

## Evidence and integration

Seven controlled branches ran on Showdown revision `a833737d8408322c8b1e821dee16af07b1fd9234`. Each fixture validated two six-Pokémon teams against the exact format, selected four at preview, and used the normal choice API. Fixtures use selected legal sets, not claimed observed tournament teams. The versionable [execution script](runthrough/check.cjs) contains the full fixture teams, choices, and assertions; [summary.json](runthrough/summary.json) preserves the relevant state changes and events. See [rerun instructions](runthrough/README.md). Full logs are regenerated under ignored `.artifacts/runthrough-check/results.json`.

Provenance was checked directly: the cached archive hash matches the source manifest; all 387 simulation/data/library/config TypeScript inputs match that archive, and all 387 compiled outputs match an independent scratch-source build performed in memory. The Showdown cache is an archive extraction, not its own Git checkout. The versionable [compact receipt](runthrough/provenance.json) records counts and aggregate hashes; [verify-provenance.mjs](runthrough/verify-provenance.mjs) regenerates every per-file comparison. No shared-cache file was overwritten.

The apparent revision discrepancy was Git resolving the outer project, not a changed engine. The existing candidate legality reports can retain their declared revision and do not need regeneration for this concern. The native Smogon calculator independently pins and hashes its own bundle; its earlier checks are unaffected. No validator provenance change is required by this audit.

For the runthrough, show the Memento timing branch and Follow Me failure before asking for a decision-changing native calculation. Name target matchups, accepted losses, and dealbreakers first. Keep the Scarf alternative and its cost visible. The Audino chain is a longer mechanism example with substantial untested setup exposure.

E3's old `THREATENS` evidence and derived rankings remain superseded pending selected-matchup native checks. Preserve their history and annotate their status; no graph deletion is needed for this review. E7 native checks remain separate from these execution traces. Claude-owned files and graph data were not changed.
