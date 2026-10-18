# Gimmikghoul: change the team, preserve the plan

Track: **Agents That Act on Connected Data**

## Project description

Unusual Pokémon teams depend on sequences and conditions that a type-coverage chart cannot express. Changing one member can break a setup while leaving another route to the same goal intact.

Gimmikghoul is a workbench where a player and a coding agent inspect those dependencies together. Its current model contains three authored cases and a bounded set of alternative mechanisms. Select a team member, move or condition in the graph, inspect the plans it supports, and propose an edit. The workbench evaluates the revised scenario and separates broken routes, unresolved assumptions and surviving alternatives. Each route retains its evidence and tradeoffs.

Changing Torterra’s White Herb separates two outcomes: defense clearing breaks while amplified setup retains its timing and survival checks. The Pokémon, types and moves stay unchanged. Another example: removing the Simple Beam partner breaks amplified setup, while ordinary Shell Smash remains an alternative route to boosting. Replacing Earthquake with Headlong Rush can preserve Ground pressure without friendly fire, while losing spread damage and adding defense drops. The player can see what changed and what still needs checking.

FalkorDB stores the versioned executable condition graph. The backend reconstructs AND/OR/NOT expressions from graph relationships and traverses dependencies to find affected goals. A coding agent reads this same context through the CLI/API and submits typed proposals; accepted results and their revisions are persisted. The interface supports collecting relevant graph context for that exchange.

The demonstration evaluates modeled dependencies, rather than predicting wins or independently discovering optimal teams. Our next research question is whether a larger, evidence-backed mechanism library helps players and agents propose useful unfamiliar cores.

## Implementation and verification

- JavaScript/Node.js backend and evaluator; FalkorDB; browser interface; local coding-agent CLI/API.
- 58 tests pass against a fresh database, including changing a stored expression and observing the changed analysis.
- Eight scripted API scenarios exercise edits, alternatives, pins and persisted context. These scenarios do not invoke an LLM or simulate battles.
- BSS singles and VGC doubles have separate cases and assumptions.

## Links and disclosure

- [Source repository](https://github.com/shivraj-S-bhatti/pokemon-battle-lab)
- [Setup, model and queries](README.md)
- [Recording instructions and agent handoff](DEMO.md)
- [Clean-install evidence](evidence/clean-install.md)

Shivraj supplied the problem framing, candidate Pokémon cores and product direction. Codex implemented reasoning and integration. Claude implemented UI/UX and adversarially reviewed the logic. Earlier research remains as background; the workbench implementation was developed during the event. The participant must understand and explain the submitted implementation.

The working demo video must be added before submission. This file is prepared submission copy; it does not record an event submission.
