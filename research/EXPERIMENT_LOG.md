# Experiment log: creative Pokémon team analysis

Recorded 2026-10-17. We are building an agentic analyst that proposes unusual cores, explains how to pilot them, and compares alternatives under explicit assumptions. The work so far establishes data plumbing and several failure modes. It does not establish a competitive team, a validated video extractor, or a discovery advantage from graph storage.

## What we tried and what happened

| Attempt | Evidence | Result and implication |
|---|---|---|
| Import mechanics and usage into FalkorDB | [Ingestion report](INGESTION_RESULT.md), [source manifest](evidence/source-manifest.json), `scripts/prepare.mjs`, `scripts/export.mjs` | 3,877 nodes and 151,201 edges. Repeated import preserved counts. Availability, form legality and complete team legality remain separate checks. |
| Compare graph retrieval with an indexed plain-data baseline | [Experiment receipt](evidence/experiment.json), `scripts/experiment.mjs` | All five queries agreed. Plain JavaScript was faster in this local experiment. This supports correctness of those queries; it does not support a graph performance or reasoning advantage. |
| Search rare Simple Beam / Shell Smash pairs | Same receipt | Retrieval found candidates, including a double-Mega combination that the retrieval gate did not eliminate. Candidate retrieval is not team validation or viability evaluation. |
| Inspect singles population and historical usage | [Singles notes](SINGLES_CASES.md), [history](evidence/meta-history.json) | 323 usage entries included forms; 229 distinct National Dex numbers in that source. 69,462 was an aggregate Showdown battle count, not a downloaded replay corpus. Official roster rows, distinct species, usage entries and validated forms measure different things. |
| Query Clawitzer plan dependencies after removing Sceptile | [Plan receipt](evidence/plan-demo.json), `scripts/plan-demo.mjs` | Four manually entered claims, two missing support roles, Pikachu/Raichu matches for Lightning Rod + Upper Hand. A useful dependency fixture, but an overfit search definition. No battle counterfactual was evaluated. |
| Ask Gemini for complete video state extraction | [First three runs](evidence/video-run-summary.json), [high-budget run](evidence/video-high-budget-run.json) | Four requests cost $1.655820 in recorded provider usage. Two truncated, one denied visual access in its answer, one returned seven unverified opening observations. No complete, independently checked extraction. |
| Delegate three research threads to Claude's cloud project | [Review](CLAUDE_AND_PERPLEXITY_REVIEW.md) | Delivered reports, a claimed simulation pilot and a claimed IR prototype. Cloud source-access restrictions blocked video extraction. Creating a cloud project was the wrong environment for the requested local-folder chats. |

## Video failure record

All four calls sent the same full-video input, including 143,685 billed video tokens. Asking about the first 120 seconds did not clip the uploaded input.

| Request | Completion / reasoning tokens | Outcome | Recorded cost |
|---|---:|---|---:|
| 6,000-token output cap | 5,996 / 5,759 | Truncated | $0.360260 |
| Low reasoning | 23 / 0 | Answer denied frame/audio access | $0.288584 |
| Opening-only prompt | 3,157 / 2,472 | Seven model-generated observations, not frame-verified | $0.325500 |
| 32,768 cap, high reasoning | 32,764 / 31,455 | Truncated, invalid JSON | $0.681476 |

The receipts show output exhaustion and unchanged video input. They do not identify why one response denied access. The adapter forced temperature 0.2; its contribution to the failure is untested. Raising the cap alone did not fix extraction. [Scope and video notes](SCOPE_AND_VIDEO.md) preserve the request history; [options](VIDEO_EXTRACTION_OPTIONS.md) distinguish documented settings from paths we have actually tried.

## Corrections that change the next experiment

**Generate alternative effects.** Shivraj's correction was that Clawitzer can be protected through redirection, damage reduction, a switch into immunity or resistance, speed control, or removing a threat. Requiring the same two abilities/moves simply searches for a substitute component. The next generator must admit different mechanisms that serve the same plan, then check their timing, targeting, prerequisites and costs.

**Separate cheap evidence discovery from precise reconstruction.** The Perplexity discussion proposes transcript-first bulk extraction of team ideas and piloting claims, followed by visual inspection only where the claim depends on the board. That is a better next baseline for creative ideation. A transcript cannot certify a battle state; a compilation of selected wins cannot estimate a ladder win rate.

**Separate types of evidence.** Static mechanics, dated usage, creator claims, observed events and calculated hypotheses have different meanings. A dated projection can join them without turning co-occurrence into causal synergy. Physical database separation is optional; provenance and filtering are not.

**Compare interventions under a specified policy.** Replacing a member, move or item changes outcomes under an opponent population and a continuation policy. A short-horizon score such as “Clawitzer attacks and survives” measures a local plan, not winning the game. Rankings must report sensitivity to those choices.

## What has not been done locally

- No complete video or transcript extraction has been independently checked.
- No local battle-simulation results support a team ranking.
- No held-out test establishes novel-core discovery or generalization.
- No graph algorithm has demonstrated value over a simpler baseline.
- No current official Champions usage distribution has been acquired; Showdown statistics are a community proxy.

## Next bounded experiments

1. Extract broad, source-located team/piloting claims from a small set of captions and written reports; inspect a sample for usefulness and errors. Measure cost per usable claim before scaling.
2. Generate diverse mechanisms for one desired effect with the smallest useful state and condition representation. Compare against exact-match retrieval and a plain-data baseline.
3. Retrieve and audit Claude's simulation scripts, seeds and raw outputs before importing its rankings. Recompute counts and test objective/continuation sensitivity.

These are experiments, not a commitment to MCTS, a neural model, PageRank, or an exhaustive situation ontology.
