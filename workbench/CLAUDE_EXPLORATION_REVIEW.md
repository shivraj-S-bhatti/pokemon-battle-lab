# Claude exploration review

For the parent integrator and Shivraj's runthrough. Written 2026-10-18 after `EXPERIMENT_UNBLOCKS.md`, `tools/CALCULATOR_REUSE.md` and the two video notes. Covers what each exploratory experiment is good for now, what it must not be used for, and one concrete runthrough. `research/experiments/E1-E5` are on main at `d1388d0`; parent's tools, sprites and video notes at `7a141c4`.

## Where each experiment stands

| Exp | What it is | Use it for | Do not use it for |
|---|---|---|---|
| E1 meta holes | Mechanic exposure from usage marginals and engine legality | Picking seed ideas: sleep, paralysis, Shadow Tag Perish, stat-drop spam are under-answered at the species level | "X% of teams cannot answer sleep". Exposure is per species slot; teammates can cover it. Wording fixed in E1 and E5. |
| E2 gimmicks | Ability × move × item × partner combos mined from engine handlers, legal in Champions | A long list of mechanically real, rarely played interactions with engine evidence paths | Ranking. Effect size is a per-family weight, not an outcome; Torkoal +4 Speed is the counterexample (Quiet, 0 Speed: about 36 → 108, still slower than Sneasler). E7 re-judges. |
| E3 matchups and cores | Custom roll enumeration on the Showdown sim, one set per species, neutral field | Nothing until rerun. | Any threat edge or core ranking. Superseded by the native calculator; the `THREATENS` edges in `gk_meta` came from it. |
| E4 archetypes and gaps | `gk_meta`: co-usage, mechanics, label propagation, PageRank, betweenness, gap query | Archetype lookup (Rain, Psychic Terrain, two Trick Room cores, Sand) and the sun-setter/Fire-attacker gap list as questions | Claims that a gap pair is good; the "attacker" rule produced two known false positives. |
| E5 board | E1-E4 layered on `gk_meta` with Browser queries | Browsing and demo | Evidence. It inherits E3's threat edges. |
| E6 boost chains | Running. Path search in `gk_chain` for multi-step plans (Audino Simple Beam → Snorlax Stockpile → Slowbro Psych Up → Mega Slowbro Shell Armor → Body Press) | Long-horizon plan discovery; the graph-shaped part of the problem | Until its native-calculator thresholds land |
| E7 gimmick outcomes | Done. Re-judges E2 gimmicks on target matchups, dealbreakers, and only decision-changing native-calculator checks | Keep / deprioritize / worth-a-test per gimmick, for the selected sets and targets | Universal verdicts; a different set, target or partner can change them |

Both running experiments were told about the native calculator (`workbench/tools/calculator.mjs`), the meta-sets caveat (constructed marginal-mode candidates, no joint probability), species-level exposure wording, and the symbolic human view with `status: hypothesis | calculator_checked`.

## Integration requests

1. **E3's edges.** Done by parent: the 1,774 `THREATENS` edges in `gk_meta` carry `status: 'superseded'` to keep history. Demos exclude them; E5's hidden-gem and "beats the top meta" queries are retired. Native-calculator checks for selected matchups live in `gk_board`.
2. **Keep runtime and human graphs separate.** `gk_meta` and `gk_chain` are runtime and exploration graphs. The human board should be a small symbolic graph of plans, matchups, alternatives, checks and sources, following the claim-node shape in `team-guide-signals.md`. Built as `gk_board`; see the section below.
3. **Loaders are reproducible but local.** `.artifacts/experiments/E1..E7/` hold the scripts. They are gitignored. If the board must be rebuilt by someone else, copy the loaders you want to keep into `tools/` under your ownership.

## Runthrough (about 15 minutes)

Follows the shape in `EXPERIMENT_UNBLOCKS.md`: seed and targets, competing cores, one decision-changing calculation, source.

1. **Seed.** From E2: Gholdengo uses Memento on its own Mega Staraptor. Contrary flips -2 Atk / -2 SpA into +2 / +2, and Gholdengo's faint gives a free switch. Both are common picks (16.6% and 6.2% usage), and Gholdengo is already Mega Staraptor's most common teammate (co-usage weight 0.29 in `gk_meta`). So this is a one-move change on a pair people already run, the small targeted deviation the JoeUX9 note describes; Memento itself is close to unplayed there. Engine evidence: `contrary.onChangeBoost`, `memento.boosts`, Mega Staraptor's ability `Contrary` in `data/pokedex.ts`.
2. **Targets and accepted losses.** Name two or three leads this must beat and what it gives up (Gholdengo's whole slot on turn one). Dealbreakers to check: anything that removes or ignores boosts (Haze, Clear Smog, Unaware, Encore onto a non-attack), and whatever KOs or disables Gholdengo before Memento. Ordinary Fake Out is not a default blocker: Gholdengo is a Ghost type. The science agent is checking that Memento into a Contrary ally executes as expected and how the one-Mega rule constrains the team.
3. **Competing cores.** Browser on `gk_meta`: `MATCH (a:Mon {name:'Staraptor-Mega'})-[w:PAIRS_WITH]-(b:Mon) RETURN DISTINCT b.name, w.weight ORDER BY w.weight DESC LIMIT 10` for what players already pair it with, and E2's other Contrary or ally-boost entries as alternative enablers (e.g. Malamar on the same Memento line).
4. **One calculation.** With `workbench/tools/calculator.mjs`: Mega Staraptor at `state.boosts {atk: 2}` using its strongest move into each named target, sets from `data/meta-sets.json`, `canonicalSpecies: "Staraptor-Mega"`. Keep the native `kochance` text. If it does not change the KO count on the chosen targets, deprioritize the idea for those targets and record why.
5. **Source.** Follow the engine paths above. If E7 has already judged this gimmick, read its verdict first.

A second seed if time allows: E1's sleep hole with Vivillon or Venusaur, compared against Milotic Hypnosis, which 35% of Milotic sets already run.

## Corrections to my earlier claims

- "95% of the meta has no answer to sleep" was a species-level estimate stated as a team-level fact. Fixed in E1 and E5.
- E3's cores and hidden gems (Mega Golisopod in 11 of 15 top cores; Dragapult + Mega Camerupt) depend on the replaced damage path.
- E2's Audino → Torkoal Shell Smash is a big effect with almost no outcome; see E7.

## Board and execution findings (2026-10-18)

`gk_board` is built: `workbench/board/` (`board.json`, `load-gk-board.mjs`, `checks/`, README with Browser queries). It holds five plans with statuses `hypothesis`, `engine_checked` or `native_checked`, and no strength score.

Decision-changing findings now on the board:

- **Memento → Mega Staraptor works but arrives late.** Unscarfed Gholdengo moves after Staraptor, so +2 starts on Staraptor's second attack. Opposing Follow Me redirects Memento and Gholdengo faints for nothing. Ordinary Fake Out cannot hit Ghost-type Gholdengo; Scrappy Kangaskhan can. (Science agent, engine.)
- **The +2 buys little against the common targets.** Native calc on neutral field: at +0 Mega Staraptor already OHKOs Rillaboom (Brave Bird 133-159%), Sneasler, Incineroar and Archaludon. +2 flips Garchomp from 2HKO to OHKO, and Pelipper and an opposing Gholdengo from 3HKO to 2HKO. Verdict: narrow; worth a test only if Garchomp must be beaten.
- **Whimsicott Prankster Memento** is the alternative that fixes turn order (Whimsicott learns Memento in Champions). Hypothesis until an engine run.
- **Audino chain:** base Audino supports Simple Beam → Snorlax → Psych Up → Mega Slowbro; Mega Audino uses the one Mega and makes Mega Slowbro illegal. Your recollection of "Mega Audino" conflicts with this; the board keeps both, with the engine result as the deciding condition.

**E7 finished** (native calculator, 140 calls, plan-based): of E2's 45 top gimmicks, 4 worth a test (Swagger Persim Sneasler, Sash Reversal Rhyperior under Trick Room, Beat Up Justified Arcanine, Scarf Ninetales Memento), 2 kept but already standard (No Guard Dynamic Punch), 39 deprioritized for the selected sets and targets. It set aside Memento → Mega Staraptor (later reopened on the board) and Malamar, and found limited benefit from the Simple Beam setups on the checked targets, and finds an E2 mechanic error: Symbiosis passing an item switches Unburden off (`unburden.condition.onModifySpe` requires `!pokemon.item`). These verdicts are on the board.

**E6 finished.** The Cypher path search over `gk_chain` (4,422 effect paths in about 110 ms) found the Audino / Snorlax / Mega Slowbro chain without being told about it. Native checks: at +6 / +6 the strongest top-10 hit does 27.2-32.1%; Body Press OHKOs Rillaboom and Incineroar, 75% on Sneasler; five top-60 Ghost types are immune. Clangorous Soul copied with Psych Up reaches +4 in all stats and Stored Power OHKOs every target checked, but E7's Soundproof finding exposes Kommo-o during setup. Quiver Dance copied fails the Defense threshold. All three are on the board.

## Ownership

Parent: tools, DB, sprites, MCP. Science Codex: calculator adapter and reasoning logic. Claude: experiments under `research/experiments/` and `.artifacts/experiments/`, and the human board once requested. Canvas untouched. No tests written.

## Board corrections after parent and science review (2026-10-18)

- Accepted losses on the board were our own costs (donor fainting, items, turns). They are now `COSTS`. Opposing concessions are `undecided` on every plan until Shivraj selects them.
- Memento timing is scoped to the tested spreads; the engine-checked Choice Scarf Gholdengo version (Memento before the attack) is on the board as an alternative.
- The earlier "only Garchomp changes" conclusion was wrong: Pelipper had been calculated with resisted Close Combat. Rerun with both moves per target: +2 turns Garchomp, Kingambit, Pelipper and Basculegion into OHKOs. The Memento verdict is now "undecided; depends on the user's targets".
- Whimsicott's Grass typing ignores Rage Powder; Follow Me still applies.
- The Audino chain no longer says it wins: Stockpile +6 and Psych Up execution are engine checked against Protect-only opponents; viability under pressure is unknown.
- Check nodes carry attacker and defender set, field and a row locator; conditions carry evidence locators. The loader refuses any graph other than `gk_board`.

## Second science review (E7 wording)

- E7's universal rejections are narrowed to "deprioritized for the selected sets and targets", in the report and on the board (`deprioritized` status).
- Simple Beam accounting is corrected: it doubles an ally's setup within one battle turn, where the plain route takes the receiver two setup turns; Audino's action and the receiver's lost ability are counted separately. Stockpile caps at three uses, so plain Stockpile reaches +3 and Simple reaches +6; the two are not equivalent.
- The Audino chain's survival result is post-setup bulk, not setup viability. The executed route used five setup moves plus a switch over three turns, with the first attack on turn four. Fixed in E6, the board and its README.
- Scarf Ninetales is above every top-15 set's unboosted Speed; priority, Trick Room and Speed boosts are unchecked, so it does not always move first.
