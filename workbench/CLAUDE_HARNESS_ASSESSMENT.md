# Minimal harness: adversarial assessment

Claude, 2026-10-18, for the parent integrating `MINIMAL_HARNESS.md` (designed by the persistent Codex collaborator; not edited here, and not yet present when this was written). Scope of the user's direction: a minimal harness in which agents build and revise team theories with deterministic revision history and evidence replay. Creative reasoning is not guaranteed by any of this; the harness only makes what an agent claimed, and why, reproducible and checkable.

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
4. **Five evidence statuses, never merged:** `source_claim` (attributed to a written source with locator), `hypothesis` (agent or user proposal), `legality_checked` (validator row), `native_checked` (calculator row), `engine_checked` (execution trace). A claim moves between statuses only through a check record. Prevents: a creator's spoken claim or a model extraction reading as a verified mechanic.
5. **Every check stores its full inputs and scope.** Calculator: attacker and defender sets, boosts, field, move, calculator revision, the native `kochance`/`fullDesc` untouched, and a row locator. Engine trace: both teams, the choice script for both sides (including opponent choices), seed, engine revision, events. Prevents: "survives at +6" being read as "survives setup" when the trace had the opponent Protect every turn.
6. **Costs and concessions are separate fields with separate owners.** Costs are what our side pays (a donor fainting, an item, turns, a lost ability), and can be filled by agents. Concessions are opposing matchups the user chooses to give up; default `undecided`; only the user sets them. Prevents: an agent quietly deciding which matchups don't matter.
7. **Targets, conditions and dealbreakers are named before checks are requested.** A check request names the plan and the decision it could change. Prevents: drifting back into whole-field matrices (E3) and calculating everything.
8. **No score field.** Verdicts are text with the deciding check attached. If an ordering is needed for reading, it is labeled a heuristic in place (E7's turn denominator now is). Prevents: a ranking being read as measured efficiency.
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
