# Gimmikghoul: test whether a change preserves the plan

Reviewed the working copy of [master.excalidraw](../canvas/master.excalidraw), including its text and bound arrows, on October 17, 2026. The board was already modified locally; this review leaves it untouched. Community evidence is collected in [TEAMBUILDER_PLAYER_FEEDBACK.md](TEAMBUILDER_PLAYER_FEEDBACK.md).

## What the storyboard proposes

The opening separates mechanics, beliefs about hidden sets, conditional interactions, battle decisions and population-level team value. Its architecture connects pinned rules, dated usage and observed teams to a query/calculation/simulation interface. Its strongest hypothesis is the per-tweak loop:

```text
team T + proposed change -> T'
             |
      which plans change?
             |
 compare against the same opponent sample
             |
 test dependence on pilot, field and opponent knowledge
             |
 explain gains, losses and conditions
```

The Banette/Sneasler and Simple Beam/Torterra cases make the intended unit concrete: a sequence with prerequisites, support and ways to disrupt it. These are worked examples on the board, not independently reproduced battle results in this review.

## What the competing products and feedback change

PokeSynergy already documents a builder with format-specific suggestions, coverage checks and saved-team export. Its M-C page distinguishes measured data from curated recommendations and links damage and speed tools. We cannot position existing builders collectively as type charts. [Builder](https://pokesynergy.app/pokemon-team-builder), [M-C data description](https://pokesynergy.app/pokemon-champions-regulation-m-c-team-builder).

Its own guide discusses executable leads, disruption and win conditions. Explaining a plan is therefore also an existing product theme; our distinction must be demonstrated in what the system computes or helps a player decide. [Guide](https://pokesynergy.app/guides/eight-signs-of-a-good-team).

The most relevant user report describes adding Pokémon using both personal guesses and PokeSynergy suggestions without understanding their contribution to the starting core. Positive feedback values calculations tied to the player's own six. The useful question is whether Gimmikghoul can close that reasoning gap. These anecdotes do not establish competitor failure or market-wide demand. [Unresolved core-building task](https://www.reddit.com/r/PokemonChampions/comments/1wrcyi4/need_some_help_for_my_team_building_skills_singles/), [PokeSynergy praise](https://www.reddit.com/r/PokemonChampions/comments/1ubsju3/for_people_who_are_new_and_struggling_to_learn/).

## Proposed corrections to the theory

- **Keep conditional strength separate from frequency.** The board's Stalwart example combines a mechanism with 2.4% usage. A rare answer can still decisively defeat a plan when present. Report conditional failure and expected exposure separately.
- **Treat the pilot as part of the experiment.** Borrowing a bot does not establish that it can execute Swagger/Unburden or Simple Beam setup. First test its execution of known lines. Compare fixed-pilot results and equally budgeted adaptation separately. Preserve an untouched evaluation set after choosing a tweak.
- **Keep uncertainty visible in the cooking meter.** A small positive estimated delta is not sufficient evidence of improvement. Separate sampling uncertainty from sensitivity to different fields and pilots. Shared random seeds can reduce variance in some comparisons, but do not guarantee equivalent chance events after trajectories diverge.
- **Avoid exhaustive labels.** Strict domination by another legal team is sufficient evidence against a team, not a necessary definition of a bad one. Surprise dependence can coexist with general strength. Report these as dimensions before turning them into four mutually exclusive classes.
- **Define exposure.** Testing surprise requires specifying what the opponent knows and how its policy changes. A familiar opponent with a different skill level confounds knowledge with pilot strength.

## The graph's proposed job

```text
source observation -> conditional mechanism -> enables a plan
                              |
                      prerequisites / counters
                              |
candidate change -> affected plans -> targeted checks -> evidence
```

This representation can retain multi-Pokémon dependencies and provenance through a reified plan node. Alternative protections can satisfy the same strategic requirement through different mechanisms. Redirection, mitigation, switching and speed control remain distinct candidates with distinct conditions. Rules and calculations must validate those conditions.

The graph does not itself supply a battle policy or a win probability. Its engineering value is making dependencies and evidence queryable. Compare it with equivalent plain-data retrieval before claiming a database advantage; our earlier retrieval experiment did not establish one. [Existing experiment log](EXPERIMENT_LOG.md).

## Smallest informative experiment

Start with one of the board's documented cores. Remove one enabler, retrieve alternatives by the requirement it served, and return three candidate repairs with legal sets, required positions and an opponent response that defeats each. Compare against usage/type/role suggestions using the same source data. Score legal suggestions, executable lines, preservation of the core's purpose and whether a player can explain the choice. Include a held-out core before claiming generalization.

The proposed product promise is: **Find changes that help an unusual team execute its plan, and show what each change sacrifices.** Novelty and competitive gains remain hypotheses to test.

## Numbers observed

- One existing storyboard inspected through its structured text and arrow bindings; zero canvas elements changed.
- Eight targeted Reddit discussions in the companion research, not a representative survey.
- Three additional PokeSynergy documentation pages inspected for this review.
- Zero new battle simulations, paid inference calls or measured team-strength gains.
