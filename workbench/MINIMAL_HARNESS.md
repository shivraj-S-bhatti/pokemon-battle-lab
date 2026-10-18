# Minimal theory harness

**Start with Git-versioned `theory.json`, immutable check receipts, one assigned writer per theory, and one small script.** Git already supplies history, diffs, and recovery. The missing module should resolve exact check inputs and identify stale evidence. It should not become another coordination engine.

Agents generate ideas and propose revisions. Determinism covers reading the same recorded state and evidence again. Re-running a pinned calculator or seeded engine fixture is a separate operation; re-running an external model or service is not guaranteed to reproduce its output. No implementation is included in this proposal.

## The first loop

Proposed files:

```text
data/theories/memento-staraptor/
  theory.json
  checks/<receipt-hash>.json
workbench/theory.mjs
```

`theory.json` is an ordinary editable document. Its Git commit records a revision and the reason for the change. Each receipt is a new immutable JSON file containing its resolved request, pins, output, and originating theory fingerprint. Keep small selected evidence versionable. Large raw logs can remain in scratch when a committed fixture and pins reproduce them; scratch must not be the only source of a current claim.

One assigned agent edits this theory at a time. Other agents submit proposals through the existing collaboration workflow. Checkpoint coherent revisions with normal scoped Git commits. Use Git diffs to inspect removed alternatives, changed costs, and revised concessions. No per-theory lock, head-pointer file, append-only event log, command ID, automatic merge, or automatic commit is needed for this baseline.

The proposed module has three small operations:

| Operation | Input | Output |
| --- | --- | --- |
| `fingerprint` | Theory file and its referenced input files | Stable SHA-256 of canonical JSON, resolved sets/source references, and selected tool pins. |
| `read` | Theory file and stored receipts | Theory, evidence kinds, current/stale receipts, and open questions. It does not rerun checks. |
| `check` | Theory file, claim ID, question, decision the result could change, named checker, exact inputs | One new receipt; failed/unsupported results are recorded explicitly. It does not edit the theory or decide the team is good. |

Example proposed invocation:

```sh
node workbench/theory.mjs read data/theories/memento-staraptor/theory.json
node workbench/theory.mjs check data/theories/memento-staraptor/theory.json < selected-check.json
```

The first implemented checker should only wrap existing `calculateRow`. Existing legality and execution tools remain directly usable; their receipts can be imported with their original origin and pins. Add wrappers when a live theory needs them. A full-team check should call upstream `TeamValidator.validateTeam`; valid individual sets alone do not establish team or turn legality.

## Just enough theory structure

Keep the document mostly prose with stable local IDs. It needs the purpose, exact format, selected opposing matchups, proposed mechanisms, alternative plans, costs, counterplay, open questions, and source references. Concessions are opposing matchups the user accepts losing or leaves outside the goal; default to `undecided`. Agents can propose them, but acceptance needs a pointer to the user's decision. Other authorized theory edits need no new approval stage.

Give each set a local ID and content hash. For example, `gholdengo-fast` and `gholdengo-scarf` are distinct alternatives. Plans reference those sets, not just the species name. A role or mode can be a tag with explanatory text; no exhaustive ontology is required.

Evidence kinds are independent attachments. One claim can have a source report, a legality receipt, a calculator result, and an engine trace at once. Preserve the original attributed source claim unchanged and attach separate checks to the theory's interpretation of it. Evidence does not move through a ladder from “source claim” to “mechanics truth.” A native calculator success establishes a calculation for supplied conditions; it does not certify the accompanying prose or establish a matchup win.

Ranking is allowed. A heuristic score must state its selected targets, formula or judgment rule, assumptions, and cost units. Keep battle turns, partner actions, item costs, and sacrifices distinguishable. The score is a local investigation priority, not a universal team-strength measure.

## Receipts and stale evidence

A receipt stores:

- The theory fingerprint, claim/question, and decision it was intended to inform.
- Exact resolved input: selected sets, format, move, boosts, field, and current HP for damage; both teams, choices, seed, and fixture identity for execution.
- Adapter/code hash and calculator/engine pin with available verified build hash; any source snapshot/extraction hashes used by the claim.
- Original output or a versioned output reference/hash, preserving native KO descriptions and approximation wording; execution scope and opponent choices remain visible.

Compute the fingerprint from stable content, excluding receipt files themselves and volatile timestamps. **Any theory edit makes its prior receipts stale for the new theory.** Adding a receipt does not edit `theory.json` and does not invalidate other receipts. A referenced input or active tool-pin change also makes affected historical receipts stale. Preserve every old result; “stale” means it no longer automatically supports the current document.

This deliberately over-invalidates. Even a changed explanation may require a selected recheck. That is preferable to implementing dependency inference before one useful loop exists. If repeat work later becomes costly, add explicit reuse for identical input/pin/scope combinations. Do not build a dependency DAG now.

Replaying history means reading the theory and receipts at a chosen Git commit. It uses recorded model extractions and results without calling models or external services again. Re-execution is explicit and selected: rerun one decision-changing check on demand, retain the new receipt, and compare it with the old one. Do not automatically replay every calculation or rebuild every graph whenever prose changes.

## Worked revision: Memento → Scarf

Use the committed execution fixtures and selected native checks already available.

1. **Initial theory.** Proposed goal: +2 Attack before Mega Staraptor's first attack. Candidate target: the selected Garchomp set. Concessions: undecided. Preserve an alternative that waits for a later boosted attack. Import `workbench/runthrough/summary.json` branch `memento-ally` with its fixture and provenance references. It records Brave Bird before Memento for the tested spreads, contradicting this same-turn goal while confirming the later boost.
2. **Revise the document.** Add `gholdengo-scarf` and the corresponding opening as an alternative. Record the item cost and donor's faint. Keep the unscarfed option and its observed ordering. Commit the revision with that reason. All previous receipts now display as historical/stale for the changed document.
3. **Attach the relevant execution evidence.** The existing `scarf-memento-before-attack` branch records Memento and both boosts before Brave Bird. Import it as previously executed fixture evidence with its original inputs and pin; do not claim a fresh simulation. It establishes this controlled ordering, not an opposing-lead win.
4. **Check only the remaining decision.** If the selected Garchomp threshold matters to the user's goals, call the existing calculator for that input. A different defender spread requires a new receipt. If Garchomp becomes an accepted bad matchup, the old number remains historical but no longer justifies Scarf by itself. Follow Me remains counterplay; transferring the unscarfed redirection fixture to the Scarf branch remains an inference until separately executed.

The result is a revisable theory with a retained alternative and a concrete next question. It does not automatically recommend Scarf or sacrifice Gholdengo for every matchup.

## Cheap written-source intake

Use the parent's [written-source inventory](../research/experiments/WRITTEN_SOURCE_INTAKE.md). It already distinguishes accessible sources, blocked pages, format/date limits, and population biases for the supplied VGC Guide, Smogon, Pokémon Zone, and ShowdownTier material. Do not create a second crawler or inventory.

Take a short relevant passage or paraphrase with URL, post/section locator, author/date when available, retrieval time, and content hash. Record whether the extraction was read by a human or remains an unreviewed model extraction. For model extraction, preserve the prompt, model identifier, input snapshot/span reference, and output. Reuse that extraction until its inputs change. Full-thread repeated model passes are unnecessary.

| Reading label | Meaning |
| --- | --- |
| Role | A job performed by a particular set in this plan, such as speed control. |
| Core | Cooperating members whose interaction shapes the team. |
| Mode | A subgroup providing an alternative way to play; a battle-mode description may specify leads, back Pokémon, opening order, and targets. |
| Archetype | A broader family of teams with related goals and play. A shared type pattern alone does not establish it. |

Treat these as retrieval labels, not required node classes. Keep an author's opinion, a statistical co-occurrence, and a mechanically executed interaction distinct. Conflicting reports retain separate attribution. Applying an older or BSS claim to current doubles creates a new hypothesis. A claimed weak matchup does not silently become the user's accepted concession.

## Graphs and agent entry points

Keep the installed, user-requested MCP connection. It is an optional entry point alongside files, CLIs, and direct graph tools; no uninstall or reinstall is proposed. Agents may continue writing exploration/scratch graphs. Capture a useful finding in the revision files when it becomes persistent theory state. A scratch graph edit alone is not a theory revision.

The human `gk_board` is a generated symbolic projection of plans, targets, alternatives, costs, counterplay, and evidence. It links to set/claim/receipt IDs. Runtime storage and agent execution traces stay separate. Continue using the native Browser and existing loader; adapting the projection is a later small change coordinated with Claude. A rebuild must target only the designated human projection, never erase exploration graphs.

## Exact path decisions

“Retire” here means freeze and retain the working historical demo and its evidence.

| Paths | Decision |
| --- | --- |
| `workbench/tools/calculator.mjs`, `damage.mjs`, `prepare-calculator.mjs`, `batch-io.mjs` | Keep native calculator calls, strict inputs, and pinned bundle verification. No new damage or KO implementation. |
| `workbench/tools/champions-engine.mjs`, `set-legality.mjs` | Keep exact-format individual-set validation. Its result must retain that limited scope. A future full-team check should call the same upstream `TeamValidator.validateTeam`. |
| `workbench/runthrough/check.cjs`, `verify-provenance.mjs`, `summary.json`, `provenance.json` | Keep as registered execution fixtures and portable evidence. Their evidence covers the specified choices and controlled opponents. |
| `scripts/prepare.mjs`, `export.mjs`, `ingest.mjs`, `db.mjs`; `data/meta-sets.json` | Keep source preparation, catalog access, and candidate retrieval. Pin selected query results and sets when a theory uses them; a live graph name alone is insufficient provenance. |
| `workbench/mcp/`, `workbench/native-browser/`, `compose.yaml` | Keep existing graph tools and human inspection. No second graph server, MCP server, or UI. |
| `workbench/logic/cases.mjs`, `engine.mjs`, `index.mjs`, `mechanics.mjs`; `data/workbench-cases.json` | Retire as discovery prerequisites. Their authored conditions and bounded repair pools answer questions about supplied cases; extending them per new idea recreates the drift. Keep their current callers and historical checks intact. |
| `workbench/agent.mjs` | Retain its case commands for the old demo. Replace it as the discovery entry point with proposed `workbench/theory.mjs`; do not route new theories through `/api/analyze`. |
| `workbench/backend/store.mjs`, `server.mjs`; `workbench/public/`; `workbench/demo.mjs` | Freeze the case application for this increment. Reuse its revision-conflict and immutable-run ideas; leave its case-expression reconstruction with the old demo. No new HTTP endpoint is required initially. |
| `workbench/board/board.json`, `load-gk-board.mjs` | Keep the current board as a migration fixture. Replace hand-maintained claim/check statuses with a projection from theory state, then adapt the existing loader to that projection. Coordinate these later changes with Claude. |
| `workbench/board/checks/staraptor-memento.mjs` and its JSON | Keep the selected checks as evidence; replace manual copies of their results/statuses with harness receipts. Preserve original inputs and descriptions. |
| `research/experiments/E1-meta-holes.md` through `E7-gimmick-outcomes.md`, and existing `gk_*` graphs | Keep as retrieval and hypothesis sources. Preserve superseded E3 lineage. Their ranks and summaries do not become accepted theory conclusions automatically. |

## Deferred option: a coordination store

The earlier design becomes justified only if multiple agents must write the same theory concurrently, Git checkpoints cannot supply the required recovery behavior, or runs need durable orchestration across process failures. None of those needs has been demonstrated for this first loop.

That option retains three record shapes: a theory document, immutable parent-linked revision events, and check receipts. It would add `revise(expectedHead, commandId, completeDocument, reason)`, a storage head distinct from the theory-document revision, a per-theory writer lock, immutable content-hashed objects, and atomic publication of the head after writing the objects. Duplicate command IDs would return the prior result only for the same payload; conflicting payloads or heads would require a reread. Full-document revision results would list removed claims/alternatives/costs so deletions stay reviewable.

Checks would capture a revision before running outside the lock and attach results to that revision afterward, even if the current document had advanced. Replay would reduce the recorded events without network calls. Tool-input fingerprints and conservative staleness would still apply. Selective invalidation or receipt reattachment could follow only after their value is demonstrated. This design remains available; it is not the recommended first increment.

## Next smallest implementation

**First operation: `fingerprint/read` in `workbench/theory.mjs`, plus one Git-versioned `data/theories/memento-staraptor/theory.json` and imported fixture receipts.** Make it show the initial theory, the Scarf revision, and stale evidence after an edit. Then add one `check` operation that delegates directly to `calculateRow` and saves an immutable receipt. No new battle simulation is necessary for this example.

Leave source crawling, automatic search loops, a storage coordination engine, dependency-DAG evaluation, new UI, exhaustive matchups, and automatic check replay outside this increment. Preserve the canvas, Claude's files, installed MCP, and existing exploratory work. This pass delivers only the proposal; the parent owns the next implementation handoff.
