# Gimmikghoul submission kit

Video script, blog post, and paste-ready answers for the Graph Hacks form.

## Demo setup (what's on screen)

Left: Claude Code. Right: FalkorDB Browser at http://localhost:4319, graph `gk_jit`. Skip the old web UI.

Before recording:

```sh
docker compose up -d --wait
node workbench/jit/build-jit.mjs 1
```

Then have Claude run steps 2 to 6 on camera. After each step, paste that step's query into the Browser.

## Video script (about 3 minutes)

**0:00 Hook.** Browser shows the finished `gk_meta` archetype graph (query below). "Bots can now beat top players at Pokémon. None of them can tell you whether your favourite has a place in the meta. That's what this does."

```cypher
MATCH p=(a:Mon)-[:CORE]-(b:Mon) RETURN p
```

**0:20 The ask.** Type into Claude: "I like Alcremie. Nobody runs it. Where does it have a job right now?"

**0:35 Seed** (step 1). "The agent starts a fresh idea graph in FalkorDB."
`MATCH p=(:Mon)-[:CORE]->(:Mon) RETURN p`

**0:50 What can help a partner** (step 2). "From the game's own data, it indexes every move that can boost an ally, and every stat drop that flips into a boost on a Contrary partner. Decorate is one of six. Memento into Mega Staraptor is one of the flips."
`MATCH p=(:Mon)-[:CAN_LEARN]->(:Move)-[:ENABLES]->(:Mon) RETURN p`

**1:15 What +2 actually buys** (step 3). "Now the damage calculator. With Decorate, Mega Garchomp Z's Draco Meteor one-shots Rillaboom, Incineroar, Archaludon and Mega Charizard Y. Without it, it doesn't."
`MATCH p=(:Mon {onTeam:true})-[r:OHKO_AT_PLUS2|NOT_OHKO_AT_PLUS2|CALC_NOT_COMPLETED]->(:Mon) RETURN p`

**1:40 The gap** (step 5). "Here's the meta's hole: Venusaur's Sleep Powder is everywhere, and almost nothing answers sleep. Alcremie's Sweet Veil keeps itself and its partner awake. And ten of the top thirty sets hit with contact moves, which its Rocky Helmet punishes."
`MATCH p=(:Mon {id:'alcremie'})-[:BLOCKS|HELMET_OPPORTUNITY]->() RETURN p`

**2:05 What to play around** (step 4). "Every plan has counterplay. Follow Me and Rage Powder steal Decorate, so you lead differently. Fairy types ignore Draco Meteor."
`MATCH p=()-[:COUNTERPLAY]->(:Mon {onTeam:true}) RETURN p UNION MATCH p=(:Mon {onTeam:true})-[:NO_EFFECT]->() RETURN p`

**2:25 Other supports** (step 6). "Coaching, Howl and Aromatic Mist can support an ally too, but none raises Special Attack, so none does Decorate's job here."
`MATCH p=(:Mon)-[:OTHER_SUPPORT]->(:Move {id:'decorate'}) RETURN p`

**2:40 Payoff.** "This is the core London Faust took to top 16 at Louisville Regionals, the second-biggest event of the season. The graph got there from the data. Gimmikghoul: find the gap in the meta where your favourite has a job."

## Blog post

### Your favourite Pokémon is unemployed. A graph can find it a job.

Competitive Pokémon bots got good this year. A neural net plus a one-turn search now tops the Showdown ladders. Team building is still unsolved. Two six-Pokémon teams, each with moves, items, abilities and stat spreads, give a space nobody searches exhaustively, and "is this team good?" has no single answer. It depends on who you face and how you play.

Ask a language model to build you a team and you get the popular six. Ask it why a weird pick works and it guesses. The problem as a whole is out of distribution. The pieces are not.

**Break it into questions a model can answer, and let a graph hold the answers.**

- *Which moves can boost an ally?* A lookup over move data: target type, stat changes.
- *What does the meta fail to answer?* Count, over usage data, which top Pokémon have no answer to sleep.
- *Does +2 Special Attack turn Draco Meteor into a one-hit KO on Rillaboom?* One damage calculation.
- *What stops the plan?* Which common sets carry Follow Me or Rage Powder.

Each of these is small and checkable. FalkorDB stores the catalog (species, moves, abilities, usage, teammates) and a fresh graph for each idea. The agent writes what it learns into that idea graph and composes a core from it. The Browser shows the graph growing.

We tried it on Alcremie, a Pokémon outside the top 100. The graph found that sleep is a hole in the current meta, that Alcremie's Sweet Veil fills it, and that Decorate turns Mega Garchomp Z's Draco Meteor into one-hit KOs on four of the most common threats. That is the core a player took to top 16 at Louisville Regionals.

**A working formula for creativity.** A new idea scores well when a common hole meets a rare enabler with a real payoff:

```text
idea  ≈  hole exposure  ×  enabler rarity  ×  payoff on your targets
         ─────────────────────────────────────────────────────────
                     turns and slots it costs
```

It's a rough ordering heuristic, not a measured efficiency. Counterplay isn't in the formula. It's the condition you learn to play around: lead differently into Indeedee, don't Decorate into Rage Powder.

**What the graph did that the model couldn't.** A Cypher variable-length path search over a graph of stat effects found multi-step plans no single prompt surfaced. One was Audino's Simple Beam on Snorlax, three Stockpiles to +6, then Slowbro copying the boosts with Psych Up and Mega Evolving. That's a real community team, and the search found it without being told. FalkorDB's label propagation over teammate data split the meta into its archetypes (rain, Trick Room, Psychic Terrain, sand). A gap query found pairs the mechanics say should work together but nobody plays.

**What we learned.** Most of our early effort went into making reasoning reliable on three hand-written cases. That was the wrong problem. Players don't need a proof; they need a direction and the one calculation that settles a choice. The graph earned its place where the work was search over connected data: chains of effects, archetypes, gaps.

Built for Graph Hacks with FalkorDB. Code and setup: https://github.com/shivraj-S-bhatti/pokemon-battle-lab

## Form answers

**Project title:** Gimmikghoul: find your favourite Pokémon a job in the meta

**Description:** Gimmikghoul is an agent plus a FalkorDB graph that finds gaps in the competitive Pokémon meta and the unpopular Pokémon that can fill them. You name a Pokémon you like; the agent queries a graph of species, moves, abilities, usage and teammates, finds a hole in the meta (for example, almost nothing answers sleep), finds how your Pokémon fills it, checks the payoff with the official damage calculator, and lists the counterplay you'll need to play around. The idea graph is built live in FalkorDB and viewable in the Browser. It's for competitive players and content creators who build off-meta teams, and for anyone curious how an agent can reason over game mechanics instead of guessing.

**Track:** Agents That Act on Connected Data. (Optionally also Agent Memory and Coordination: each idea graph persists between sessions and several agents read and write the same graphs.)

**Repository:** https://github.com/shivraj-S-bhatti/pokemon-battle-lab

**Demo video:** (your YouTube link)

**Live demo:** Local setup: `docker compose up -d --wait`, `npm run prepare:data`, `npm run export:data`, `npm run ingest`, `node workbench/tools/prepare-calculator.mjs`, then `node workbench/jit/build-jit.mjs 1` through `6`. Browser at http://localhost:4319.

**How did you use FalkorDB?**
FalkorDB is the core of the product. It holds three kinds of graph:
1. **Catalog:** Pokémon Champions species, moves, abilities, types and learnsets, plus September Reg M-C usage snapshots with teammate co-usage. Source: the pinned Showdown engine and public Smogon stats.
2. **Exploration graphs:**
   - `gk_meta`: co-usage, mechanics and checks. We ran FalkorDB's label propagation, PageRank and betweenness on it to find the meta's archetypes and the bridge Pokémon between them. A Cypher gap query finds pairs where one Pokémon provides a mechanic another abuses, but nobody plays them together.
   - `gk_chain`: a graph of stat effects. A variable-length path query (`MATCH p=(s:Effect)-[:ENABLES*2..5]->(w:Effect {kind:'win'})`) searches multi-step setup chains, about 4,400 paths in around 110 ms, and rediscovered a real community team without being told about it.
3. **Idea graph** (`gk_jit`): built per idea by the agent. It holds the seed team, ally-boost moves derived from engine target and boost data, damage-calculator results on edges, counterplay and alternatives.

The agent reaches FalkorDB through the official MCP server. The Browser, with Pokémon sprites on nodes, is the human view.

Technical problems we solved with it:
- Representing multi-Pokémon interactions (a setter, a redirector and an attacker together) as plan and route nodes instead of pairwise edges.
- Bounding variable-length path queries so chain search stays fast.
- Keeping the catalog separate from disposable exploration graphs.

**Blog link:** (where you post the blog above)

**What did you like about FalkorDB?** Graph algorithms run inside the database: label propagation, PageRank, betweenness and BFS each finished in milliseconds on our graphs, with no export step. Variable-length path queries made chain search a one-liner. Docker setup took minutes, and the official MCP server let our agent query the graph directly. The Browser made the idea graph easy to show.

**What improvements would you like?**
- Silent result caps: queries stop at 10,000 rows with no warning, which can hide results from a looser path query.
- Styling: per-relationship colours and per-node images in the Browser would help, since we patched the Browser to show sprites.
- `shortestPath` is only allowed in WITH or RETURN, which tripped us up.
- Procedures are easier to discover from `dbms.procedures()` than from the docs.

## AI disclosure (put in the README)

Built with Claude Code and Codex as coding assistants. Shivraj chose the problem, the cases and the scope, reviewed each step, and corrected the agents' mechanics and claims throughout.
