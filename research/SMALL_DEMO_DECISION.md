# Keep the strange Pokémon; examine the plan

A small demo can show why a reported team works, what assumptions it needs, and which support roles disappear when the team changes. It should not promise to discover the optimal team or estimate a win rate from selected creator matches.

## What runs now

`npm run demo:plans` creates an isolated FalkorDB evidence graph from four manually extracted claims in the [Clawitzer report](https://www.reddit.com/r/PokemonChampions/comments/1wwsk73/after_a_million_calculations_and_practice_games_i/). It traverses each plan's requirements and the members supplying them. Removing Sceptile removes the reported Lightning Rod and Upper Hand support. The unrelated Dark Pulse and Dragon Pulse plans retain their documented provider, with their success conditions still unresolved.

A query against the existing Champions catalog finds Pikachu and Raichu possessing both requested mechanisms. Each passes a one-move partial-set check in the pinned simulator. That is a reason to investigate their speed, bulk, remaining moves, and the roles lost with Sceptile. It is not evidence that either replacement improves the team.

Source claims, counterfactual scenarios, and calculator results must remain different records. The source's regulation and publication time have not been established; M-C is the explicit assumption used for candidate validation.

## The three-minute product demo

1. Open a team report alongside its cited plan: threat, intended response, required teammate, and failure condition.
2. Remove a teammate. The agent queries dependencies, identifies the affected plans, and preserves unaffected evidence.
3. Ask for repairs. Retrieve candidates matching the missing roles, then run the specific legality, speed, or damage check needed to distinguish them.
4. Introduce a counterexample. Show that the affected conclusion becomes conditional or unsupported rather than silently overwriting its source.

The current script demonstrates the deterministic graph and validation steps. Automated extraction, an agent choosing tools, and the presentation interface remain to be built. The initial demo can start with this text report while video extraction is evaluated separately.

## Keep the architecture small

```text
report / video interval -> attributed claim -> plan -> required role -> team member
                              |                 |
                         source + time       explicit condition

counterfactual change -> affected plans -> candidate roles -> targeted check
                                                               |
                                                     result or rejected hypothesis
```

Use a stable schema for sources, claims, plans, conditions, and observations. Add a new type only when an actual question needs it. A date-filtered view is a projection of evidence, not a new ontology. Do not invent observation dates from a page's relative age or treat a counterfactual as historical change.

PageRank is unnecessary for this example. Relevance is which documented requirement a change affects. A co-usage rank would answer a different question and may favor already-popular Pokémon. A relational database or indexed in-memory structures can express the same computation. FalkorDB's contribution here is a central, inspectable relationship store that the analysis queries, not a new mathematical capability.

Offline hypothesis generation can come later: find an uncovered role, propose a mechanism, test its prerequisites, and retain the result with provenance. Generated suggestions remain hypotheses until checked. They must not increase their own confidence by citing other generated suggestions.

## Acceptance and evidence

The script's assertions passed for all four initial plans, exactly two affected support plans, an unaffected damage-plan control, and the Raichu partial-set validation. Full results: [plan-demo.json](evidence/plan-demo.json). Both graph and plain fixture evaluation agree on the affected plans; they share the extracted claims and therefore do not verify extraction accuracy.

For submission, require at least one agent-selected query/check and a recorded demonstration that the graph result changes its next action. For video ingestion, require timestamped observations checked against frames, explicit edit gaps, and separate narrator claims. No measured video-extraction accuracy or graph-specific discovery advantage has been established.
