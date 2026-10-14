# Complexity notes: what "reducing Pokémon to a distribution problem" actually means

## The vocabulary (advanced-algorithms refresher)

A **Karp reduction** A ≤ₚ B is a polynomial-time function f mapping instances of
A to instances of B such that x ∈ A iff f(x) ∈ B. You reduce a *known-hard*
problem *to* the problem you're analyzing — proving yours is at least as hard.
**NP-hard** = every problem in NP reduces to it. **NP-complete** = NP-hard + in NP.

## Why the battle isn't an NP problem

A battle isn't a decision problem, so it can't be NP-anything. It is an
**imperfect-information game**: hidden sets (EVs, IVs, moves, items), stochastic
damage rolls, and simultaneous moves with team preview. The right object is a
**mixed strategy** — a probability distribution over actions at each decision
point. Your "distribution problem" instinct was correct.

## The equilibrium neighborhood: PPAD, not NP

The solution concept is Nash equilibrium, and **computing Nash is PPAD-complete**
(Daskalakis–Goldberg–Papadimitriou 2006; Chen–Deng 2006 for 2-player). A Nash
equilibrium is guaranteed to exist, so this is a *total* search problem — a
different hardness neighborhood from NP-complete decision problems.

## The algorithm that computes the distribution: CFR

**CFR — Counterfactual Regret Minimization** (Zinkevich et al. 2007): regret
minimization at each information set, converging to ε-Nash in 2-player zero-sum
games. This is the engine behind superhuman poker. For Pokémon, the natural
research line is tabular CFR on an abstracted game → (Deep/MC)CFR, evaluated on
VGC-Bench — build direction #2 in the README.

## Scale landmarks

- PokéChamp: first-turn state space ~10^354 (Gen 9 OU singles).
- VGC-Bench: ~10^139 team configurations (doubles with bring-6-pick-4).
- Aloupis et al. (2012): generalized Pokémon RPG completion is NP-hard — but
  that's the single-player overworld, not competitive play. No published hardness
  result exists for optimal competitive play or team building.
