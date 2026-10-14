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
