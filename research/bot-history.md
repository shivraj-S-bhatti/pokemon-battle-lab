# Bot history: from poke-env to Jaxcalibur

Showdown (Zarel, 2011) is the arena. VGC = official doubles (bring-6-pick-4 +
team preview). Smogon singles = 6v6.

## Timeline

- **~2020 — poke-env** (Sahovic). The platform everything stands on: Python
  wrapper over Showdown's websocket protocol, Gym API, DQN example.
- **~2020 — Showdown-AI-Bot** (JJonahJson). Gen 1–7 randbats, depth-limited search.
  Closest match to the "viral bot from ~5 years ago" memory — but no single
  Showdown-hosted viral bot could be confirmed. Treat as uncertain.
- **Oct 2023 — Peter Whidden's Pokémon Red RL.** 50k+ emulator hours, beat Brock,
  ~2.5M views. Single-player completion, not battling.
- **Feb 2024 — PokéLLMon** (Hu et al., arXiv:2402.01118). First LLM battler: 49%
  Showdown ladder / 56% invited matches.
- **2025 — Metamon** (UT Austin, arXiv:2504.04395). Offline RL transformers on 5M+
  reconstructed human trajectories + 20M self-play games. 90–99th percentile vs
  humans; won the NeurIPS 2025 PokéAgent Challenge.
- **Mar 2025 — PokéChamp** (Princeton, ICML Spotlight, arXiv:2503.04094). Minimax
  with LLMs for action sampling, opponent modeling, and value estimation — no LLM
  training. Elo 1300–1500 (top 30–10%) in Gen 9 OU.
- **2025 — VGC-Bench** (UT Austin, AAMAS 2026, arXiv:2506.10326). First serious
  doubles benchmark: ~10^139 team configs, 700K+ battle logs.
- **2026 — Jaxcalibur** ("Jack's Caliber"). Gen 9 randbats, self-play RL + pUCT
  AlphaZero-style on poke-env/JAX. Hit **#1 on the ladder**, peak 2557 Elo /
  95.3 GXE — first AI at top-human level in a narrow format.
- **2026 — Champions VGC bots.** Victory-Dance (behavior cloning on 86k battles →
  PPO self-play league; top 500 twice, peak 1744 Elo) and antonius1 (PPO
  transformer + fictitious play).
- **2026 — Pokémon Company's first official AI comp:** $300k TCG AI Battle
  Challenge on Kaggle.

## Caveats

Ladder figures are author self-reports, not independently verified. The viral-bot
memory is unconfirmed.

## Context dump — 2026-10-16

### The viral bot, identified
The "~5 years ago viral Showdown bot" from the timeline caveat is **"How an A.I.
is Becoming the World's Best Pokemon Player"** by **The Third Build (Albert
III), 2022** — cited in the PokéChamp paper (arXiv:2503.04094).

**Future Sight AI — how it works** (from pokemonbattlepredictor.com, the "HOW
FUTURE SIGHT AI WORKS" page, and the creator's Smogon writeup):
- **Pokemon Battle Predictor** (data engine): Showdown browser extension, 4
  TensorFlow.js models trained on 2,000,000+ battles (gen8ou replays, 1250+
  rated players). Per-turn predictions: win probability, P(opponent switches),
  which move they use if they stay, which mon they switch to.
- Inputs per turn: HP, statuses, active mons, stat boosts, last moves used,
  volatile/side conditions, weather. Core principle: predict calibrated
  *chance*, not deterministic outcomes.
- **Future Sight AI** (the battler): predicts the opponent's next move, infers
  hidden sets from usage stats, and each turn picks the move maximizing win
  probability — 1-ply expectimax over a learned opponent model + learned value
  function. No equilibrium solving. Reached top 5% of the ladder.
- Most code private; public extras on GitHub (aed3.github.io); exhibition
  stats on the site.
- Takeaway: behavior cloning + greedy search hit top 5% — the simple baseline
  any CFR/RL build must beat.

### Jaxcalibur — announcement (Smogon, Aug 2025)
Archived from the creator's announcement post (Smogon thread
"Jaxcalibur - A Gen 9 Randbats bot that reached #1 on the ladder"):

> I built a Gen 9 Randbats bot that reached #1 on the ladder
>
> Hi everyone! I am excited to share a new Pokémon bot named Jaxcalibur. It
> only plays Gen 9 Random Battles, but it plays them extremely well. Over the
> past three weeks, it has spent time at #1 on the ladder and reached a peak
> Elo of 2557 and peak GXE of 95.3. As far as I know, it is the first AI to
> reach the level of top human players at Pokémon battling, albeit in a narrow
> format. For comparison, the strongest previous bot I'm aware of, FoulPlay,
> peaked around 2341 Elo and 88 GXE, which is roughly top-50 rather than top-1.
>
> That said, I can't say Jaxcalibur is the world's best random battler because
> one human outperformed it over this time period! MichaelderBeste2 held #1 on
> the ladder about 50% of the time compared to Jaxcalibur's 20%, and reached a
> slightly higher GXE of 95.5.
>
> How it works: neural net trained with self-play reinforcement learning
> combined with pUCT search, similar to AlphaGo Zero. Built on poke-env and
> Jax. Technical write-up at jaxcalibur.github.io.
>
> Observations: fairly conservative, prefers safe lines over hard reads;
> especially good at endgames (calculates several turns ahead). Weaknesses:
> imperfect PP-stalling understanding, tendency to become predictable.
>
> Status (Aug 28): stopped searching for ladder games (rating decay); still
> accepts randbats challenges (one game at a time). Randbats only; extendable
> to other singles formats and, with more work, doubles. Can't build teams
> itself, but self-play with different teams can evaluate team strength.
>
> Open-sourcing question: holding off releasing code and weights (cheating
> concerns — ladder climbing, suspect reqs, tournaments; cf. Smogon discussion
> on bots and suspect reqs). Possible middle ground: code without weights.
> Asking the community for norms on responsible release.

**Technical details** (from jaxcalibur.github.io, summarized):
- 8.5M-parameter non-causal transformer (pre-RMSNorm, position-based
  mixture-of-experts). Inputs: 1 battlefield token, 2 active-mon tokens,
  5 move tokens, 6 own-team + 6 opp-team tokens (masked if unknown),
  16 event-history tokens, 24 matchup tokens (damage calcs, fused mid-network).
  Action heads: switch logits per team slot; move + tera-move logits per move
  slot. Tiny by modern standards (<20% of AlphaGo Zero); trained on one GPU.
- Training: PPO + GAE, undiscounted 1/0 rewards, entropy + zero-avoiding
  KL-to-uniform regularization. Auxiliary losses: win probability (value),
  opponent item/ability/moves/tera prediction, opponent next-action prediction
  ("made the bot substantially stronger"). No search during self-play.
  ~100M games in ~1 week on one H100.
- Custom JAX battle engine (vmap/jit on GPU) — "executes every possible game
  step and keeps only the relevant results." Built with Claude Code help.
- Test-time pUCT variant: simultaneous moves → sample ∝ max(Q−V,0) +
  c_puct/√N · P (shifts toward regret-matching as visits grow); stochasticity
  via fresh-seed rollouts with a {state_hash → node} dict, HP binned to 10
  buckets; hidden info via sampled "worlds" from network predictions
  (Foul Play-style); opponent search truncated on "surprising" actions (<65%
  predicted likelihood) to avoid leaking hidden info. Depth 4 (2 full turns),
  20,480 rollouts over 32 worlds, seconds on GPU. Search ≈ +100–150 Elo over
  the base policy — "most of the strength comes from having a really good
  neural net."
- Links: https://jaxcalibur.github.io/ · self-play win rates
  (jaxcalibur.github.io/win_rates/) · Smogon thread.

### October 2026 scene
- **Victory-Dance** (phakeoa/victory-dance): BC on ~86k human battles
  (~1.4M decisions) → offline advantage weighting → self-play PPO league
  (KL-anchored); team-preview network (SBDA contrastive set-scoring).
  Oct 2026: top 500 twice, seen #172, 1679 Elo (peak 1744). Ships an RL
  exploiter (worst-case robustness meter) + gauntlets.
- **antonius1** (philmantatsky/vgc-pokemon-showdown-ai): PPO transformer +
  fictitious play vs a league including a human-imitation model cloned from
  ~14k top-player games; 25,000-battle gate batteries; first 100 ranked games
  55–45, peak 1365 Elo; live on the official Showdown server taking
  challenges.
- **nolelle/pokemon-vgc-ai**: rules-first bot, Champions VGC 2026 Reg M-C,
  targeting 1700+ Elo; current models experimental.
- **ChampTeams** (llhtoby38/champteams-sim): deterministic battle engine +
  rule-based AI + "AI Arena" gauntlet benchmark vs meta teams.
- All figures are the repos' self-reported README claims, not independently
  verified.
- CK49VGC, "Bots are Better than Pros at Pokemon. Now What?" (2026-10-14) —
  recent scene commentary: https://youtu.be/VSAeOI0CLx0
