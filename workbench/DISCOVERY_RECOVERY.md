# Investigate Friend Guard Maushold + Stamina Mudsdale

**Recommendation:** try Maushold as a setup partner for Body Press Mudsdale. Maushold uses Beat Up on its ally; each damaging hit activates Stamina. Friend Guard reduces that same friendly-fire damage and continues protecting Mudsdale from opposing attacks. Mudsdale can then attack with the Defense stat it just increased, provided it survives and acts after Maushold.

This is an exploratory core outside the three authored cases. Community novelty has not been assessed. The recommendation ranks mechanisms qualitatively, not competitive strength.

## What the graph changed

I initially considered Archaludon, particularly a resisted Water Shuriken setup. The actual Champions graph returned **only Mudsdale** for the Stamina + Body Press intersection. Archaludon has Stamina but no Body Press edge; the pinned format validator independently rejected an Archaludon Body Press set. That changed the recipient and ruled out Water Shuriken as the first setup option: Water is super effective into Mudsdale.

The retrieved Beat Up providers included Maushold, Alolan Persian, Whimsicott, Dragapult, Salazzle, and several others. I narrowed the comparison to partners with an additional support function after setup:

| Partner | Retrieved support | Decision |
| --- | --- | --- |
| **Maushold / Friend Guard** | Beat Up, Follow Me, Helping Hand, Protect | First investigation. Friend Guard directly cushions Mudsdale, including the ally-inflicted setup damage and opposing special damage. Follow Me is available on a later turn. |
| **Alolan Persian / Fur Coat** | Beat Up, Fake Out, Snarl, Parting Shot | Useful alternative if opposing special offense is the problem: Snarl and Parting Shot offer active disruption. Fur Coat protects Persian itself, and Dark STAB increases its Beat Up damage into Mudsdale. Those support moves consume turns. |
| **Whimsicott / Prankster** | Beat Up, Tailwind, Encore, Protect | Prefer investigating this branch if speed control or opposing Rage Powder is the constraint. Grass typing avoids powder redirection. Beat Up is damaging, so Prankster does not give it priority; Tailwind cannot be used in the same action. |

The surprising detail was Friend Guard's source check: it asks whether the damaged Pokémon is an ally, not whether the attacker is an enemy. It therefore softens Maushold's own Beat Up. This gives Maushold a specific reason to be selected beyond merely learning the move. [Friend Guard source](../.cache/showdown/data/abilities.ts#L1534)

## Mechanism and exclusions

- Beat Up hits once for the user plus each eligible teammate; fainted/statused other teammates do not contribute. In the four-Pokémon bring, four eligible participants can give four damaging hits and **+4 Defense from neutral**, if Mudsdale survives all hits with Stamina active. Each hit's base power depends on the contributing species, so the other two brought Pokémon affect setup damage. [Beat Up](../.cache/showdown/data/moves.ts#L1150), [Stamina](../.cache/showdown/data/abilities.ts#L4515)
- Body Press uses Defense as its offensive stat. The setup raises physical durability and its damage potential together. Stamina does not raise Special Defense. Friend Guard supplies a ×0.75 damage modifier while Maushold remains active and its ability applies; this is a mechanic, not a measured survival threshold. [Body Press](../.cache/showdown/data/moves.ts#L1572), [damage/stat handling](../.cache/showdown/sim/battle-actions.ts#L1666)
- Keep **Stamina**, not Mudsdale's Inner Focus/Own Tempo; keep **Friend Guard**, not Maushold's Technician. Mudsdale cannot Protect through the ally setup, and Maushold cannot use Beat Up and Follow Me in one turn. Require an actual turn-order check, especially if Trick Room is present.
- The strongest failures to investigate are interruption or redirection of Beat Up, special Water/Grass/Ice pressure into Mudsdale, and denial of the payoff. Fake Out can interrupt Maushold; opposing Follow Me or Rage Powder can redirect ally-targeted Beat Up. Haze removes the boosts. Ghosts are immune to Body Press, and an Unaware defender ignores the Defense boosts used by it. High Horsepower/Heavy Slam provide different attacks, without inheriting Body Press's Defense scaling. [redirection](../.cache/showdown/sim/pokemon.ts#L829), [Follow Me](../.cache/showdown/data/moves.ts#L6061), [Rage Powder](../.cache/showdown/data/moves.ts#L14611), [Haze](../.cache/showdown/data/moves.ts#L8156), [Unaware](../.cache/showdown/data/abilities.ts#L5216)

## Concrete starting sets, not a finished team

The following complete individual sets returned no errors from the pinned community `TeamValidator('gen9championsvgc2026regmc')`. This is set validation against that engine, not official-game certification or a tested four/six-member team. Items differ in the recommended pair.

| Pokémon | Ability / item / nature | Four moves | Champions stat-point allocation |
| --- | --- | --- | --- |
| Mudsdale | Stamina / Leftovers / Impish | Body Press, High Horsepower, Heavy Slam, Protect | HP 32, Def 32, SpD 2 |
| Maushold | Friend Guard / Sitrus Berry / Timid | Beat Up, Follow Me, Helping Hand, Protect | HP 32, Def 2, Spe 32 |
| Persian-Alola | Fur Coat / Sitrus Berry / Timid | Beat Up, Fake Out, Snarl, Parting Shot | HP 32, Def 2, Spe 32 |
| Whimsicott | Prankster / Focus Sash / Timid | Beat Up, Tailwind, Encore, Protect | HP 32, Def 2, Spe 32 |

All IVs were 31; unspecified stat points were zero. These are explicit starting allocations, not optimized spreads. An initial attempt to soften Beat Up with a 0 Attack IV was rejected: this Champions format requires all IVs at 31. Timid lowers the supporter's Attack without that invalid IV assumption. The Archaludon control additionally returned `Archaludon can't learn Body Press.` [Champions learnsets: Mudsdale](../.cache/showdown/data/mods/champions/learnsets.ts#L12718), [Archaludon](../.cache/showdown/data/mods/champions/learnsets.ts#L16695)

## Executed graph retrieval

Executed against `pokemon_mc_202609`, whose Snapshot reported format `gen9championsvgc2026regmc`, revision `a833737d8408322c8b1e821dee16af07b1fd9234`, and completed import. The official-number/catalog filters are retrieval filters; they do not substitute for set validation. The local cached source at the same revision supplied the mechanics evidence above.

```cypher
MATCH (s:Species)-[:HAS_ABILITY]->(a:Ability {id:'Ability:stamina'}),
      (s)-[:LEARNS]->(m:Move {id:'Move:bodypress'})
WHERE s.inChampionsCatalog=true AND s.officialNumberPresent=true
RETURN s.id,s.name,s.def,s.spd,s.spe
```

Returned `["Species:mudsdale","Mudsdale",100,85,35]` only. The unjoined ability retrieval had returned both Mudsdale and Archaludon for Stamina.

The initial provider query also compared alternate multi-hit/critical-hit mechanisms:

```cypher
MATCH (s:Species)-[:LEARNS]->(m:Move)
WHERE s.inChampionsCatalog=true AND s.officialNumberPresent=true
AND m.id IN ['Move:beatup','Move:watershuriken','Move:bulletseed',
            'Move:populationbomb','Move:surgingstrikes','Move:frostbreath']
RETURN s.id,s.name,m.id,s.atk,s.spe,s.sampleSetValidated
```

Relevant returned rows included Maushold/Beat Up (base Atk 75, Spe 111), Persian-Alola/Beat Up (60,115), Whimsicott/Beat Up (67,116), and Greninja/Water Shuriken (95,122). These are base stats, not resulting battle stats. Follow-up `LEARNS` and `HAS_ABILITY` queries for those candidates returned the support moves and abilities in the comparison table; their joint sets were checked separately with the validator.

Operational note: after the parent's database-container recreation, a later reconnect returned no Snapshot or catalog rows. The positive retrievals above occurred before that interruption; their key inclusion/exclusion was cross-checked against the pinned local engine. Restore the catalog before rerunning graph discovery. An empty/unavailable import is not evidence that a move or species is absent.

## The next investigation

Supply one opposing lead and the other two Pokémon intended for the bring. Then measure Beat Up's self-damage, whether Maushold acts before Mudsdale, and whether Mudsdale survives the opponents' available special attacks long enough to use Body Press. Compare that same position with Persian's disruption and Whimsicott's speed/powder advantages. No matchup damage calculations, battle traces, prevalence estimates, win rates, or global-optimality claims were produced here. The useful result is a specific, source-supported core and a narrowed set of questions that could reject it.
