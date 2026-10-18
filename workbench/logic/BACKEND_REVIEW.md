# Backend graph/evaluator review

Reviewed milestone `00504b9` on October 18, 2026. Scope: read-only inspection of `workbench/backend/store.mjs` and `server.mjs`, live GET requests, and in-memory probes using the actual exported backend classes/functions. No backend, frontend, case data, or persistent graph was changed.

Reviewed SHA-256: `store.mjs` = `5ab555136336cada19db1a00222e29a8d463b36c104705fed2944792f45af3c2`; `server.mjs` = `be5e95618329eed7a4f0829d22319c0b7a52112f4bc3ab3bafa92ab975155716`.

Disposition: the graph genuinely supplies route expressions to the evaluator, and the candidate-order correction is present. The findings below prevent treating the current graph view and exported run context as a fully coherent, version-bound explanation. Prioritize B1 for the demo and B2/B3 before concurrent refresh or agent reuse.

## B1 · P1 · Source-plan outcomes become unconditional outcomes of alternative goals

**Location:** `store.mjs:91` and `store.mjs:103`.

`viewGraph()` selects the source plan through `goal.sourcePlanId`, then copies that source plan's entire `outcomes` list into goal→YIELDS edges. It does not use the outcomes of the actual alternative route. This is an observed mismatch in the running server, not just a possible future case.

Read-only reproduction: fetch the Simple Beam case's context and graph. Locally evaluate the fetched model after replacing Torterra's Earthquake with Headlong Rush and explicitly assuming the targeted route's legality and action checks. These assumptions are only a probe of the projection; no battle outcome is asserted.

Observed:

```text
goal: purpose:ground-without-friendly-fire
enabled route: purpose:ground-without-friendly-fire:targeted
route outcome: Single-target Ground pressure avoids allied Earthquake damage.
displayed goal outcome: Torterra can use Earthquake without damaging that immune ally
```

The evaluated set no longer has Earthquake. The same projection copies amplified Shell Smash outcomes into `purpose:boost-torterra`, even when ordinary Shell Smash or Decorate is the available route. It also undermines the separation between amplification and White Herb's defense clearing.

**Repair:** expose route→YIELDS edges from `route.outcomes`, preserving their requirements and goal relationship. If practitioner outcomes are retained at the plan level, label them as source claims instead of guarantees of every alternative. The model already contains the needed route-specific outcomes; no new mechanics inference is necessary.

## B2 · P1 · A single load can mix two published model versions

**Location:** `store.mjs:53`, `store.mjs:59`, and `store.mjs:68`.

`load()` reads components and header from the active scope, then reads the active scope again for expression retrieval and a third time for route-root lookup. A new seed publishes the case pointer at `store.mjs:48`. If that pointer changes between awaits, the header, conditions, snapshot and route metadata can come from one revision while executable expressions come from another, or all expressions can become empty if the root lookup uses a third scope.

An in-memory `GraphStore.q` probe simulated exactly that publication boundary without touching the database:

```text
first component read: version A, snapshot-A, route requires member a
later activeScope reads: version B, route requires member b
returned version: A
returned snapshot: snapshot-A
returned executable requirement: all(member b)
selection: member a only
evaluated truth: false (version A's actual route would pass)
```

**Repair:** return `m.key` with the first component read and use that captured scope for every subsequent query and route key in this load. Do not reread the active pointer. The returned version, snapshot and expression must describe one immutable scope. Apply the same captured-scope principle to `neighborhood()`, which currently mixes multiple active-scope lookups.

## B3 · P1 · Context combines a current model with an old run while hiding the run's revision

**Location:** `store.mjs:48`, `store.mjs:79–81`, and `server.mjs:40–43`.

Seeding a new case version leaves the case's `latestRun` pointer intact. Runs retain their evaluated `result.graph.revision`, but the compact context response drops that field. `/api/context` therefore pairs the current model/version with a potentially older result and offers no revision comparison or stale marker. Snapshot ID alone cannot catch a rules-model change within the same metagame snapshot.

A GET-only probe through the real `createWorkbench()` handler, with in-memory store responses, returned:

```text
current context graphRevision: new-model-revision
stored run graph revision: old-run-revision
exported run graph revision: absent
run marked stale: absent
snapshot IDs: identical
```

**Repair:** preserve the run's graph name/revision in the compact result and mark whether it matches the current model. Keep an older run as historical evidence, not the current scenario result. The analyze endpoint should also accept an expected graph revision and reject a mismatch or explicitly require rechecking; it currently always evaluates the latest scope, even if the user's graph and assumptions came from an older revision.

The scope publication fix in B2 does not solve this cross-request boundary. Both are needed for agent context that can be trusted across updates.

## B4 · P2 · The import version omits the top-level engine revision stored in its header

**Location:** `store.mjs:16`, `store.mjs:18`, and `store.mjs:30`.

The import hash includes the model, records, sources, species and snapshots, but not `bank.engineRevision`. The header separately stores that value. Changing only the top-level engine revision yields the same version and hits the early skip, leaving the old header metadata. A pure hash-input probe confirmed this collision between two distinct engine-revision declarations.

**Repair:** include `bank.engineRevision` in the version input and validate that it agrees with source/set provenance. Typical coordinated source updates may already alter other hashed fields, but that convention is not enforced by this boundary. Also distinguish this import/model version from the evaluator code revision; the current graph version alone does not identify which logic implementation produced a run.

## B5 · P2 · Shared conditions are assigned to one arbitrary owning plan in the graph view

**Location:** `store.mjs:86` and `store.mjs:97`.

The condition node is deduplicated by its global ID, while `planId` is assigned from whichever goal encounters it first. All REQUIRES edges survive, but the single `planId` is misleading. The existing UI uses that field for selection and collected agent context.

Observed in the live graph:

```text
condition: move:torterra:shellsmash
node.planId: beam-smash
actual requiring goals:
  beam-smash
  purpose:restore-smash-defenses
  purpose:boost-torterra
```

**Repair:** expose `planIds` / `routeIds`, or derive ownership from edges rather than a scalar field. Keep the condition's stable ID shared; duplicating facts merely to satisfy a single-owner UI would hide the actual dependency structure.

## What is coherent in this milestone

- `server.mjs:35` calls `analyzeModel(bundle.model, options)`. It does not rebuild the case adapter during evaluation.
- `HAS_EXPRESSION` / ordered `ARG` edges reconstruct executable route expressions in `store.mjs:59–69`. Unknown operators and expression cycles decode conservatively rather than executing arbitrary text.
- Entity ordinals are persisted and read in order. The prior candidate-order concern is addressed in source and covered by the milestone's roundtrip test.
- Each imported case retains its own snapshot, format, sources and old versioned scope. Usage does not become a win score or route prerequisite.
- Catalog results are explicitly described as retrieval candidates, not legal/effective sets. The catalog endpoint still uses the fixed `pokemon_mc_202609` graph and returns no catalog revision metadata; include that provenance before results from a future rules revision are combined with case evidence.
- The logic rejects attempted overrides of computed facts and keeps actual battle-state checks conditional. This review did not find a backend path that promotes an invalid override into a computed truth.

## Verification boundary and delivery

The parent reports 47 passing milestone tests: 41 reasoning tests and six backend tests. This review inspected those backend tests but did not rerun their write/delete fixtures against FalkorDB. The probes above used live GET requests or isolated in-memory responses; zero POST analysis runs, seed operations, or graph mutations were made by this reviewer.

Review artifact delivery: local, uncommitted on top of `00504b9`. This file does not claim backend fixes or final demo sign-off. The backend owner should add focused regressions for B1–B4 when making the corresponding fixes.
