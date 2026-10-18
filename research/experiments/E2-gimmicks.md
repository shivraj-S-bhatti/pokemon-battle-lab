# E2: Engine-mined gimmicks in Pokémon Champions

A miner read the Champions dex out of the pinned Showdown build, joined every rule-bearing ability, move and item against what each legal species can actually learn and hold, and ranked the 15,218 raw combos by effect size and how rarely the September 2026 ladder (1500+) runs them. These are the 15 most interesting. "Combo share" is the estimated fraction of teams running the whole combo: species usage times the share of that species' sets with the ability, the move (on whichever partner owns it) and the item, times the partner pairing rate.

## Top 15

1. **Mega Staraptor (Contrary) + Gholdengo Memento** (VGC). Gholdengo faints into Memento aimed at its own Contrary ally: the -2 Atk / -2 SpA turns into +2 Atk / +2 SpA, and the faint gives a free switch-in. Mega Staraptor is on 6.2% of teams and Gholdengo on 16.6%, both standard picks, yet the pairing-with-Memento share is 0.0013%. The same trick works on Malamar (0.3% usage, combo share 0.00002%). Evidence: `data/abilities.ts contrary.onChangeBoost`, `data/moves.ts memento.boosts target=normal`.

2. **Sneasler (Unburden, Persim Berry) + any partner's Swagger** (VGC). Partner Swagger gives +2 Atk and confusion; Persim cures it at once, which consumes the item and doubles Sneasler's Speed through Unburden. One partner action buys +2 Atk, Speed x2 and a clean status slot. Sneasler is the most used Pokémon in the format (36.0%) and almost always holds Grassy Seed, Psychic Seed or White Herb; the Persim line sits at 0.004% of teams. Sneasler cannot learn Swagger itself, so the partner supplies it. Evidence: `data/abilities.ts unburden.onAfterUseItem`, `data/items.ts persimberry.onUpdate`.

3. **Torkoal + Audino Simple Beam, then Shell Smash** (VGC). Drought has already fired on switch-in, so Audino overwrites Torkoal's ability with Simple and Shell Smash becomes +4 Atk / +4 SpA / +4 Spe (with -2 Def / -2 SpD). A Trick Room staple turns into a sun sweeper that also outspeeds outside Trick Room. Torkoal is on 5.9% of teams; no recorded team pairs it with Simple Beam. Evidence: `data/moves.ts simplebeam.onHit`, `data/abilities.ts simple.onChangeBoost`.

4. **Kommo-o + Simple Beam, then Clangorous Soul** (VGC). Clangorous Soul's +1 to all five stats becomes +2 to all five for one third of max HP. Kommo-o usage 2.7%, combo share 0. Evidence: as above plus `data/moves.ts clangoroussoul.boosts`.

5. **Volcarona + Simple Beam, then Quiver Dance** (VGC). One Quiver Dance reaches +2 SpA / +2 SpD / +2 Spe, the level that normally takes two turns. Volcarona is on 8.2% of teams; combo share 0. Evidence: `data/moves.ts simplebeam.onHit`, `data/moves.ts quiverdance.boosts`.

6. **Arcanine or Gallade (Justified) + Farigiraf Beat Up** (VGC). Beat Up is Dark and hits once per healthy, unstatused party member (`beatup.onModifyMove` sets `multihit` to that count), and each hit triggers Justified, so a full bring-4 side gives +4 Atk for weak chip damage. Farigiraf is on 16.8% of teams and learns Beat Up; Arcanine (0.3%) and Gallade (1.2%) carry Justified. Combo share under 0.00001%. Evidence: `data/abilities.ts justified.onDamagingHit`, `data/moves.ts beatup.onModifyMove`.

7. **Oranguru (Symbiosis) + Sneasler (Unburden, seed)** (VGC). The seed fires, Unburden doubles Sneasler's Speed, then Symbiosis passes Oranguru's item across, so Sneasler keeps the Speed and gains a second item such as Sitrus Berry. Oranguru usage 0.5%, combo share 0.0009%. Evidence: `data/abilities.ts symbiosis.onAllyAfterUseItem`, `data/abilities.ts unburden.onAfterUseItem`.

8. **Mega Lopunny Healing Wish** (VGC and BSS). At 135 base Speed it moves first in almost any turn and hands a fully healed slot to a sweeper; the faint also counts for Last Respects and Supreme Overlord. Mega Lopunny is on 0.8% of VGC teams and 2.3% of BSS teams, with Healing Wish below 0.005% of teams in both. Evidence: `data/moves.ts healingwish.selfdestruct=ifHit`.

9. **Alolan Persian or Hawlucha, Focus Sash + Endeavor** (VGC and BSS). Sash leaves it at 1 HP, and Endeavor drops any foe to that same 1 HP. Alolan Persian (115 base Speed) is on 0.24% of VGC teams; Hawlucha (118 base Speed) on 0.48% of BSS teams; both combos are effectively unused. Evidence: `data/items.ts focussash.onDamage`, `data/moves.ts endeavor`.

10. **Golurk or Machamp (No Guard) Dynamic Punch** (both formats). Accuracy goes from 50% to 100%, so every hit is a guaranteed confusion on a 100 BP Fighting move. Golurk is on 0.04% of VGC teams, Machamp on 0.11% of BSS teams. Evidence: `data/abilities.ts noguard.onAnyAccuracy`, `data/moves.ts dynamicpunch.accuracy=50`.

11. **Mega Raichu Y (No Guard) Thunder** (BSS). Champions gives Mega Raichu Y No Guard, which takes Thunder from 70% to 100% without rain. The forme is on 4.1% of BSS teams, but Thunder on it shows up on only 0.014% of teams. Mega Pidgeot gets the same treatment for Hurricane (70% to 100%). Evidence: `data/abilities.ts noguard.onAnyAccuracy`, `data/moves.ts thunder.accuracy=70`.

12. **Slurpuff or Hawlucha (Unburden, Normal Gem) Giga Impact** (BSS). Normal Gem is the only Gem left in Champions. The first Giga Impact hits at 150 BP x1.3, and the Gem's consumption doubles Speed through Unburden for the follow-up. Both species sit near 0.5% of BSS teams and neither runs it. Evidence: `data/items.ts normalgem.onSourceTryPrimaryHit`, `data/abilities.ts unburden.onAfterUseItem`.

13. **Galarian Slowking (Own Tempo) + partner Flatter** (VGC). Flatter gives +1 SpA and confusion; Own Tempo blocks the confusion (`owntempo.onUpdate`), so the 110 base SpA ally gets a free boost. In Gen 9 Own Tempo is the only legal ability that blocks confusion, according to the scan. Galarian Slowking is on 0.39% of teams; combo share near zero. Evidence: `data/moves.ts flatter.boosts`, `data/abilities.ts owntempo.onUpdate`.

14. **Mega Malamar or Malamar (Contrary) Superpower** (both formats). Superpower's -1 Atk / -1 Def turns into +1 / +1 on a 120 BP attack every turn. Mega Malamar is on 0.35% of VGC teams. Serperior with Contrary Leaf Storm is the same pattern and better known (0.77% of BSS teams). Evidence: `data/abilities.ts contrary.onChangeBoost`, `data/moves.ts superpower.self.boosts`.

15. **Abomasnow or Aurorus (Snow Warning) Blizzard** (BSS). Snow makes Blizzard skip the accuracy check (`blizzard.onModifyMove`), so Snow Warning setters get a 70% to 100% spread move from turn one. Both are under 0.1% of BSS teams. Evidence: `data/moves.ts blizzard.onModifyMove`, `data/abilities.ts snowwarning.onStart`.

## What the engine data rules out

Several well-known gimmicks fail in Champions because the item or move is not legal there: Weakness Policy, Booster Energy, Power Herb, the pinch stat berries (Salac, Liechi, Petaya), Throat Spray, Blunder Policy, Room Service, Flame Orb and Toxic Orb are all `isNonstandard` in the champions mod, and so are Doodle, Lunar Dance and Bestow. No legal species carries Simple natively, so Simple only enters through Simple Beam. No legal species carries Wind Rider. Victory Star exists, but its 1.1x multiplier never moves a key move by six or more points.

## Method

The miner (`.artifacts/experiments/E2/mine.cjs`, runs in under 2 seconds) loads `Dex.mod('champions')` through the pinned Showdown `dist` build and the `gen9championsvgc2026regmc` team validator. A species is legal if it is in either usage file or passes a minimal validator check. A move is learnable if `checkCanLearn` returns no problem, and items and abilities must not be `isNonstandard`. Rules come from the handlers themselves: accuracy abilities are the ones with `*Accuracy` handlers, with the multiplier parsed from `chainModify`; boost transforms are `onChangeBoost` handlers that invert or double (Ripen is excluded because it checks `isBerry`); ability transfer moves are the ones whose handlers call `setAbility`; consumables are berries, gems and items that call `useItem` or `eatItem`; ally triggers are `onTryHit` and `onDamagingHit` handlers keyed on `move.type` that boost or heal, joined against `allAdjacent` spread moves and Beat Up; weather and terrain links come from `setWeather` and `setTerrain` calls in `onStart`. Fodder and low-HP lines use `selfdestruct` moves plus Focus Sash with Endeavor, Reversal, Flail, Counter, Mirror Coat and Metal Burst. Mega formes cannot carry a second item, so item combos on them are dropped.

Score is effect size times (0.35 + novelty) times a viability factor. Novelty is 1 when the combo share is 0 and falls to 0 at a 5% combo share, on a log scale. Each per-format list of 30 allows at most 6 entries per family, 2 per base species and 2 per ability and move pair. Partner variants collapse to the most used partner.

Numbers from the run: 382 legal species, 515 moves, 316 abilities and 166 items scanned, 23,176 learnable species-move pairs, 37 consumable items, 15,218 raw candidates across 14 families (ally Swagger/Flatter 7,612, ally boosts 2,498, ally triggers 1,718, Simple Beam gifts 1,440, weather accuracy 872), 1,942 after partner collapse, of which 927 work in singles.

## Files

- `.artifacts/experiments/E2/gimmicks.json`: top 30 per format with mechanism, effect, combo share, novelty, score and evidence.
- `.artifacts/experiments/E2/all-candidates.json`: all 1,942 collapsed candidates.
- `.artifacts/experiments/E2/stats.json`: scan counts.
