# Gimmikghoul workbench

Change a Pokémon team, inspect which plans break, and compare ways to preserve the purpose of the plan. Human and agent use the same stored graph, case revision and analysis history.

## Start

From the repository root:

```sh
npm ci --ignore-scripts
docker compose up -d --wait
npm run workbench
```

Open http://127.0.0.1:4318. The three included case records seed `pokemon_workbench_v1`; no model key is needed to explore the workbench. `GRAPH_URL` changes the database connection; `PORT` changes the web port. The existing catalog search additionally requires `prepare:data`, `export:data` and `ingest` from the root README. Without the catalog import the case workbench still runs, but catalog discovery is unavailable.

```sh
npm run test:workbench
node workbench/agent.mjs cases
node workbench/agent.mjs context simplebeam-torterra
node workbench/agent.mjs affected simplebeam-torterra farfetchd
node workbench/agent.mjs catalog move wideguard
```

An agent submits proposed changes as JSON on stdin:

```sh
node workbench/agent.mjs analyze simplebeam-torterra <<'JSON'
{"interventions":[{"type":"replace_move","setId":"farfetchd-beam","from":"simplebeam","to":"protect"}]}
JSON
```

The browser's Export for agent includes the current edits and collected nodes. `/api/context` also exposes the last submitted analysis request, so a local coding agent can pick up the human's scenario. It is not a multiplayer synchronized editor: selections and browser edit history are local; analysis runs are shared and persisted.

## Graph model

```text
Case --activeScope--> versioned model
                         |
                    HAS_COMPONENT
                         |
Goal --HAS_ROUTE--> Route --HAS_EXPRESSION--> AND / OR / NOT
 |                    |                          |
SUPPORTED_BY       REQUIRES                     ARG (position)
 |                    |                          |
Source             Condition <------------------+
                      |
                DEPENDS_ON / READS_SET
                      |
                  Member / Set

Case --HAS_RUN--> immutable analysis request + result
```

`activeScope` is a version pointer property. Executable route expressions are reconstructed from `HAS_EXPRESSION` and ordered `ARG` edges on every analysis. Dependency traversal finds affected goals; catalog queries find providers outside the authored cases. The evaluator handles three-valued logic and bounded repair search in JavaScript. FalkorDB stores the actual model and run history; the server does not serve a synthetic fallback when it is unavailable.

Relevant Cypher is in `backend/store.mjs` and `backend/server.mjs`, including:

```cypher
MATCH (g:WBNode)-[:HAS_ROUTE]->(r:WBNode)-[:REQUIRES]->(p:WBNode)
      -[:DEPENDS_ON|READS_SET]->(m:WBNode)
WHERE g.scope = $scope AND m.key = $memberKey
RETURN DISTINCT g.json, r.json, p.json
```

The integration test changes an expression stored in the graph and verifies that the analysis changes. Separate tests check interventions, context persistence, dependency retrieval, catalog retrieval and local request boundaries.

For the recording script, runnable API walkthrough and submission handoff, see [DEMO.md](DEMO.md).

## Demo sequence

1. Start with Mega Sableye / Galarian Slowking. The third-slot goal is blocked. Try Garchomp, Corviknight or Primarina: the structural gap closes while opponent-specific progress remains unchecked.
2. Open Simple Beam Torterra. Remove Simple Beam. Amplified setup breaks; ordinary Shell Smash and Decorate remain different routes with different outcomes. Inspect the relevant source and conditions.
3. Change White Herb. Offensive amplification and defense restoration are separate outcomes. This distinction came from Claude's adversarial review.
4. Export the scenario, have a coding agent inspect affected dependencies and catalog candidates, and submit a typed edit through the same API.

The Torterra / Mega Raichu Y / Milotic case is VGC doubles. Mega Raichu Y's No Guard is not an allied accuracy aura. Singles is kept separate.

## Scope

The three case adapters are authored models. The workbench evaluates their conditions and small repair candidate pools; it does not discover arbitrary strategies, simulate battles, optimize spreads, certify edited-team legality or estimate win rates. Usage is a dated September Showdown snapshot. No claim of superior competitive performance has been established.

Codex implemented integration and reasoning; Claude implemented UI/UX and adversarially reviewed the logic. Shivraj supplied the problem framing, candidate cores and product direction. See `LOGIC_REVIEW_CLAUDE.md`, `logic/REVIEW_NOTES.md`, and `logic/PROGRESS.md` for review findings and dispositions.

## Revision and proposal safety

Analysis responses identify both the stored model revision and the evaluator code hash. Send `expectedGraphRevision` from the graph/context response when submitting a proposal; a mismatch returns HTTP 409. Context labels an older run as `stale` when either revision differs. A shared latest run can belong to another agent, so browser exports separately preserve the exact accepted UI run and its proposal results.

Pins protect explicit proposals and repair search. A rejected edit remains in the proposal history but does not change the displayed or exported accepted team. Condition assumptions are invalidated when a saved graph revision changes. Each route exposes its own conditional outcomes; the shared goal does not imply all alternative outcomes occur together.
