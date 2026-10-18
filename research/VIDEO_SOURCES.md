# Video sources

Two practitioner videos, read from YouTube auto-captions on 2026-10-17 and checked against one frame. Timestamps point into each video. Names are spelled from auto-captions unless a written source confirms them; see the sidecar for open checks. Speaker claims are labelled as claims. Nothing here was reproduced.

## V01. Aaron Traylor, "Competitive Pokemon may be Impossible to Explain"

- Link: https://www.youtube.com/watch?v=wrR6MquGU6A
- Uploaded 2026-02-06, 45:53, about 1.14M views when retrieved.
- Speaker: 15-year VGC player with Worlds top 8, 16 and 64 finishes and a computer science PhD (self-description, 2:04).
- Retrieval: captions via yt-dlp; one frame at 31:58 confirmed the four-element diagram. Captions and the frame are kept in the session scratchpad and are not committed.

**Thesis.** A battle combines four strategic elements that other games have only in part. Team building sits above them, has no comparable theory yet, and is coupled to battling through a feedback loop that makes credit assignment hard.

| Time | Claim or example | Use for us |
|---|---|---|
| 2:35 | Two phases: team building, then battling. Battling is covered first because you need to know how to win before you know which Pokémon win. | Matches the formula's dependence on the pilot, `Pr(win \| T, O, π)`. |
| 3:36 | Element 1, **long-term planning**. Doubles run 8 to 12 turns, up to about 40; singles around 50. Resources shrink as Pokémon faint. | Horizon length per format. |
| 5:37 | Worked game (summer 2025 online tournament): Whimsicott sets Prankster Tailwind and faints turn 1 having dealt no damage, yet wins the game. Counting damage and remaining Pokémon would score it as a loss. | Example for the blog: a plan's value is invisible to naive material counting. |
| 9:43 | Element 2, **simultaneous action selection**. Annihilape vs Gengar with Tera Normal: Shadow Claw vs Close Combat is a pure 2×2 guessing game. | Ready-made 2×2 example. Tera does not exist in Champions; swap the mechanism. |
| 13:17 | Good play steers toward states with no guess left: "navigate to futures where you have a clear-cut advantage." | The planning and simultaneity elements interact. |
| 15:50 | A real doubles turn is a grid of joint actions far beyond what a player can search in 45 seconds. | Motivates learned evaluation plus shallow search. |
| 17:25 | Opponent modelling ("Terry Normal" shirt): reading the player, not just the board. | Exploitative versus equilibrium play. |
| 18:57 | Element 3, **imperfect information**: unknown sets, a surprise Trick Room Whimsicott, Arcanine with Wild Charge. Open team sheets at official events reveal everything except stats. Benched Pokémon stay hidden even then. | Belief layer. In Reg M-C the open-team-sheet format hides Stat Points, the chosen four and the leads. |
| 25:34 | Element 4, **probability management**: accuracy, secondary effects, crits (1/24, 1.5×), damage rolls (85 to 100, up to 16 values). | Chance nodes. |
| 31:12 | The outcome of one joint action is "a skyscraper", not a grid cell, because of chance. | Visual metaphor for the chance-node expansion. |
| 31:42 | Four-circle diagram. Chess is long-term planning only; rock-paper-scissors is simultaneity only; poker and Magic cover planning, imperfect information and chance. Pokémon sits in all four. | Opening figure for the blog. Redraw it rather than reuse the frame. |
| 34:15 | Team count: a Smogon forum user's 2019 estimate of 6.08701 × 10^218 possible teams (USUM era). | Scale figure. The forum thread has not been checked. |
| 35:19 | One Speed point has decided prize-winning games. | Tiny changes are not smooth; this works against gradient-like team search. |
| 36:20 | Rules of thumb exist (base stats, covering weaknesses), but "good" is relative to the field: Gyarados covers Venusaur until the field is full of Zapdos. | Situational versus general value. |
| 37:21 | The metagame is partly a social construct. An expert dropped into an unknown format with no metagame data and no ladder would have nothing to optimise against. | Team value is defined against a distribution; with no distribution the problem is underspecified. |
| 39:54 | Team building is iterative: build, ladder, adjust. You cannot tell whether wins came from the team or the pilot, and luck in practice (a freeze-heavy team) hides weaknesses. | Credit assignment and variance. This is the core of our "generalisable or situational" question. |
| 41:26 | Deck building as the closest analogue: roughly 10,000^60 ≈ 10^240 decks. | Transfer domain. |
| 43:00 | "Plausible" that a best way to play a given battle exists and game theorists could find it; for team building, "I'm not sure we really have the tools yet", and it needs novel research. | Practitioner statement that team building is the open problem. Pull quote candidate. |
| 43:30 | 2013 anecdote: a professor said solving team building would earn a PhD on the spot. | Story hook. |

He says his next video tackles a team-building problem with an unknown metagame "in a fairly unconventional way" that "doesn't go very well" (38:54). Not yet located.

## V02. ck49, "Bots are Better than Pros at Pokemon. Now What?"

- Link: https://www.youtube.com/watch?v=VSAeOI0CLx0
- Uploaded 2026-10-15, 29:45, about 37K views when retrieved.
- Speaker: Baltimore Regional finalist, six-time Worlds competitor, former computer science PhD student in a chess-skill lab, economics double major (self-description, 0:00 and 12:48).
- Retrieval: captions via yt-dlp. No frames inspected.

**Thesis.** Within about a month, bots topped three Showdown ladders with modest compute. The bottleneck was a fast simulator, not model size. Battling is now bot-favoured; team preview and hidden-information states remain weak spots.

| Time | Claim | Status |
|---|---|---|
| 1:00 | August 2026: Jaxcalibur reached #1 on the random battle ladder; only MichaelderBeste2 consistently beat it. | Matches the Jaxcalibur announcement in `bot-history.md`. |
| 2:02 | About a month later, within one day, two independently built bots topped the VGC best-of-one and best-of-three ladders. | Speaker claim. Bot names from captions: "Miku" (Bo1) and "Nessie" / "Nessie123" (Bo3). |
| 2:32 | No developer has released full source; Nessie's developer told him they likely plan to release the model in the coming months. | Interview claim. |
| 3:02 | Compute is modest: Jaxcalibur is under 20% of AlphaGo Zero's size; Nessie topped Bo3 on under $120 of compute. | Jaxcalibur figure matches its write-up; the $120 figure is unverified. |
| 3:33 | The Bo1 bot reached #1 looking only one turn ahead, using a learned evaluation of the next state. | Speaker claim. Strong evidence that evaluation quality, not search depth, carries the result. |
| 4:03 | Bots are weak at **team preview** and at hidden-information states; they nearly solve endgames. | Speaker assessment. This is where our problem lives. |
| 4:33 | Top players (named from captions as Nails and Marco) are at best 50% against these bots. | Speaker claim, sample size not given. |
| 4:33 | The bottleneck was a stripped-down, fast Showdown clone validated against Showdown itself. Nessie needed about 300,000 games; others tens to hundreds of millions. | Matches Jaxcalibur's custom JAX engine. Generative AI made the clone cheap to write (6:35). |
| 9:42 | Method in plain terms: neural network maps state to win probability; enumerate both sides' joint actions one turn ahead; build a payoff grid; solve its Nash equilibrium; sample the move from the mixed strategy. | Clear lay explanation for the blog. The bot does not model the individual opponent. |
| 17:28 | Level-one bot detection: a player who never leaves the equilibrium distribution over 20 to 30 games is probably a bot. A human consulting a bot only on hard turns is much harder to catch. | Policy implication. |
| 20:34 | Humans lack shared vocabulary for fundamentals ("vertical synergy"). Bots will teach game-theoretic play. | Supports our explanation-first angle. |
| 21:04 | Nessie's developer on how humans deviate from equilibrium: too few double-Protect fishes, too few switches, too few two-Mega brings, too much non-consecutive Protect (especially turn 1), too much Fake Out. Humans pick very high or very low "entropy collapse" moves too often, shifting safe when ahead and risky when behind. | Developer claim relayed. Testable against replays later. |
| 22:07 | Example: EUIC 2025 top 8, a player passed on a stated 66% line to call a double Protect and won. | Event details unverified. |
| 23:38 | Finals preparation changes: simulate a known matchup millions of times overnight; analyse every day-two team between rounds. Expects top competitors to need such tools by Worlds 2027. | Forecast. |
| 26:11 | Bots play best against teams seen on open team sheets. An unseen team has an edge until opponents simulate it. Bots can test team choices against a gauntlet. | Directly defines "gimmick" value as surprise that decays with exposure. |
| 26:43 | "90% of those ideas suck": testing patch ideas is the human bottleneck. | Pull quote candidate. |
| 27:14 | The meta call becomes measurable: you can now score a team against the whole field's expected distribution instead of judging by outcome. A bad Charizard matchup does not matter if you met one Charizard, but at 20% usage you got lucky. | The `E_O` term, stated by a practitioner. |

## Cross-reading

Both speakers separate battling from team building and place the hard, unsolved part in team building, metagame estimation and team preview. V02 reports that battling is now bot-favoured with a one-turn search over a learned value. V01 explains why a learned value is needed: the four elements make explicit lookahead impractical for humans. Neither claims a method for judging whether a team is generally good or only good in the current field.
