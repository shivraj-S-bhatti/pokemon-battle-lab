# Singles strategy reconstruction cases

October 17, 2026. These cases originate with Shivraj and are development examples, not blind discovery tests. The proposed system reconstructs executable conditional policies from mechanics, then compares them with human play. Finding an optimal team is outside the current evidence.

## Cases and status

| Case | Input | Question | Status |
|---|---|---|---|
| Defensive complement | Mega Sableye and Galarian Slowking | Against which exact opposing sets can the partner enter, survive and make progress? When does nominal Fairy resistance fail? | User supplied creator example; exact sets and turns not extracted |
| Trade, revive, cleanup | Pawmot, Mega Banette and Basculegion | When is a Destiny Bond trade available, when should the opponent refuse it, and when does revival improve the endgame? | Mechanics source checked; no scenario simulation yet |
| Alternative endgame | Pawmot/Banette with a different final member | Can the evaluator reject an attractive combination when a different endgame wins more relevant scenarios? | Human report found; author result is self-reported |

Naming resolution from the pinned Champions data: Pawmot learns Revival Blessing; Basculegion learns Last Respects. Basculin is unavailable in this catalog and does not supply that move. Treat the spoken names as likely references to Pawmot and Basculegion, not a separate discovered team.

## Human sources

The user supplied [SplashPlate's anti-meta video](https://www.youtube.com/watch?v=zQQH_5liolE). YouTube oEmbed confirms the creator and title, “My *ANTI-META* Combo Beats EVERYTHING in Pokemon Champions!!”. The video body/transcript could not be retrieved in this session; its title is not evidence of universal wins. Related creator videos [A9gjN3HCVOA](https://www.youtube.com/watch?v=A9gjN3HCVOA) and [3TtLK5WMy9s](https://www.youtube.com/watch?v=3TtLK5WMy9s) were located, with metadata confirmed by the research agent. Their full content was not inspected.

A [Japanese builder's first-person report](https://note.com/bo_no111/n/nca343304f291), dated October 7, describes a Pawmot/Banette strategy and replacing Basculegion with Hisuian Goodra for the final matchup. The author explicitly discusses opponents switching and timing problems with Destiny Bond. The claimed final placement is 567; no independent ladder receipt was checked. This is useful evidence of human revision, not an oracle for the optimal team.

Secondary team indexes can locate primary videos, but must not establish mechanical facts. One index labels Mega forms with pre-Mega abilities. Preserve base and transformed states separately: Mega Sableye has Magic Bounce; Mega Banette has Prankster in the pinned simulator. Full source: [Showdown revision a833737](https://github.com/smogon/pokemon-showdown/tree/a833737d8408322c8b1e821dee16af07b1fd9234).

Japanese/Chinese reports and social posts should enter as attributed hypotheses: original passage or timestamp, translation, regulation/date, exact sets if supplied, claimed result and known failures. Reposts of the same team are one underlying example. No Japanese/Chinese social corpus was ingested here.

## Data acquired

Downloaded [September M-C BSS usage JSON, cutoff 1500](https://www.smogon.com/stats/2026-09/chaos/gen9championsbssregmc-1500.json) into ignored `.cache/singles-202609-1500.json`. Reproduce with `node scripts/inspect-singles.mjs`; source hash and inspection output are in [evidence/singles-data-inspection.json](evidence/singles-data-inspection.json).

- 323 usage entries including forms, collapsing to 229 distinct National Pokédex numbers; 69,462 source-reported battles; 3,773,627 fetched bytes. The battle count is aggregate metadata, not a downloaded replay corpus.
- The separately cached official eligibility list contains 262 rows covering 231 distinct National Pokédex numbers. These counts have different scopes and are not interchangeable.
- Weighted usage: Mega Sableye 0.37051%, Galarian Slowking 2.16170%, Mega Banette 3.48857%, Pawmot 7.83530%, Basculegion 11.42466%.
- These describe historical Showdown BSS, not current official-game popularity or win rate.
- Fields include moves, items, abilities, spreads, teammates and checks/counters. They are marginals; arbitrary combinations of their modes need not be an observed legal set.
- The readable usage text and JSON have differing Banette raw counts despite matching usage shares. Do not mix raw counts without auditing their definitions.
- The existing FalkorDB graph remains the doubles snapshot. No singles graph import or battle evaluation was run.

[Showdown's replay API](https://github.com/smogon/pokemon-showdown-client/blob/master/WEB-API.md) supports format-filtered search, timestamp pagination, JSON and logs. The agent checked [a BSS M-C replay](https://replay.pokemonshowdown.com/gen9championsbssregmc-2699836376.json): preview, selected/revealed combatants, actions and outcome are available; unobserved exact sets and choices remain hidden. Saved replays are a selected sample. Public constructed-team replays do not supply full simulator inputlogs.

## Mathematical model

There are two graphs with different meanings:

1. A knowledge/dependency graph of sets, mechanics, prerequisites, reports and tests. Traversal generates candidates and traces evidence.
2. A game-state transition graph. Nodes include HP, status, remaining PP, transformed forms, active effects, side-level faint-event counts and relevant hidden-state beliefs. Edges represent both players' choices and stochastic transitions.

The pinned Last Respects callback computes `50 + 50 * totalFainted`. Direct callback checks at 0/1/2/3 events return 50/100/150/200 power. Battle code increments this history counter on fainting; revival restores a member without undoing the history. The number currently fainted is therefore insufficient state. See [moves.ts](https://github.com/smogon/pokemon-showdown/blob/a833737d8408322c8b1e821dee16af07b1fd9234/data/moves.ts), [battle.ts](https://github.com/smogon/pokemon-showdown/blob/a833737d8408322c8b1e821dee16af07b1fd9234/sim/battle.ts), and the upstream Destiny Bond/Revival Blessing tests. These tests were read, not executed here.

Sparse matrices can store either graph. BFS can answer bounded reachability under modeled transitions. Neither establishes a good policy against an opponent. Use finite-horizon stochastic-game evaluation or opponent-policy rollouts for play, and constrained search over sets for team construction. Max flow is not a natural default: the game's changing effects and adversarial decisions do not satisfy a simple conserved-flow model.

## Evaluation design

First, make reproducible small positions: opponent attacks into Destiny Bond; switches; uses a non-damaging move; defeats Pawmot before revival; changes move order; or survives cleanup. Assert exact mechanical outcomes before comparing strategy scores. Include the transformed ability and revival history in each position.

Then compare candidate policies on identical opponent scenarios and random seeds. Report trade outcomes, revival success, endgame value, failure conditions and computational cost. Pair a small verified endgame test with longer rollouts; a fixed short horizon can miss the revival strategy's payoff. Damage calculators supply local checks, not complete matchup values.

Separate two experiments:

- Retrieval-assisted coaching may use the reports and teammate statistics to explain known strategies.
- Composition evaluation withholds target reports, direct combo edges and near-duplicate team records, and asks whether primitive mechanics suffice to recover a valid policy. The present user-supplied examples stay in development; new held-out cases are needed. An LLM may already know published combinations, so held-out retrieval data alone does not prove historical originality.

Compare graph-based and indexed-table candidate generation using identical rules, search budgets and evaluators. Measure valid policies found, invalid claims, generalization to changed sets, and resource cost. Disagreement with a human roster is not necessarily failure; require evidence for whether the alternative behavior improves the chosen scenarios.
