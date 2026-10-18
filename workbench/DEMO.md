# Gimmikghoul: change the team, preserve the plan

Track: **Agents That Act on Connected Data**.

Gimmikghoul helps a player and a coding agent inspect an unusual Pokémon core, change its components, and see which plans survive. FalkorDB holds the conditional routes, shared requirements, sources and analysis history. The player can collect part of the graph and give the agent the same evaluated context.

## Three-minute recording

| Time | On screen | Say |
| --- | --- | --- |
| 0:00–0:20 | BSS case, source team of Mega Sableye and Galarian Slowking | “A team is a collection of plans. These two defensive Pokémon leave one question: who actually makes progress?” |
| 0:20–0:45 | Try Garchomp. Open the third-slot goal. | “Adding a third member closes the structural gap. It does not prove the matchup. The graph keeps the opponent, chosen three and progress checks visible.” |
| 0:45–1:15 | Simple Beam Torterra case. Remove Farfetch’d. Open Create a boosted Torterra. | “This breaks the amplified setup. Ordinary Shell Smash and Decorate still offer routes to the broader goal, with different conditions and outcomes.” |
| 1:15–1:40 | Inspect Keep Ground pressure without hurting the ally. Try the Headlong Rush repair. | “We can preserve the purpose by changing the mechanism. Single-target Ground damage avoids friendly fire, but gives up spread damage and lowers defenses. The edited set still needs validation.” |
| 1:40–2:10 | Collect the Shell Smash condition, export collected context. | “One condition belongs to several goals. The export retains every affected route, source, accepted edit and unresolved assumption. A coding agent can inspect this through the same API.” |
| 2:10–2:40 | Terminal: `node workbench/agent.mjs affected simplebeam-torterra farfetchd`; then the typed proposal below | “The agent follows dependencies in FalkorDB and submits a proposed edit. The evaluator checks the stored graph. Every result carries its model revision.” |
| 2:40–3:00 | Return to the inspected route and its conditions | “The current workbench has three authored cases. Our next experiment is whether retrieving and validating more mechanisms helps players find useful unfamiliar cores.” |

Before recording, reset each demo case and unpin any members left from testing. Keep the browser wide enough to show team, map and inspector together. Do not present a script-driven walkthrough as autonomous discovery or describe a condition set by the presenter as a battle measurement.

## Reproduce the API sequence

Start FalkorDB using the workbench setup, then run:

```sh
npm run demo:workbench
```

This executes eight scenarios against the real HTTP handlers and a fresh temporary FalkorDB graph, verifies their expected outcomes, writes `.artifacts/workbench/demo-run.json`, and removes only its own graph. Existing UI cases and latest-run history are preserved. It does not call an LLM. The report records every proposal, accepted team, route result, evidence reference and graph/evaluator identity. Every scenario also verifies that a separate context request retrieves its persisted analysis.

The final doubles step replaces Wide Guard with Earthquake. It demonstrates the lost protection route and the surviving Headlong Rush/ally-Protect alternatives. Torterra cannot use Wide Guard and a Ground attack in the same turn; separate route availability does not imply joint execution.

## Agent handoff in the live workbench

Export context from the UI, then ask Codex or Claude:

> Keep Ground pressure while removing dependence on a Ground-immune ally. Read the exported accepted scenario and query affected dependencies. Compare the available routes, state what the proposed change loses, and submit one typed edit for checking. Leave unmeasured battle and legality conditions unknown. Do not claim that a higher win rate was measured.

The agent can use these tools through the terminal:

```sh
node workbench/agent.mjs context simplebeam-torterra
node workbench/agent.mjs affected simplebeam-torterra torterra-smash
```

An example proposal is below. Replace `REVISION_FROM_CONTEXT` with the current `meta.graphRevision`. Include the existing accepted proposal history from the export before this edit if continuing the player's scenario; requests are complete scenario proposals, not incremental writes into the latest run.

```json
{
  "expectedGraphRevision": "REVISION_FROM_CONTEXT",
  "interventions": [
    {"type":"replace_move","setId":"torterra-smash","from":"earthquake","to":"headlongrush"}
  ]
}
```

Pass the JSON on stdin to `node workbench/agent.mjs analyze simplebeam-torterra`. The call saves a new run. It does not automatically change the browser's local proposal history.

## What FalkorDB contributes

The database stores executable expression structure as `HAS_EXPRESSION` and ordered `ARG` relationships. Analysis reconstructs those expressions from the selected immutable graph scope. A traversal from member/set through conditions and routes finds affected goals. Shared conditions keep one identity across several plans. The backend test changes a stored expression and observes a changed evaluation.

The three-valued evaluator and bounded candidate search run in JavaScript. PageRank would not establish strategic strength, so it is not used for that purpose. This implementation demonstrates graph-dependent behavior, not a measured speed or discovery advantage over a relational representation.

## Submission handoff

The [official rules](https://www.wemakedevs.org/hackathons/falkordb/rules), checked October 18, require central FalkorDB use, a public repository, setup/model/query documentation, a working demo video, a named track, and AI-assistance disclosure. Local setup is accepted. The deadline is October 18, 2026, 23:59 IST, or 14:29 in New York. No numerical scoring rubric was published on the inspected page.

- Repository: https://github.com/shivraj-S-bhatti/pokemon-battle-lab
- Setup/model/queries: [workbench guide](README.md), [backend](backend/store.mjs).
- Track: Agents That Act on Connected Data.
- Original work: the workbench, typed route reasoning, interventions, graph integration and reviews were implemented during the event. Earlier research remains in the repository as background.
- AI assistance: Codex implemented reasoning and integration; Claude implemented the interface and adversarially reviewed logic. Shivraj supplied the problem framing, Pokémon cases and product direction. The participant must be able to explain the implementation.
- Pending: record and attach the working demo video; complete final visual review; confirm registration/team details and submit through the event panel. No submission is claimed here.
