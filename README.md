# pokemon-battle-lab

Research + build workspace for the Pokémon battle-AI track: the RL/ML, game theory,
and complexity science behind competitive Pokémon bots.

Tracked in the SSB agency: issue #5 (Pokémon battle AI — RL/ML research and build).

## Research notes

- `research/complexity-notes.md` — NP vs PPAD, mixed strategies as distributions,
  CFR as the principled solver.
- `research/bot-history.md` — bot timeline: poke-env → PokéLLMon → PokéChamp →
  Metamon → Jaxcalibur → Champions VGC bots.
- `research/reading-list.md` — key papers with arXiv IDs, in suggested reading order.

## Build directions (pick one)

1. **Open Jaxcalibur-style reimplementation** (randbats) — self-play PPO + pUCT on
   poke-env, published training curves + exploitability. Teaches AlphaZero search,
   league training, Elo eval.
2. **(Deep/MC)CFR for VGC doubles with team preview** — tabular CFR on an abstracted
   game → DeepCFR, eval on VGC-Bench. Direct continuation of the PPAD/CFR thread.
3. **LLM + search hybrid for Champions VGC** — PokéChamp-style for doubles; LLM
   infers hidden sets and preview intent, search handles tactics. Timely with the
   2026 format.
4. **Benchmark/eval contributions** — forced-win puzzles, team-diversity suites,
   public leaderboard entry. Fastest route to a visible artifact.

## Standing references

- [poke-env](https://github.com/hsahovic/poke-env) — Python Showdown interface + Gym API
- [VGC-Bench](https://github.com/smashllc/vgc-bench) (UT Austin) — doubles benchmark
- [awesome-pokemon-papers](https://github.com/sethkarten/awesome-pokemon-papers)
- Pokémon Showdown — the battle arena
