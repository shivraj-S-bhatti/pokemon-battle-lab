# Claude research artifacts, 2026-10-17

Recovered from the local Claude session scratchpad, a downloaded cloud artifact, and the earlier artifact-viewer capture. Source reports are preserved so their claims can be audited against the [review](../../CLAUDE_AND_PERPLEXITY_REVIEW.md); importing them does not validate their results.

- [Interactive learning map](learning-map/team-reasoning.html): “Why is this team good?” with a five-layer explanation, Bayesian update toy, regret-matching toy, reading links and video thumbnails. Download/open the HTML locally; GitHub displays its source. The editable `.src.html` and thumbnails are alongside it.
- [Strategy formulation](formulation.md): the original downloaded Claude cloud document.
- [Clawitzer report](clawitzer-report.txt): the complete rendered report text from the cloud artifact viewer, with the UI header removed.
- [Manifest](manifest.json): hashes, sizes and origin descriptions.

The cloud report refers to `strategy/exp/` scripts and additional documents that were not available in these local artifacts. No simulator implementation is recovered by this import. Its reported run count, mechanics explanation and evaluation claims retain the unresolved issues documented in the review.

The learning map is educational material, not a trained policy or battle evaluator. Its game payoff matrix is a toy. Its usage figures refer to the September 2026 Showdown M-C sample, not live official ladder data. References and broad mathematical claims have not received a full fact-check in this integration pass. In particular, a simulator is a versioned model of the game, and general-sum equilibrium-complexity statements should not be transferred directly to two-player zero-sum matrix games.

To reproduce the self-contained HTML from the source and local thumbnails, run `python3 build.py` inside `learning-map/`. The generated file matches the recovered HTML byte for byte. Google Fonts are optional external styling; the educational logic runs locally.
