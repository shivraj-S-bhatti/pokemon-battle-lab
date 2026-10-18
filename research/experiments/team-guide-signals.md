# Teambuilding guides: decisions worth extracting

Research date: 2026-10-18. We retrieved and read English automatic captions for all four guides in the screenshot. Four Gemini video-input passes also completed; we did not independently inspect their frames. It extracts how creators make construction decisions; it does not certify every spoken mechanic or turn a historical guide into today's metagame.

## What the guides actually contribute

| Guide | Source and timestamped signals | Consequence for Gimmikghoul |
|---|---|---|
| aDrive, 2026-04-14, 24:36 | [02:04](https://www.youtube.com/watch?v=LFXZLuq-JxM&t=124s): each slot should serve a purpose. [05:40](https://www.youtube.com/watch?v=LFXZLuq-JxM&t=340s): Rotom-Wash and Incineroar give Mega Beedrill entry through pivots; the grass slot changed during iteration. [11:44](https://www.youtube.com/watch?v=LFXZLuq-JxM&t=704s): plan for opposing weather and play when your preferred weather is unavailable. [23:35](https://www.youtube.com/watch?v=LFXZLuq-JxM&t=1415s): practical failures drove substantial roster changes. | Capture intended function, alternative slots, and what experience caused a replacement. A type triangle alone misses safe entry and weather sequencing. |
| JoeUX9, 2026-06-19, 32:51 | [03:03](https://www.youtube.com/watch?v=cvVzNtC4uMA&t=183s): compare Pelipper, Politoed and Sableye by different benefits and costs. [04:26–06:06](https://www.youtube.com/watch?v=cvVzNtC4uMA&t=266s): Sableye's manual rain solves Charizard weather override and frees lead selection; screens provide another function. [07:44–08:38](https://www.youtube.com/watch?v=cvVzNtC4uMA&t=464s): Sinistcha supports both recoil recovery and an Archaludon endgame. [11:45](https://www.youtube.com/watch?v=cvVzNtC4uMA&t=705s): answer threats through either roster changes or moves. [29:40–30:34](https://www.youtube.com/watch?v=cvVzNtC4uMA&t=1780s): a desired survival benchmark fails; revise selection/play rather than force it. | Preserve counterfactual choices and rejected alternatives. Roles arise from the chosen set and intended plan; they are not permanent species tags. |
| KingVGC, 2026-07-01, 10:21 | [01:11](https://www.youtube.com/watch?v=n4GsQqHbLb0&t=71s): use ladder and tournament sources to investigate supporting pieces. [02:05](https://www.youtube.com/watch?v=n4GsQqHbLb0&t=125s): coverage is useful because it creates switch and pivot options. [04:24–09:32](https://www.youtube.com/watch?v=n4GsQqHbLb0&t=264s): compare support through priority denial, redirection, damage reduction, healing, weather and speed control. [09:34](https://www.youtube.com/watch?v=n4GsQqHbLb0&t=574s): test and revise. | Expand “protect this attacker” into competing mechanisms with conditions and opportunity costs. Preserve the action each mechanism enables. |
| TheBattleRoom with Raghav, 2026-04-20, 19:44 | [04:03–06:20](https://www.youtube.com/watch?v=I9bXHtYnzGY&t=243s): redundant functions, one fragile win condition, inadequate support and stale meta assumptions undermine teams. [09:00](https://www.youtube.com/watch?v=I9bXHtYnzGY&t=540s): partners enable a starting idea; Encore plus Disable is one less obvious example. [11:30](https://www.youtube.com/watch?v=I9bXHtYnzGY&t=690s): a new slot should add another way to threaten opponents while covering weaknesses. [16:47–18:20](https://www.youtube.com/watch?v=I9bXHtYnzGY&t=1007s): choose survival targets, then use an existing calculator to allocate stats. [18:29](https://www.youtube.com/watch?v=I9bXHtYnzGY&t=1109s): testing may require revisiting the original concept. | Represent a team as several usable plans, with evidence for why each slot helps. Benchmarks guide existing tools; they are not a reason to build a damage engine. |

These are creator explanations from April–July, mostly doubles. Treat their metagame claims as dated claims. Do not silently apply them to October M-C or BSS singles.

## What to stop building

1. **Our own damage rolls, rounding rules or KO probability engine.** The [Showdown calculator](https://github.com/smogon/damage-calc) exposes a reusable calculation API. TheBattleRoom directly links the [NCP VGC calculator](https://nerd-of-now.github.io/NCP-VGC-Damage-Calculator/) and uses it to answer construction questions. Reuse a compatible implementation, retain its inputs/version, and show its OHKO/2HKO result. Verify Champions support before selecting it; naming a general calculator is not proof of compatibility.
2. **A universal species synergy score.** The guides repeatedly change moves, items, leads and intended endgames. One pair can solve an entry problem but compound a weather or damage-output problem. Keep those reasons separately inspectable.
3. **A giant visual graph of every mechanic.** The user needs a readable map of the current question and alternatives. The agent can construct denser temporary representations while investigating.
4. **A fixed checklist that always adds speed control, a type triangle or a particular number of attackers.** These are useful prompts from particular builders. Store them as attributed heuristics whose applicability can be challenged, not legality constraints.
5. **Exhaustive battle reconstruction for every guide.** Here the valuable signal is the construction process. Captions provide a cheap first pass; request video frames where sets, diagrams or calculations resolve a material ambiguity.

## Proposed representation: a visible argument map

The following is our design proposal, not a claim made by the creators:

```text
USER QUESTION: make this core work; exclude Garchomp
    |
    +--> intended plan: preserve attacker / establish endgame
    |         |
    |         +--> obstacle: weather override / priority / recovery deficit
    |                    |
    |                    +--> option A: partner + move + item
    |                    +--> option B: different lead / switch sequence
    |                    +--> option C: replace a move, keep roster
    |                                  |
    +--> human-selected candidate <---- evidence / objections / costs
                                       |
                      source timestamp or calculator result
```

Each visible connection summarizes a **conditional claim**. Clicking it reveals the participating set choices, scenario, reason, opposing response, and evidence. A compact claim record can start as:

```text
claim: manual rain makes this lead viable against weather override
participants: [support set, rain attacker set, opposing weather setter]
conditions: [format, available moves, turn-order assumptions]
alternative: automatic setter on lead
benefit: another lead option
cost: team slot and support turn
evidence: creator explanation at timestamp; later checks recorded separately
status: source claim | hypothesis | mechanically checked | observed
```

FalkorDB can store this as a claim node connected to several participants, sources and scenarios. That encodes a relation involving multiple entities without pretending that a pairwise “synergy” edge contains its whole meaning. The human view may collapse it into a labeled line. Agent-side work can instead use a constraint table, sparse matchup matrix, temporary graph, set search or simulator call. The visible layout need not reproduce that internal structure.

The useful next action is **compare alternatives and explain the tradeoff**. Identify two ways to make the core execute its plan, check the disputed interactions with existing tools, and retain whichever insights change the construction decision. PageRank is unnecessary unless a specific retrieval question warrants it.

## Extraction quality and follow-up

Automatic captions contain Pokémon-name substitutions. JoeUX9's transcript alternates names around Sinistcha and Archaludon; TheBattleRoom's early third-slot discussion says Sneasler while later passages say Weavile. Those exact sets require frame inspection. Do not normalize these contradictions into confident graph facts. Likewise, broad spoken guarantees and numerical shortcuts remain source claims until checked against the game implementation.

The four Google-model passes located supporting examples and returned candidate visual sets/calculator readings. Exact readings remain unverified for the reasons below. The separately assigned linked video is [JoeUX9, How To Build Anti Meta Teams](https://www.youtube.com/watch?v=Swjz3trjz60); this note does not claim its analysis is complete.

## Numbers observed

| Video ID | Player duration, seconds | ASR segments fetched | Last caption end, seconds |
|---|---:|---:|---:|
| LFXZLuq-JxM | 1,476 | 794 | 1,477.60 |
| cvVzNtC4uMA | 1,971 | 1,062 | 1,973.24 |
| I9bXHtYnzGY | 1,184 | 556 | 1,170.44 |
| n4GsQqHbLb0 | 621 | 313 | 622.96 |

Receipt with retrieval time and hashes: [team-guide-extraction.json](../evidence/team-guide-extraction.json). Raw captions remain in gitignored `.artifacts/team-guide-signals/`. Four caption tracks succeeded through `youtube-transcript-api`; a separate `yt-dlp` extraction also succeeded for JoeUX9. Initial direct timedtext calls returned empty responses, and direct `get_transcript` requests returned HTTP 400. Captions extending slightly past runtime do not prove visual coverage. Four Google video-input analyses completed; zero received independent frame verification in this pass.


## Google pass: useful structure, unsafe exact fields

All four requests used `google/gemini-3.1-pro-preview`, Google AI Studio through OpenRouter, high reasoning and a 24,000-token output ceiling. Each returned HTTP 200, `finish_reason: stop`, parseable JSON and nonzero video-token usage. Total reported cost: **$1.297458**. This establishes successful processing, not correctness or complete frame coverage.

| Guide | Video tokens | Completion tokens, including reasoning | Reasoning tokens | Cost USD |
|---|---:|---:|---:|---:|
| aDrive | 134,313 | 7,695 | 3,976 | 0.361700 |
| JoeUX9 | 179,375 | 7,062 | 3,218 | 0.444232 |
| TheBattleRoom | 107,669 | 7,965 | 4,679 | 0.311658 |
| KingVGC | 56,514 | 5,507 | 3,885 | 0.179868 |

The captions corroborate the major construction decisions: manual weather versus automatic weather, recovery after recoil, allocating support to an intended attacker, and revising an unattainable survival target. Model-reported slide contents provide leads for closer inspection, rather than additional verified facts.

Three failure classes matter before graph ingestion:

- **Stale world knowledge overrides the source.** JoeUX9 and KingVGC outputs speculate that Champions is a custom format or fan game. That speculation has no support in the retrieved first-party metadata and is discarded.
- **Stat units get mixed.** JoeUX9's output assigns legacy 252-EV spreads and puts final stats into an `evs` field, despite captions discussing Champions points. Those fields are quarantined. TheBattleRoom's model output gives Incineroar 32 HP / 4 Atk / 6 Def / 16 SpD / 11 Spe, totaling 69; the [18:00–18:17 caption](https://www.youtube.com/watch?v=I9bXHtYnzGY&t=1080s) says one Attack point, totaling 66. We retain the conflict rather than silently repair the supposed visual reading.
- **A guide can show several teams or illustrative clips.** aDrive's model output pools numerous sets without tying every set to a timestamp or team version. Do not materialize that list as one observed roster. A reported Assault Vest plus Protect combination also warrants checking its source context before using it as an actionable set.

This is a good reason for a claim graph: retain author, time, team version, exact source interval, extraction method and contradictions. It is not a reason to build a second damage calculator. Promote the verified strategic relationship; keep disputed set fields out of computations until resolved.
