# JoeUX9 anti-meta teambuilding guide

JoeUX9's [How To Build Anti Meta Teams In Pokémon Champions](https://www.youtube.com/watch?v=Swjz3trjz60), published June 30, 2026, is a useful worked example for Gimmikghoul. The builder starts with opponents he expects to face, chooses a Pokémon that pressures those teams, then changes the surrounding slots until he has plausible ways to pilot the result. The goal is a matchup advantage that survives ordinary play. Rarity alone does not provide one.

This analysis combines timestamped English auto-captions with a Gemini 3.1 Pro native-video pass. The captions corrected material errors in the model's summary. June's opponents and benchmarks are historical examples, not an October metagame estimate. Exact sets and damage results still need a compatible calculator; they were not reproduced here.

## What the builder actually does

| Video interval | Decision process | What our agent should retain |
| --- | --- | --- |
| [0:30–1:39](https://www.youtube.com/watch?v=Swjz3trjz60&t=30) | Targets several common team structures involving Charizard, Floette and other threats. Mega Glimmora is his initial pressure piece. He immediately names Garchomp, rain and Steel types as problems. | The target population, reason for the initial choice, and unresolved matchup questions. |
| [1:39–2:20](https://www.youtube.com/watch?v=Swjz3trjz60&t=99) | Adds Mamoswine for an Adamant Life Orb Ice Shard benchmark against Garchomp. Glimmora in turn pressures Charizard, which threatens Mamoswine. | A conditional offensive interaction and reciprocal coverage, with a specific calculation to request. |
| [2:20–4:43](https://www.youtube.com/watch?v=Swjz3trjz60&t=140) | Adds Tailwind; considers another setter with Frisk and Ground immunity, then prefers Whimsicott. Charizard supplies weather control, Steel pressure and useful paired attacks. The two Mega candidates offer alternative modes; he explicitly says Glimmora would remain untransformed if Charizard Mega Evolves. | Alternatives and opportunity costs, role compression, and mutually exclusive transformation choices. |
| [4:43–7:09](https://www.youtube.com/watch?v=Swjz3trjz60&t=283) | Kingambit helps with Delphox and opposing Kingambit. He considers Incineroar, dropping Iron Head, and different defensive berries. He asks whether this deviation offers value over the standard six. | Comparison with an ordinary strong team. A slot's justification depends on what the other five already provide. |
| [7:09–10:32](https://www.youtube.com/watch?v=Swjz3trjz60&t=429) | Basculegion benefits from Tailwind and pressures important opposing options. He then walks through leads, identifies awkward opposing leads, and discusses pieces to keep in back. | Team ideas need candidate bring/lead plans and known uncomfortable cases. |
| [10:33–11:10](https://www.youtube.com/watch?v=Swjz3trjz60&t=633) | A known opponent in a one-off match permits narrower targeting than a general tournament or ladder. | An explicit deployment goal: targeted counterteam versus broad field. |
| [11:11–17:45](https://www.youtube.com/watch?v=Swjz3trjz60&t=671) | Checks the benchmarks that justify the choices. Mamoswine's priority KO is central to its niche. Glimmora's damage versus Speed is a value judgment. Charizard and Basculegion receive survival and Speed targets. | Ask existing calculators about decision-relevant thresholds. Avoid optimizing every stat or computing every matchup indiscriminately. |
| [17:46–18:59](https://www.youtube.com/watch?v=Swjz3trjz60&t=1066) | Reopens Kingambit: considers four attacks and another Fairy answer, then returns to the earlier approach because the team's combined pressure may suffice and Fighting survival matters. | Preserve revisions. An early candidate and a final choice must not become simultaneous facts. |
| [19:00–20:13](https://www.youtube.com/watch?v=Swjz3trjz60&t=1140) | Explains why small targeted deviations can be worthwhile without replacing every popular Pokémon. | A useful idea can be one unusual slot or set on an otherwise familiar team. |

## What deserves effort

**Choose better questions for existing tools.** The important Mamoswine question is whether the intended priority knockout survives the opposing spreads we care about. Reimplementing the sixteen damage rolls does not improve that question. Use a trusted calculator's OHKO/2HKO outputs with its assumptions intact, including recovery and other relevant conditions. Set legality, damage arithmetic and basic Speed calculations belong behind adapters.

**Keep alternatives visible.** A useful agent can say, “This slot patches these two problems; that alternative patches one and improves this different matchup.” A permanent positive edge between two species cannot express that. Nor does listing a requirement by itself discover a better team.

**Spend computation where a choice could change.** If a threshold is impossible without sacrificing the core plan, stop fine-tuning it. If two candidates differ mainly against one common lead, investigate that lead. These workflow proposals remain to be evaluated.

## Human map and agent representations

The visible map can show a small explanation of the current idea:

```text
[Target field / date] --> [Team hypothesis] --> [Candidate six]
                               |
                 +-------------+--------------+
                 v                            v
           [Lead / bring plan]          [Open choice]
                 |                       /          \
                 v                 [Option A]    [Option B]
       [Threat / response]               \          /
                 |                     [Comparison]
                 v                           |
       [Timestamped rationale]       [Calculator result]
```

This is a navigation view for the person. The agent can construct temporary factors, hyperedges, opponent-set projections or candidate-search states behind it. There is no requirement that the display contain every computational object.

Persist the **intent** “Mamoswine should remove this Garchomp before it acts” with a link to the exact tested sets and result. Do not promote it into “Mamoswine beats Garchomp.” When an item or target spread changes, retain the intent and recompute the supporting evidence. A failed benchmark can lead to a new candidate, a different line, or accepting the weakness.

The immediate product test is whether this map helps a person and an agent discover, compare and revise promising team ideas. It does not establish a novel graph algorithm or prove a team strong.

## Numbers observed and extraction limits

- Source duration: 1,213 seconds. Caption extraction: 651 generated-English segments, first at 0.40 seconds; final segment begins at 1,212.00 seconds and extends to 1,215.28 seconds. The caption tail extends beyond the metadata duration.
- One Google AI Studio request through OpenRouter: `google/gemini-3.1-pro-preview`, high reasoning, 24,000-token output limit; normal `stop` completion.
- Usage: 110,917 prompt tokens, including 110,395 video tokens; 6,568 completion tokens, including 3,321 reasoning tokens; reported cost $0.30065.
- Native-video tokens establish processed video input. They do not establish exhaustive frame inspection. No independent frame audit was completed. Caption alignment supports the decision sequence above, not every numeric value on the calculator screen.
- Gemini misidentified the creator and format. It also described the Glimmora tradeoff as a decision to choose Modest; [13:39–14:45](https://www.youtube.com/watch?v=Swjz3trjz60&t=819) instead contains an argument for valuing Speed as opposing Charizard and Floette become faster. Those model claims were rejected. Its summary also flattened the later Kingambit revisions.
- Raw receipt, prompt, captions and model output are local under `.artifacts/video-guides/swjz3trjz60/`. The full transcript is not included in this research note.
