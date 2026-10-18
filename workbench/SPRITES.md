# Pokémon images in the native graph

`data/sprites/` stores local Pokémon images and a provenance manifest. The 2026-10-18 download covers all 392 species and forms marked `inChampionsCatalog` in the imported snapshot. Across the complete 1,417-node Species catalog, 1,407 have an exact image. Ten forms have no exact image in the inspected source directories and keep the native text node.

## Reproduce the assets

```sh
node scripts/pokemon-sprites.mjs
```

The script reads `.artifacts/dataset.json` and the pinned engine in `.cache/showdown/`. It asks that engine for each species' `spriteid`, then downloads the matching filename from Pokémon Showdown's [gen5](https://play.pokemonshowdown.com/sprites/gen5/), [home](https://play.pokemonshowdown.com/sprites/home/), or [ani](https://play.pokemonshowdown.com/sprites/ani/) directory, in that order. It verifies PNG/GIF signatures and records the original URL, image dimensions, download time, byte count, and SHA-256 in `data/sprites/manifest.json`. Cached files are reused only when their hashes match the manifest.

Forms use their own sprite IDs, including Mega evolutions, regional forms, and cosmetic forms. The script never substitutes a base Pokémon image for an unavailable form. Eleven exact images are GIFs; the others are PNGs. The downloaded payload totals 1,815,182 bytes.

The images remain assets from the linked Showdown sources; the repository's code license does not grant rights to Pokémon artwork.

## Add image properties to the catalog

After mounting `data/sprites/` at `/app/public/sprites` in the native Browser container:

```sh
SPRITE_BASE_URL=http://localhost:4319/sprites/ node scripts/pokemon-sprites.mjs --apply-only
```

`--apply` downloads first and then applies metadata. `--apply-only` uses the existing manifest. `CATALOG_GRAPH` defaults to `pokemon_mc_202609`; `GRAPH_URL` uses the same local Redis connection as the other repository scripts. The script requires an existing graph and a Snapshot whose engine revision matches the manifest.

Only these Species properties change: `imageUrl`, `spriteStatus`, `spriteSource`, `spriteId`, and `spriteSha256`. Missing images receive `spriteStatus='missing'` and an empty `imageUrl`. Existing catalog properties and relationships remain intact.

## Render images in FalkorDB Browser

The official Browser v2.7.1 does not provide an image-property style setting. The small extension in `workbench/native-browser/` adds image drawing to its native 2D canvas. It uses the library's custom node rendering callbacks and the pinned renderer's original drawing methods for the selection border, expansion glow, fallback nodes, and pointer targets. The name appears below the image. Other node types retain the native renderer.

Build the derived image from the repository root using `workbench/native-browser/Dockerfile`. Its base is the pinned official image digest `sha256:4e455296e4935b6711cb9b86fbf193588932371e7d442ce413e3138dc865b7fd`. The build appends the extension to the existing canvas JavaScript chunk; it fails if the expected chunk or renderer methods are absent. It fingerprints the modified canvas chunk and webpack loader, then updates the server manifests so a normal reload fetches the extension even when the original scripts were cached. The upstream application, query editor, graph data, and navigation remain the official Browser.

Serve the assets from the Browser's own `/sprites/` path. Its Content Security Policy blocks images fetched from a separate localhost port. The extension accepts only imported local sprite paths and never requests arbitrary remote URLs stored on nodes.

This extension targets 2D graph mode. The native 3D renderer retains its spheres and captions. Recheck the guarded methods and the visual result before changing the pinned Browser version.

```sh
node --test workbench/native-browser/*.test.mjs
```

For visual verification, return Species nodes themselves, rather than only their properties:

```cypher
MATCH (s:Species)
WHERE s.id IN ['Species:venusaur','Species:venusaurmega',
               'Species:charizardmegax','Species:raichumegax']
RETURN s
```

The browser console exposes `window.__pokemonSpriteRenderer` with canvas, successful image load, failed load, and draw counts. Check the rendered image, node name, click selection, and expansion in the native graph after deploying.

## Forms without an exact image

None of these ten nodes is marked `inChampionsCatalog` in this snapshot:

- Heatran-Mega
- Darkrai-Mega
- Zygarde-Mega
- Magearna-Mega
- Magearna-Original-Mega
- Zeraora-Mega
- Toxtricity-Low-Key-Gmax
- Tatsugiri-Curly-Mega
- Tatsugiri-Droopy-Mega
- Tatsugiri-Stretchy-Mega
