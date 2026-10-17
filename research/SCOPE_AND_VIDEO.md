# Creative strategy analysis, data scope and video extraction

October 17, 2026.

The project targets Pokémon Champions. The user clarified that creative ideation and reconstruction of human strategic reasoning are central. Simulation should check selected proposed interactions and counterexamples. Full battle-policy search, a new JAX environment and exhaustive team optimization are outside the present scope.

## Counts and populations

`scripts/inspect-singles.mjs` now distinguishes 323 species/form usage entries from 229 distinct National Pokédex numbers. The cached official M-C eligibility list contains 262 rows spanning 231 distinct National Pokédex numbers. The September Showdown BSS JSON's `info['number of battles']` is 69,462. It is source metadata, not a corpus of 69,462 local battle logs. Evidence: `research/evidence/singles-data-inspection.json` and its hashed source.

The existing graph and downloaded usage statistics are explicitly Showdown-derived proxies. Official eligibility and in-game Champions evidence have separate authority. A video's selected games do not establish population win rates. A simulator implementation may differ from the game; mechanic agreement needs verification when it matters to a claim.

## Time series

`scripts/inspect-meta-history.mjs` retrieves eight month/regulation combinations from April through September, at weighted cutoff 1500, preserving exact URLs and hashes in `research/evidence/meta-history.json`. Keep regulation and population in the series key; overlapping M-B and M-C September samples are separate populations.

Volcarona in the M-B Showdown series rises from 4.94341% in June to 5.29710% in July, 6.86232% in August and 8.68923% in September. September M-C is 6.48998%. These data cannot establish the user's observed recent rise within M-C on the official ladder. They motivate collecting dated official-game observations, reports and sets, with recording date distinguished from publication date.

The intended evidence flow is:

```text
Dated usage + specialist reports + video state timelines
                         |
               candidate explanations
                         |
              unusual strategic ideas
                         |
           selected mechanical checks
```

## Reusable video workflow

Located the existing adapter `/Users/apple/Projects/bpmn/.artifacts/provider_video_access.py` and verified previous native-video usage receipts through a read-only research agent. The adapter sends a YouTube `video_url` to Gemini through OpenRouter; it is not a transcript-only URL lookup. Reused the existing credential helper without printing credentials.

Created and installed `/Users/apple/.codex/skills/video-state-analysis/SKILL.md`, with a bundled adapter, extraction guidance, explicit coverage limits and an optional reasoning-effort parameter. The skill was validated, and preview mode verified the public URL/model/payload. Skill installation alone does not establish extraction accuracy.

For the user-supplied [SplashPlate video](https://www.youtube.com/watch?v=zQQH_5liolE), prompts and provider responses are retained locally. The first Gemini 3.1 Pro request processed 143,685 provider-reported VIDEO tokens, then hit the 6,000-token output limit after using 5,759 reasoning tokens. Its JSON was incomplete. A second request at low reasoning effort returned an inability-to-access-video message despite reporting VIDEO input tokens. Neither response supports a verified full timeline. A third request focused on the opening 120 seconds at medium effort returned valid JSON containing seven timestamped observations. These are model-extracted and not independently frame-verified. The three calls cost $0.974344 in total according to provider usage; receipts are summarized in `research/evidence/video-run-summary.json`, observations in `research/evidence/video-opening-observations.json`. Full-video coverage and caption-aligned reconstruction remain incomplete.

The workflow separates visual observations, paraphrased commentary, inferred explanations and unknowns. It records timestamp coverage, editing gaps and transformations. The current adapter does not expose FPS or actual input clipping. Gemini's [video documentation](https://ai.google.dev/gemini-api/docs/video-understanding) supports video processing but warns that sampling can miss details. OpenRouter documents that [reasoning consumes the output budget](https://openrouter.ai/docs/guides/best-practices/reasoning-tokens).

## Delivery

Local research/scripts and one installed skill. No gameplay bot, official-ladder telemetry ingestion or new battle simulator. Extracted model claims remain unverified until checked against source frames or independent evidence.
