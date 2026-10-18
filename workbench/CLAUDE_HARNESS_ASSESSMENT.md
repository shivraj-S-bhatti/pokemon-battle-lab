# Minimal harness: adversarial assessment

Claude, 2026-10-18, for the parent integrating `MINIMAL_HARNESS.md` (designed by the persistent Codex collaborator; not edited here). The requirements below were written before the proposal landed; the last section checks the proposal against them. Scope of the user's direction: a minimal harness in which agents build and revise team theories with deterministic revision history and evidence replay. Creative reasoning is not guaranteed by any of this; the harness only makes what an agent claimed, and why, reproducible and checkable.

## What "deterministic" can honestly cover

| Covered | Not covered |
|---|---|
| Rebuilding the same theory state from the same revision log | The agent producing the same theory twice |
| Rerunning a native calculator row or an engine trace and getting the same output, with pinned revisions and seeds | That a checked threshold or trace means the team wins |
| Showing which evidence each claim rests on | Source text extraction by a model (store its output and inputs; do not call it deterministic) |

Anything that says more than the left column should be cut from the proposal's wording.

## Minimum requirements

Each item names the failure it prevents. If the proposal drops one, that failure returns.

1. **Files are the source of truth; FalkorDB is a rebuilt projection.** Theories, sources and check results live as versioned files in git; the graph is rebuilt from them by a guarded loader (as `workbench/board/load-gk-board.mjs` does for `gk_board` only). Prevents: graph edits that cannot be replayed, and a rebuild that wipes another graph.
2. **Append-only revisions.** Each revision records parent revision, author (named agent or user), time, the change, and the reason. Nothing is overwritten; a superseded claim keeps its history (as the parent did for E3's `THREATENS` edges). Prevents: an earlier option and a later choice appearing as simultaneous facts (the JoeUX9 Kingambit revisions).
3. **Sets are first-class and plans reference set IDs, with alternate sets allowed.** A plan should point at "Gholdengo, Timid 32 Spe" and "Gholdengo, Choice Scarf" as distinct sets, not at the species. Prevents: the Memento timing error, which was true for one spread and false for the Scarf set. **Current gap:** `gk_board` plans reference species; the sets live only inside check inputs. The minimal schema should fix this, not the board.
4. **Evidence kinds stay distinct, without a certification ladder.** A source claim is its own kind of evidence, attributed to a written source with a locator; it is not promoted into a checked mechanic. Calculator, legality and engine results are separate receipts with their scope. A hypothesis is an agent or user proposal. Prevents: a creator's spoken claim or a model extraction reading as a verified mechanic, and a verified result being read as proof of the source's broader claim. (Revised 2026-10-18 after the parent clarified source claims are independent evidence.)
5. **Every check stores its full inputs and scope.** Calculator: attacker and defender sets, boosts, field, move, calculator revision, the native `kochance`/`fullDesc` untouched, and a row locator. Engine trace: both teams, the choice script for both sides (including opponent choices), seed, engine revision, events. Prevents: "survives at +6" being read as "survives setup" when the trace had the opponent Protect every turn.
6. **Costs and concessions are separate fields with separate owners.** Costs are what our side pays (a donor fainting, an item, turns, a lost ability), and can be filled by agents. Concessions are opposing matchups the user chooses to give up; default `undecided`; only the user sets them. Prevents: an agent quietly deciding which matchups don't matter.
7. **Targets, conditions and dealbreakers are named before checks are requested.** A check request names the plan and the decision it could change. Prevents: drifting back into whole-field matrices (E3) and calculating everything.
8. **No universal score field.** Verdicts are text with the deciding check attached. An ordering scoped to named targets is allowed when labeled a heuristic in place (E7's turn denominator now is). Prevents: a ranking being read as measured efficiency.
9. **Written-source intake keeps locators, not full texts.** Source record: URL or path, section or quote span, retrieval time, content hash, author, date, format and regulation it applies to. Extracted claims stay `source_claim` until checked. Prevents: stale or out-of-format advice leaking in, and copyright problems from storing whole compendia.
10. **One replay command.** Re-derives every stored check from its inputs and reports differences, and rebuilds the graph from files. This is the harness's own check; it is not a test suite (Shivraj adds tests at the end of a cycle).

## Keep

- Native FalkorDB Browser and the sprite hydration (`scripts/experiment-sprites.mjs`), for the human view.
- `workbench/tools/` calculator and legality adapters, and the engine trace runner pattern in `workbench/runthrough/check.cjs`, generalized to fixtures.
- `scripts/graph.mjs` (guarded list, query, reset) and `scripts/db.mjs`.
- `data/meta-sets.json`, labeled constructed candidates with no joint probability, as a default set source that a plan can override.
- `gk_board`'s shape as the human-facing projection, once plans reference sets (requirement 3).

## Park

| Component | Why it can wait |
|---|---|
| `workbench/public/` UI, `backend/` server, `UI_CONTRACT.md`, `UI_PROGRESS.md`, frontend docs | The user wants an agent harness plus the native Browser. My workbench UI is not needed for that. |
| `workbench/logic/` authored dependency engine and `cases.mjs` adapters | Three hard-coded cases; route truth is authored, not derived. Theories with conditions and checks replace it. |
| `workbench/mcp/` (47 MB with node_modules) | Agents can read and write through files and `scripts/graph.mjs`. Keep the setup notes; install on demand. |
| `gk_meta`, `gk_chain` and their loaders in `.artifacts/` | Exploration generators, not harness state. They can propose hypotheses into the harness later. E3's edges are superseded. |
| E1 to E7 rankings | Inputs to hypotheses only. E1 exposure is species-level; E2 effect sizes are heuristic; E7 verdicts hold for selected sets and targets. |
| Video extraction | Parked by direction; written sources only. |
| Canvas | Untouched; not part of the harness. |

## Questions the proposal should answer

1. Where do revisions live: one file per theory with an embedded log, or a log directory? Either works if replay is defined over it.
2. How does an agent's revision get accepted: written directly, or proposed and accepted by the user? Concessions at least need the user.
3. What identifies a set across revisions: a content hash of the set, or an assigned ID with a hash recorded?
4. How are source claims extracted from written sources: by hand, or by a model with its prompt and output stored? If by a model, which status does an unreviewed extraction get?
5. Which engine trace fixtures are reusable templates (cooperative Protect, Fake Out lead, redirection), so traces are not hand-built per plan?

## Where my own work stands against this

- `gk_board` meets 1, 5, 6, 7 and 8. It partially meets 2 (history is kept by status, not a revision log) and 4 (it has no `source_claim` or `legality_checked` status yet). It fails 3.
- E1 to E7 write-ups are exploration records. They should be cited as sources of hypotheses, not imported as checked facts.

## Against `MINIMAL_HARNESS.md` as written

The proposal covers requirements 1, 2, 5, 6, 7 and 10 well: files as truth, immutable revisions with heads and command IDs, receipts with resolved inputs and pins, costs separate from concessions with `undecided` allowed, checks tied to claims, and replay without rerunning tools. Its staleness rules are the strongest part. What I would push on:

1. **Full-document replacement can drop things silently.** `revise` takes a complete replacement document. An agent that rewrites the document can omit an alternative, a cost or a counterplay entry without saying so; history keeps it, but the current theory loses it. The `revise` result should list every claim, alternative, cost and concession removed, and the reason field should have to address each removal.
2. **Concessions need an owner rule.** The proposal allows "accepted concessions or explicitly `undecided`" but does not say who may change them. Make `revise` reject a concession change whose author is not the user, or mark it `proposed` until the user accepts it.
3. **Unreviewed model extractions need their own label.** Source-derived claims carry the source hash and extraction revision, but a model extraction nobody has read should be distinguishable from a human-confirmed quote, since today's guide extractions already produced wrong creators, mixed stat units and invented formats.
4. **No universal score, stated as a rule.** Scoped heuristic orderings are fine when labeled as such; a team-wide or cross-target score should not appear in the theory schema. E7's denominator is the precedent.
5. **Team-level validation is decision-changing now, not later.** The one-Mega rule decided the Audino chain today. Calling the existing upstream `TeamValidator.validateTeam` as a fourth checker is small and prevents theories that are individually legal but impossible together.
6. **A check request should name the decision it could change.** `check` takes a claim ID; adding a short "would change" field (for example "keep or drop Scarf") keeps agents from drifting back into calculating everything, which is the failure the user keeps correcting.
7. **Sets need stable identity across revisions.** The stale rule depends on "a changed referenced set". Give each set a local ID plus a content hash, so an alternate set (Scarf vs Timid Gholdengo) is a separate reference rather than an edit to one.

Nothing here argues for more components. Each item is a field or a validation rule inside the proposed `theory.mjs`.

## Review plan for the first `theory.mjs` loop

Not yet run: on `819a0b1` neither `workbench/theory.mjs` nor `data/theories/memento-staraptor/` exists. When they land I will run these probes against the module through its CLI only, on scratch copies, and record results here. Bounded to the first useful loop (`r0 → r1`, one damage check, two imported ordering receipts).

**Claim versus result**
1. Does a completed `damage` receipt display as "the calculation completed for these inputs", with the native `kochance`/`fullDesc` text intact, and never as the claim being true? Probe: a claim "+2 lets Staraptor OHKO Garchomp" checked with inputs where the native result is a 2HKO. The receipt should be `completed` and the claim unsupported by it.
2. Do imported runthrough receipts keep their original origin (fixture, script hash, engine pin) rather than appearing as newly executed?
3. Is the unscarfed `memento-ally` trace shown as contradicting the same-turn claim, and only that claim, while its later +2 observation stays usable?

**References changing**
4. Change the Garchomp target set (for example a bulkier spread) in a new revision. The existing damage receipt should go stale for the claim; the old receipt stays valid for its revision.
5. Change only prose, or rename a set's display label while keeping identical resolved inputs. The receipt should stay current. Change a single stat point in the referenced set: it should go stale.
6. Add Choice Scarf to Gholdengo as an alternative set (r1). The unscarfed ordering receipt must not certify the Scarf claim, and the Scarf fixture receipt must not certify the unscarfed one.

**Runtime pins**
7. Does each receipt record the calculator bundle revision and hash, adapter code hash, engine revision, format, and for traces the seed and both sides' choices?
8. Simulate a changed adapter hash (on a scratch copy of the receipt, not the tracked file). Replay should report the pin mismatch and keep history; re-execution, if attempted, should record a new outcome rather than overwrite.

**Stale after edits**
9. Change the goal or a concession from `undecided` to a chosen matchup. The damage number should stay current for its inputs while the decision rationale is flagged stale.
10. Revise with a document that omits an alternative or a cost. Does the result report the removal (my gap 1), or does it vanish silently from the current theory?
11. Repeat a command ID with the same payload (should return the prior receipt) and with a different payload (should conflict).
12. Revise with a stale expected head (should refuse, previous head intact).

Each probe gets one line in the findings: input, observed output, expected output, and whether it is a correctness bug, a scope question, or acceptable.

## Bounded review of `theory.mjs` and the Memento fixture (2026-10-18, against final `MINIMAL_HARNESS.md`)

Read-only. Ran `node workbench/theory.mjs read data/theories/memento-staraptor/theory.json` and compared the two receipts with the theory's sets. Final design: Git history, any theory edit stales every prior receipt, no revise/head/command-ID API. Judged against that, not against my earlier proposals.

Holds up:
- **Claim versus result.** `read` ends with "Receipt integrity and freshness only; no claim, matchup, or team is certified." Receipts store `claimId`, `question`, `decision`, the full calculator input and `outcome: completed`; nothing marks the claim true.
- **Runtime pins.** Calculator revision and bundle hash (checked against its manifest), engine declared revision plus a hash of 387 dist files, adapter file hashes and the dependency lock hash are in every receipt; a mismatch reports `runtime_changed`.
- **Stale after edits.** After the Scarf revision, the earlier Garchomp receipt (`935d0476`) reads `stale: theory_or_reference_changed` and the receipt rerun on the revised theory (`b48b9be6`) reads `current`. Corrected: an earlier version of this note said both were stale. Imported execution evidence keeps `origin: imported_existing`.
- **Alternate sets.** `staraptor-opening` (base form, Intimidate) and `staraptor-damage` (Mega, Contrary) are separate set IDs, and `concessions.status` is `undecided`.

Worth fixing or deciding:
1. **Check inputs are not tied to set IDs.** The request inlines attacker and defender sets. Today both receipts match `staraptor-damage` and `garchomp-candidate` exactly, but nothing enforces it; a request could check a different Garchomp than the target names. Either accept `{setRef:"garchomp-candidate"}` and resolve it, or record which theory set IDs the inlined sets equal (null if none).
2. **`claims[].interpretation` is hand-written.** "Contradicted for the tested opening" is the author's reading of an imported trace. Fine as prose; label it as the author's interpretation in `read` so it is not mistaken for a derived status.
3. **`theory.mjs` hashes itself into the runtime pin.** Any edit to the runner, including a comment, makes every receipt `runtime_changed`. Conservative and consistent with the design; if it becomes noisy, pin the runner separately and report its change as `unverifiable` rather than `stale`.
4. **Every prose edit stales the numbers.** By design. The cost is one cheap rerun of unchanged calculator inputs; worth one sentence in the README so a reader does not read "stale" as "wrong".

No correctness bug found in the bounded loop.
