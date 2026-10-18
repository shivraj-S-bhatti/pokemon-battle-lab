# Reading list

Suggested order: theory first, then papers in chronological order.

## Complexity theory

1. Aloupis, Demaine, Guo, Viglietta (2012) — "Classic Nintendo Games are
   (Computationally) Hard". Proves generalized Pokémon RPG completion is NP-hard.
   (Note: overworld, not competitive battling.)
2. Daskalakis, Goldberg, Papadimitriou (2006) — "The Complexity of Computing a
   Nash Equilibrium". Computing Nash is PPAD-complete.
3. Chen, Deng (2006) — "Settling the Complexity of Two-Player Nash Equilibrium".
4. Zinkevich, Bowling, Johanson, Piccione (2007) — "Regret Minimization in Games
   with Incomplete Information". CFR — the distribution-computing engine behind
   superhuman poker and the principled Pokémon solver.

## Bot papers

5. Hu et al. (2024), arXiv:2402.01118 — PokéLLMon. First LLM battler:
   49% Showdown ladder / 56% invited matches.
6. PokéChamp (Princeton, 2025), arXiv:2503.04094 — minimax + LLM action sampling,
   opponent modeling, value estimation; no LLM training. Elo 1300–1500
   (top 30–10%) in Gen 9 OU. ICML Spotlight.
7. Metamon (UT Austin, 2025), arXiv:2504.04395 — offline RL transformers on 5M+
   reconstructed human trajectories + 20M self-play games; 90–99th percentile vs
   humans; won the NeurIPS 2025 PokéAgent Challenge.
8. VGC-Bench (UT Austin, 2025), arXiv:2506.10326 — first serious doubles benchmark:
   ~10^139 team configs, 700K+ battle logs. AAMAS 2026.

## Code to read first

- [poke-env](https://github.com/hsahovic/poke-env) — the platform everything stands on
  (~2020): websocket client for Showdown, Gym API, DQN example.
- [awesome-pokemon-papers](https://github.com/sethkarten/awesome-pokemon-papers) —
  curated paper list.
- Jaxcalibur (2026) — Gen 9 randbats, self-play RL + pUCT AlphaZero-style on
  poke-env/JAX; #1 ladder, peak 2557 Elo / 95.3 GXE. First AI at top-human level in a
  narrow format. (Repo — check upstream; self-reports, not independently verified.)
- Victory-Dance (2026) — behavior cloning on 86k battles → PPO self-play league;
  top 500 twice, peak 1744 Elo, Champions VGC.

## Video sources

See [VIDEO_SOURCES.md](VIDEO_SOURCES.md) for timestamped notes; synthesis in [LANDSCAPE.md](LANDSCAPE.md).

- Aaron Traylor (2026-02-06), "Competitive Pokemon may be Impossible to Explain". https://www.youtube.com/watch?v=wrR6MquGU6A. Four elements of battling; team building has no theory yet.
- ck49 (2026-10-15), "Bots are Better than Pros at Pokemon. Now What?". https://www.youtube.com/watch?v=VSAeOI0CLx0. Three ladder #1 bots in about a month; fast simulator was the bottleneck; team preview is the weak spot.
- Balduzzi et al. (2018), arXiv:1806.02643, "Re-evaluating Evaluation". Nash averaging for ranking under cyclic matchups.
