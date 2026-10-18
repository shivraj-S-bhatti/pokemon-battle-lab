# Written sources for theory iteration

Observed 2026-10-18. Start with a few attributed claims and their objections. The useful unit is a revisable explanation tied to a format and decision, rather than a universal synergy score.

## Source intake

| Source | What opened | Format and time boundary | Use |
|---|---|---|---|
| [VGC Guide: Teambuilding](https://www.vgcguide.com/teambuilding) | Readable index, including synergy, cores, modes, archetypes, intent and team evaluation | General VGC teaching; publication date not displayed | Vocabulary and questions to ask |
| [Cores and Modes](https://www.vgcguide.com/cores-and-modes) / [Archetypes](https://www.vgcguide.com/archetypes) | Readable articles by Wolfe Glick / Aaron Traylor | Historical examples across formats; no publication date displayed | Explain team structure without assigning current legality |
| [VGC M-C discussion](https://www.smogon.com/forums/threads/vgc-reg-m-c-metagame-discussion-thread.3788116/) / [Champions BSS discussion](https://www.smogon.com/forums/threads/pokemon-champions-bss-discussion-thread.3785396/) | Both returned HTTP 403 to this retrieval | Titles/contents not independently read in this pass | Pending sources, not ingested evidence |
| [VGC Teams of the Week, page 4](https://www.smogon.com/forums/threads/vgc-teams-of-the-week-accepting-regulation-m-c.3727451/page-4) | Readable team-builder explanations | Thread title says M-C, but entries mix F, I, M-A, M-B and M-C. Post #93 is July 7 / M-B; #98 is September 28 / M-C per the page’s winners table | Capture each post’s author, date and regulation separately. The page also says closed for replies despite its title |
| [Champions BSS Viability Rankings](https://www.smogon.com/forums/threads/pokemon-champions-bss-viability-rankings.3780943/) | Readable ranking and replies | Thread began April 16, 2026; inspected early replies are April 16. No M-C label found on this page | Council judgment and attributed discussion, not measured win probabilities |
| [Pokémon Zone team cores](https://www.pokemon-zone.com/champions/team-cores/) | Readable core statistics and method | Displayed M-C / Season 6 / Limitless selection; also offers a separate live-event source | Candidate discovery. Its “Finishers” view excludes dropouts and competitive view filters rare cores, so it is a selected population |
| [Showdown Tier BSS M-C](https://showdowntier.com/formats/smc/index.html) | Readable species, teams and four-member core tables | Updated October 18, 11:01 UTC; sample October 4–18, 2026 | Public Pokémon Showdown battles using the Champions format, not telemetry from the retail game. The site explicitly says its sample is non-random |

A ranking, a tournament co-occurrence and a player's explanation answer different questions. Preserve that distinction when projecting them into a graph.

## Small vocabulary

- **Role:** a job within a proposed plan, such as setting speed control or enabling a setup turn. This is our working label; attach it to the set and context rather than permanently to a species.
- **Core:** a combination whose synergy substantially shapes the team. **Teambuilding mode:** a subgroup providing a distinct option; **battle mode:** a reusable choice of leads/back Pokémon and plan. These distinctions follow [Glick](https://www.vgcguide.com/cores-and-modes).
- **Archetype:** a recurring team family with similar goals and play, not every collection sharing a type pattern. [Traylor](https://www.vgcguide.com/archetypes) explicitly distinguishes a Fire/Water/Grass core from an archetype.
- **Primitive:** our optional tag for a mechanism such as redirection. No comprehensive primitive ontology was established by these reads. Add tags only when they help retrieve or compare a live hypothesis.

## Two source-grounded examples

1. **Mode benefit with a cost:** Glick explains that an otherwise fast team can contain a Trick Room subgroup, but a member dependent on Trick Room constrains which partners must be brought. A fixed pairing can also reveal likely leads. Store both the alternative plan and its preview-flexibility cost. This is general VGC advice, not an M-C recommendation. [Cores and Modes, “When should I add a mode?”](https://www.vgcguide.com/cores-and-modes)
2. **Claim, challenge, revision:** April 16 BSS posts #2–4 debate Calm Mind Mega Slowbro. Genodragon1 describes setup-dependent success and avoiding unsafe leads; DerpySuX objects that passivity, status, Taunt and Encore limit it. The builder replies that base-form Oblivious and delaying Mega evolution address part of the objection. Preserve the disagreement and timing question. These are historical player claims; no engine test or current-regulation transfer was performed here. [BSS rankings, posts #2–4](https://www.smogon.com/forums/threads/pokemon-champions-bss-viability-rankings.3780943/)

## Minimal ingestion record

One record in an existing Markdown note or JSON collection is enough; this is a suggested record, not a new schema service:

```yaml
id: source-local-stable-id
source: {url: exact-page-or-post, locator: post-number-or-section, author: name}
observed_at: 2026-10-18
published_at: null  # unknown is allowed; never substitute retrieval date
format: {game: explicit-or-unknown, mode: singles-or-doubles, regulation: explicit-or-unknown}
claim_kind: player_explanation  # or aggregate_observation / mechanics_claim
claim: short paraphrase
conditions: [only the conditions actually supplied]
objections: [attributed counterclaims, with source pointers]
tested_status: not_run
next_check: the smallest check that could change our next choice
```

Keep source assertions unchanged. Attach our proposed test, engine/calculator inputs and result separately; then revise the theory with a pointer to what changed. An untested assertion must not silently become a mechanics fact. Current-regulation transfer is a new hypothesis. A user's accepted loss is a separate preference, not something inferred from an author's weak matchup.

## Numbers observed

- **8 supplied URLs** checked: **6 readable, 2 HTTP 403**. Two additional vocabulary articles (Synergy and Archetypes) opened. No bulk collection or paid model/video call.
- Pokémon Zone displayed **294 tournaments, 42,242 battles**, and its selected core table **157 four-member cores across 7,483 teams**. The competitive method uses a **90% Wilson lower bound**, tournaments of at least **16 players**, and at least **1% team prevalence**. These are site-reported counts and filters, not independently reconstructed results. [Source](https://www.pokemon-zone.com/champions/team-cores/)
- Showdown Tier displayed **24,778 battles**, average rating **1,185**, range **1,020–1,619**, for **October 4–18**. This population should not be substituted for the separate September cutoff-1500 data already in the repo. [Source](https://showdowntier.com/formats/smc/index.html)

## Next bounded intake

Take one current-format team report with a specific target matchup, one meaningful objection, and a small test that discriminates between alternatives. Keep singles and doubles separate. Expand collection only when an unresolved choice needs another example. Graph edges can index these claims and revisions; deterministic replay belongs to the recorded tool inputs and outputs, not to a promise that agent ideation itself is deterministic.
