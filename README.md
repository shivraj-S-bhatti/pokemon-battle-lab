# Gimmikghoul · Pokémon Battle Lab

## Current workflow: team exploration beside the graph

The next increment is the [minimal theory harness proposal](workbench/MINIMAL_HARNESS.md), alongside [Claude's adversarial assessment](workbench/CLAUDE_HARNESS_ASSESSMENT.md). It is a design proposal; the current runnable tools are below.

Start with [the exploration handoff](workbench/EXPERIMENT_UNBLOCKS.md). Choose an idea, target matchups and acceptable losses; use Codex or Claude to retrieve alternatives and request the few checks that could change a team decision. The native FalkorDB Browser shows Pokémon sprites and a compact human reasoning map. Agent runtime graphs may contain different structures.

After the catalog setup below:

```sh
docker compose --profile explore up -d --build browser
node scripts/pokemon-sprites.mjs --apply-only
node scripts/graph.mjs list
node workbench/tools/prepare-calculator.mjs
node workbench/tools/damage.mjs < workbench/tools/damage-examples.json
```

Open [FalkorDB Browser](http://localhost:4319). The database remains writable at localhost:6388. [Official MCP setup](workbench/mcp/README.md) connects agents directly. [Calculator and legality adapters](workbench/tools/README.md) reuse existing Champions implementations; [sprite metadata](workbench/SPRITES.md) includes exact form mappings. Experiment graphs use `gk_*`; the catalog is `pokemon_mc_202609`. The [discussion board](workbench/board/README.md) holds plans, alternatives and evidence. [Controlled execution checks](workbench/RUNTHROUGH_CHECK.md) distinguish a legal sequence from a team that wins its intended matchups.

[Written-source intake](research/experiments/WRITTEN_SOURCE_INTAKE.md) provides post-level format/date boundaries and source claims to investigate. [Teambuilding guide analyses](research/experiments/team-guide-signals.md) and [JoeUX9's anti-meta walkthrough](research/experiments/JOEUX9_ANTI_META_GUIDE.md) inform the representation: retain alternatives, intended roles, conditions, and revisions. Historical video examples and usage marginals are evidence to investigate, not current team-win predictions.

The earlier [authored-case workbench](workbench/README.md) and [scripted demo](workbench/DEMO.md) remain available as historical experiments. The user rejected dependency checking as the main product direction. See [the database recovery record](workbench/DB_RECOVERY.md) for the persistence correction and unrecovered prior run history.

## Earlier ingestion experiment

An ingestion experiment for finding uncommon Pokémon cores with FalkorDB. The first result is that five mechanical retrieval queries give identical answers in the graph and in plain JavaScript. Graph storage has not yet demonstrated a discovery advantage.

See [the measured results](research/INGESTION_RESULT.md) and the [experiment log](research/EXPERIMENT_LOG.md). The local working folder is still named `pokemon-core-lab`; its GitHub home is `shivraj-S-bhatti/pokemon-battle-lab`. Earlier [reading](research/reading-list.md), [complexity](research/complexity-notes.md), and [bot-history](research/bot-history.md) notes are preserved. This is separate from Hivemind; the ContextPlane implementation and research remain there.

## Small evidence demo

After the catalog import below, run `npm run demo:plans`. It stores four manually extracted Clawitzer team-plan claims in a separate graph, removes Sceptile in a counterfactual query, and finds candidate replacements for the two lost support roles. The graph result determines which role checks matter. It preserves source links and conditional wording; it does not establish a matchup win rate or a complete replacement team.

The local run found Pikachu and Raichu with Lightning Rod and Upper Hand. Both passed the pinned simulator's partial-set validator. See [the result](research/evidence/plan-demo.json). This is a deterministic development fixture; automated video extraction and an autonomous analysis loop are still unfinished.

## Run locally

Requires Node 22.18+ and Docker Compose. Tested on Node 23.11.0.

```sh
npm ci --ignore-scripts
npm run prepare:data
npm run export:data
docker compose up -d --wait
npm run ingest
npm run experiment
```

FalkorDB listens on localhost port 6388, with persistence in the Compose volume. Stop it with `docker compose stop`; resume with `docker compose start`.

The default graph is `pokemon_mc_202609`. Importing the same dataset twice preserves node and edge counts. Import is an upsert, not a reconciliation that removes old data: use a new `GRAPH_NAME=pokemon_...` for a changed snapshot, and use the same name for the experiment. `GRAPH_URL` can override the local connection.

## Data

| Source | What we keep |
|---|---|
| [Pokémon Showdown, pinned revision](https://github.com/smogon/pokemon-showdown/tree/a833737d8408322c8b1e821dee16af07b1fd9234) | Champions species/forms, moves, abilities, items, stats, types and resolved learnsets |
| [Official regulation roster](https://web-view.app.pokemonchampions.jp/battle/pages/events/rs178955680104qaiodg/en/pokemon.html) | 262 roster entries, including form names |
| [September 2026 Showdown M-C usage, cutoff 1500](https://www.smogon.com/stats/2026-09/chaos/gen9championsvgc2026regmc-1500.json) | Usage, teammates, move/item/ability weights, spread distributions and checks/counters; complete per-species source records retained as JSON |

`prepare:data` downloads and hashes sources into `.cache/` and records provenance in `.artifacts/source-manifest.json`. Existing cache files are reused. The official roster and statistics URLs can change; compare their hashes with `research/evidence/source-manifest.json` when reproducing this run. Downloaded third-party source and data retain their original licenses and attribution. Raw source caches stay outside Git; selected marginal tables and sprite assets are committed with provenance.

```text
Species --LEARNS---------> Move --OF_TYPE--> Type
   |--HAS_ABILITY-------> Ability
   |--OF_TYPE-----------> Type
   ^
   | OBSERVED_FOR
 Usage --IN_SNAPSHOT----> Snapshot
   |--OBSERVED_MOVE-----> Move
   |--OBSERVED_ITEM-----> Item
   |--OBSERVED_ABILITY--> Ability
   |--OBSERVED_TEAMMATE-> Species
```

Source and official roster records are retained separately. Roster membership currently matches national numbers, not exact form identifiers. A sample-set validator gate narrows queries, but does not certify every form, move combination or team. The full catalog includes unavailable entities; query the availability fields rather than assuming every stored record is legal.

Usage weights describe observations, not causal synergy. Missing usage remains unknown. Historical marginals do not reconstruct complete teams or joint sets. Mechanics implemented as simulator callbacks remain source code, not executable causal edges. This import excludes battle replays, an exhaustive set/EV enumeration, damage calculations and battle simulation.

## Files

- `scripts/prepare.mjs`: fetch and transpile pinned simulator data.
- `scripts/export.mjs`: export catalog and dated observations; reject dangling edges and duplicate node IDs.
- `scripts/ingest.mjs`: import into an isolated FalkorDB graph and verify counts.
- `scripts/experiment.mjs`: compare five Cypher queries with indexed JavaScript retrieval, including positive and negative checks.
- `queries/`: readable Cypher produced by the experiment.
- `.artifacts/`: full local dataset and current machine-readable results.

The next experiment should compare candidate generation against a flat-data baseline on withheld mechanical combinations, measuring valid unusual cores, explanations and failure cases. More imported rows alone cannot establish that the graph helps.

## Additional research

- [Bot history and Muse’s October context update](research/bot-history.md).
- [Recovered Claude learning map and strategy reports](research/claude/2026-10-17/README.md).
