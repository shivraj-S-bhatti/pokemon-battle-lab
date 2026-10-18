# Clean-install verification, 18 October 2026

A tracked archive of `eef48f0`, with the catalog fix applied, passed the workbench tests and demo against a fresh disposable FalkorDB instance. No downloaded engine checkout, dataset export or imported Pokémon catalog was present.

- Dependencies: `npm ci --ignore-scripts`, 10 packages installed, zero reported vulnerabilities.
- Database image: `falkordb/falkordb@sha256:b0bdcac2cbaff989e77cb0610439b7a9289e86de033ccbbd4368b66fb680ae7a`.
- Before the fix: 55 of 56 tests passed. The catalog test required a preexisting full catalog.
- After the fix: 58 of 58 tests passed. The query test uses an isolated synthetic fixture; a separate regression checks missing and incomplete catalog metadata. A subprocess test verifies readiness after successful import and its removal after a failed reimport.
- `npm run demo:workbench`: all eight scenarios passed against the disposable database.
- Existing imported catalog smoke check: Wide Guard retrieval returned HTTP 200 and 28 candidates, including Torterra, with the September 2026 snapshot metadata.

To repeat, start an empty FalkorDB instance, point `GRAPH_URL` at it, then run:

```sh
npm ci --ignore-scripts
npm run test:workbench
npm run demo:workbench
```

The test and demo runners create and delete their own graphs. The case workbench needs no catalog import. Catalog search now reports missing graph or import-completion marker as unavailable rather than returning a misleading empty result. The importer publishes the marker only after node and edge counts match the input dataset. Imports created before this change require `npm run ingest` once more. These checks do not validate game mechanics.
