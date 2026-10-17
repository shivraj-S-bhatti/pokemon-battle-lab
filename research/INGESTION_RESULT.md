# Initial ingestion: retrieval works; discovery remains untested

Observed October 16, 2026, New York time. Raw timestamps use October 17 UTC.

We imported **3,877 nodes and 151,201 relationships** into a local FalkorDB instance. Repeating the import preserved both counts. Export validation found zero dangling edges and zero duplicate node identifiers after repairing Hidden Power variant identifiers. Sources and exact counts are saved in [the evidence directory](evidence/).

The catalog contains 1,417 species/form records, 954 moves, 321 abilities, 584 items and 19 types. These include unavailable entries. There are 262 official roster records and 316 species usage records from a September M-C snapshot reporting 1,631,943 battles. A community simulator accepted minimal sample sets for 382 species/form records; this is not a count of distinct legal roster slots.

| Retrieval question | Results | Graph/plain-data agreement |
|---|---:|---|
| Who learns Simple Beam? | 4 | Exact |
| Who learns Shell Smash? | 8 | Exact |
| Who learns both Body Press and Ice Beam? | 33 | Exact |
| Who combines Intimidate with Glare? | 1 | Exact |
| Which Simple Beam / Shell Smash pairs have each member below 1% observed usage? | 12 | Exact |

These queries operate on sample-validated species/forms. Positive checks recover Farfetch’d, Torterra, Swalot and Arbok in their respective queries. A negative check excludes Farfetch’d from Shell Smash users. Each query ran five measured repetitions after warmup. See [machine-readable answers](evidence/experiment.json) and [the comparison code](../scripts/experiment.mjs).

The raw pair query includes Farfetch’d + Torterra, but also Audino-Mega + Barbaracle-Mega. The latter cannot be realized as two simultaneously Mega-evolved partners. This exposes a concrete missing constraint: individually available moves and low usage do not establish an executable combination. The queries also cannot establish novelty or competitive viability.

Graph median query times ranged from 4.50 to 58.75 ms; JavaScript medians ranged from 0.23 to 0.50 ms. JavaScript used prebuilt in-memory indexes; graph measurements include a local network round trip. These timings describe this implementation and cannot support a general database speed claim.

## What the experiment established

The ingestion path is usable and mechanical questions can be expressed as graph traversals. All five questions also have small, exact JavaScript implementations. This experiment provides no evidence that a graph improves discovery quality. Both implementations share the same exporter, so agreement cannot detect an extraction mistake shared by both paths.

The import preserved raw aggregate records while omitting 303 empty-move and 233 no-item sentinels from relationship creation. No unknown references remained. Usage is a historical Showdown sample, not live Champions ladder telemetry. Set spreads and teammates are marginals, not jointly observed complete sets or teams.

## Next experiment

Freeze a small set of known combinations and counterexamples before writing discovery rules. Include ordering requirements, ability replacement restrictions, incompatible forms, and a partner that makes the sequence fail. Hide some combinations from rule development.

Compare graph-based generation with the same mechanics stored in ordinary tables/maps. Measure recovery of withheld combinations, invalid-candidate rate and the work needed to add a new mechanic. Validate full sets and action sequences separately. Only then test competitive usefulness against specified opponents. This separates a useful graph representation from a catalog that merely happens to live in a graph database.
