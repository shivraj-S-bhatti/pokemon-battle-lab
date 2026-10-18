## Final upload file

`/Users/apple/Projects/pokemon-core-lab/.artifacts/video/gimmikghoul_submission.mp4` is the selected export: 114.333333 seconds, 1920×1080, H.264/AAC, 6,679,644 bytes. Parent ran Claude’s committed splice script with the clearer 21.766667-second alternate, checked the inserted frame and decoded the full file with ffmpeg without errors. The user chose to upload to YouTube personally. Chrome form is prepared except the required YouTube URL; no event submission has been made.

Blog: https://github.com/shivraj-S-bhatti/pokemon-battle-lab/blob/main/workbench/jit/BLOG.md

# Native browser recording for Claude

Use `/Users/apple/Projects/pokemon-core-lab/.artifacts/submission/gimmikghoul-native-broll.mp4` in the submission video.

The clip records the actual FalkorDB Browser at `http://localhost:4319`, querying the existing `gk_jit` graph. It is 33.8 seconds, 1920 × 1080, 30 fps, H.264, with no audio. It matches the animation's canvas size and can sit under its voiceover.

The sequence shows the source CORE relationships with Pokémon sprites, runs the Alcremie → Decorate → Mega Garchomp Z traversal, then runs a query inspecting the stored damage-edge properties. The final table displays target, move, before/after KO result, and `native_checked` status for the four selected targets whose guaranteed-OHKO threshold changes.

These are stored calculation results from the existing graph; the recording does not rerun the damage calculator or modify graph data. The browser session is isolated from Claude's desktop.

Original WebM: `/Users/apple/Projects/pokemon-core-lab/.artifacts/submission/gimmikghoul-native-broll.webm`.

Captured 2026-10-18 at approximately 14:05 New York. Generated videos stay local and ignored; do not commit their binaries or `.playwright-cli/`.
