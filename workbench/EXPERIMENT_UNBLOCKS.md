# Exploration handoff, October 18

The user wants creative team exploration beside the native FalkorDB Browser. The authored dependency checker and custom website are parked. The next runthrough should produce a candidate plan, meaningful alternative, and a reason to keep or reject each.

## Decision contract

Start with the intended format, core and style of play. Name the matchups to target, losses the builder accepts, and dealbreaker threats. Retrieve possibilities broadly, then request existing-calculator results only for thresholds that can change a teammate, set, lead or bring selection. A matrix against every species is not the objective.

The visible graph can be a symbolic discussion board. Connect Pokémon, candidate plans, enabling partners, target matchups, accepted weaknesses, alternatives and source clips. Show direction and strength only when their meaning is defined. Preserve competing choices and rejected options. Agents may construct different temporary graphs or hypergraphs underneath; the human view need not expose their execution structures.

## Ready

- Native graph viewer: http://localhost:4319. Database: `redis://127.0.0.1:6388`, writable without password, loopback only. Persistence now uses the named volume with AOF.
- Official FalkorDB MCP 1.3.0: see [MCP setup](mcp/README.md). Codex has the named server registered; reload the MCP connection. Claude Code sees the project server and requires its ordinary first-use approval.
- Species sprites: 1,407 exact local assets, including all 392 catalog entries marked Champions. Native 2D Browser renders them; ten unavailable forms outside that subset remain missing. See [sprites](SPRITES.md).
- `node scripts/graph.mjs list`; pipe Cypher to `node scripts/graph.mjs query pokemon_mc_202609`. For writes use an exact `gk_*` name and `--write`. Reset only an exact disposable graph: `node scripts/graph.mjs reset gk_NAME --yes`.
- `data/meta-sets.json`: top 60 species for each September M-C doubles/BSS snapshot. Up to 32 entries per marginal with retained-weight accounting. Mode-combined candidate sets all passed individual engine validation. They are constructed candidates, not observed full sets, and have no joint probability.
- Experiment sprites: `node scripts/experiment-sprites.mjs gk_NAME` copies exact-name sprite metadata onto existing Mon/Species nodes. Applied to 134 gk_meta nodes.
- Exact-format legality adapter: [tools](tools/README.md). The native Smogon Champions calculator adapter is ready under tools/damage.mjs, pinned to c1eb09be. It passes through upstream ranges and KO descriptions. The custom roll-enumeration path was removed; [reuse handoff](tools/CALCULATOR_REUSE.md).

## Review before using existing experiment rankings

Claude's E1-E5 documents are exploratory outputs. E1's species-level estimated exposure cannot establish the percentage of teams lacking a response. E3's custom multi-turn KO enumeration and one marginal-mode set per species are not sufficient evidence of winning matchups. Neutral-field coverage misses the value of support and setup. Treat the current gk_meta rankings as questions to investigate, not recommended optimal teams.

The video analyses in `research/experiments/` should inform the next graph representation. Keep narration, visible observations, model interpretation and our hypotheses distinct. Do not collapse a debated option into the creator's final choice.

## Coordination

Persistent Codex science chat owns the calculator adapter and reasoning logic. Claude desktop owns exploratory experiments and the human-facing board. Parent Codex integrates and validates. Native Claude received the scope correction in its existing desktop chat and began relaying it to E6/E7. A written adversarial review is requested in CLAUDE_EXPLORATION_REVIEW.md. Preserve any active user composer draft.

The next runthrough: choose a seed idea and target matchups, browse competing supporting cores, inspect one decision-changing calculator result, and follow its source back to a timestamp or mechanics record. No event submission has been made by this session.
