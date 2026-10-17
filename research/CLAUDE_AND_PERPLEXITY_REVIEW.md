# Review of Claude and Perplexity research

Reviewed 2026-10-17. The Claude strategy formulation and Clawitzer report were read in full through their artifact viewer; the representation and evidence threads' result messages were inspected. The cloud simulation code and raw results have not been retrieved or rerun locally. The distinction matters: reported results below are evidence of what Claude produced, not independent reproduction.

## Claude: useful work, with limits

**Strategy formulation.** Claude defines a desired effect over trajectories, indexes candidate mechanisms by their place in move resolution, and evaluates restricted simultaneous-action games using the simulator. That moves beyond the old exact Lightning Rod + Upper Hand query. Its chosen local score was expected Clawitzer attacks over three turns plus the probability Clawitzer remains alive.

The report claims roughly 68,000 three-turn simulations using Showdown Champions revision `7244fe8`, eight partners, three opponent leads, forty samples per cell and two continuation policies. Sinistcha led the reported protection ranking; changing to an offensive-tempo score moved Mega Sceptile from seventh to first. These results concern a synthetic, restricted pilot with hypothetical sets. They are not a ladder win-rate estimate or a universal partner ranking.

The sensitivity result is more useful than the leaderboard: what counts as a good partner depends on the plan and subsequent decisions. The retrieved local catalog uses a different revision, `a833737d8408322c8b1e821dee16af07b1fd9234`; the two pins must be reconciled before combining results.

**Representation.** Claude reports a small effect layer with true/false/unknown preconditions, versioned files or SQLite as the source of truth, and FalkorDB as a derived view. It reports fourteen tests, twenty-one simulator probes, candidate parity, and approximately 235 ms graph versus 39 ms plain-Python retrieval. Those are cloud-reported measurements, not local benchmark results. This design is compatible with the local finding that a graph store alone has not improved retrieval.

The representation thread uses hand-written effect annotations while the strategy thread describes an automatically generated hook index. These can be complementary, but a hook name is only a candidate-generation hint: it does not fully specify scope, conditions or consequences. The integration needs an explicit boundary between automatic indexing and reviewed semantic annotations.

**Evidence extraction.** Claude could not access the video or Reddit post in its cloud environment. It reports a pipeline and synthetic offline tests, but no real extraction run. Its later reply recommends captions first, selective video windows, batch requests and cheaper models. The quoted costs are estimates. Synthetic tests and agreement between two model outputs do not independently establish extraction accuracy.

## Findings to fix before trusting the pilot

1. **Incorrect mechanics explanation.** The report says Intimidate does nothing against “special or Grass attackers.” Grass typing does not prevent an Attack drop. The pinned [Intimidate implementation](https://github.com/smogon/pokemon-showdown/blob/a833737d8408322c8b1e821dee16af07b1fd9234/data/abilities.ts#L2194) attempts to lower adjacent opponents' Attack; other mechanics can block or alter that effect. Whether this mistake affected the simulation or only its explanation remains unknown.
2. **Run-count inconsistency.** The reported product `8 × 3 × about 70 × 40 × 2` is about 134,400, not 68,000. One factor may describe a subset or both runs together. Recover actual row counts, unique seeds and run manifests rather than selecting either total.
3. **Restricted-game guarantees.** Six hand-picked opponent joint actions and scripted later turns define a restricted game. A small equilibrium gap there does not establish low exploitability in the full game. The report's “best response to a uniform opponent minus equilibrium value” measures sensitivity to the opponent model; it is not the usual exploitability of an evaluated policy.
4. **Objective reward can mask failure.** Switching Clawitzer away earns survival while contributing no attacks, producing a reported score floor near one. Measure the intended plan and overall team outcome separately; do not select a team solely on this surrogate.
5. **No general causal conclusion about diversity yet.** Eight selected partners and three selected leads do not isolate the effect of mechanism diversity. Different partners also differ in stats, moves and opportunity costs. Treat the diversity claim as a hypothesis requiring controlled comparisons and held-out cases.
6. **Uncertainty must match the outcome.** A score combining attack count and survival is not Bernoulli. Estimate uncertainty from the sampled outcomes, with pairing or resampling that respects shared seeds and opponent mixtures. Model and continuation uncertainty remain outside a simple sampling interval.
7. **Legality, sheets and dates require exact context.** The cloud report's date span and open-team-sheet assumptions should not silently become rules for every Champions ladder. Pin the exact simulator format and distinguish ranked seasons, regulations and tournament conventions.

## What to take from the Perplexity attachment

The user supplied a transcript advocating cheap bulk analysis and counterfactual decision-making. Adopt these as proposals:

- Use captions and text reports to identify teams, proposed lines, matchup conditions and recommendations. Request video only for missing visual evidence.
- Model team value conditional on opponents and pilots: `E[Pr(win | team, opponent, policy)]`. For local experiments, choose and label a measurable surrogate.
- Generate hypotheses with an LLM; check legality and mechanics with explicit tools; evaluate selected alternatives rather than trusting prose alone.
- Preserve observation, author statement and analyst inference separately.

The transcript's hourly token estimates and Gemini Batch prices have not been measured in this project. They are excluded from the experimental cost ledger. Its cited reading leads are [Algorithmic Pokémon Teambuilding](https://sahovic.fr/algorithmic-pokemon-teambuilding.html), [Towards Mastering Diverse Team Strategies in Competitive Pokémon](https://arxiv.org/html/2506.10326v3), [PokéChamp](https://openreview.net/forum?id=SnZ7SKykHh), and [Smogon VGC cores](https://www.smogon.com/forums/threads/good-vgc-cores.3684842/). This capture does not claim a fresh literature review of those sources or novelty relative to them.

## Decision

Continue with cheap claim extraction and effect-based candidate generation. Keep simulation selective, and use it to challenge hypotheses. Preserve the existing exact-match demo as a negative baseline. A claim of graph value needs an ablation using the same information and candidate budget; the current evidence does not supply one.
