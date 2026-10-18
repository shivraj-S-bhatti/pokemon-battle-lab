# Gimmikghoul submission kit

Video script, blog post, and paste-ready answers for the Graph Hacks form.

## Demo setup (what's on screen)

Left: Claude Code. Right: FalkorDB Browser at http://localhost:4319, graph `gk_jit`. Skip the old web UI.

Before recording:

```sh
docker compose --profile explore up -d --build --wait
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

**1:40 The gap** (step 5). "Here's the meta's hole: Sleep is one of the threats this team wants to answer. Alcremie's Sweet Veil keeps itself and its partner awake. And ten of the top thirty sets hit with contact moves, which its Rocky Helmet punishes."
`MATCH p=(:Mon {id:'alcremie'})-[:BLOCKS|HELMET_OPPORTUNITY]->() RETURN p`

**2:05 What to play around** (step 4). "Every plan has counterplay. Follow Me and Rage Powder steal Decorate, so you lead differently. Fairy types ignore Draco Meteor."
`MATCH p=()-[:COUNTERPLAY]->(:Mon {onTeam:true}) RETURN p UNION MATCH p=(:Mon {onTeam:true})-[:NO_EFFECT]->() RETURN p`

**2:25 Other supports** (step 6). "Coaching, Howl and Aromatic Mist can support an ally too, but none raises Special Attack, so none does Decorate's job here."
`MATCH p=(:Mon)-[:OTHER_SUPPORT]->(:Move {id:'decorate'}) RETURN p`

**2:40 Payoff.** "This is the core London Faust took to top 16 at Louisville Regionals, the second-biggest event of the season. We started from that attributed team and reconstructed its mechanisms with engine data and selected calculator checks. Gimmikghoul: find the gap in the meta where your favourite has a job."

## Blog post

The reviewed standalone post is [BLOG.md](BLOG.md). Public link: https://github.com/shivraj-S-bhatti/pokemon-battle-lab/blob/main/workbench/jit/BLOG.md

## Form answers

**Project title:** Gimmikghoul: find your favourite Pokémon a job in the meta

**Description:** Gimmikghoul is an agent plus a FalkorDB graph that finds gaps in the competitive Pokémon meta and the unpopular Pokémon that can fill them. You name a Pokémon you like; the agent queries a graph of species, moves, abilities, usage and teammates, finds a hole in the meta (for example, a team needs an answer to sleep), finds how your Pokémon fills it, checks the payoff with the pinned Champions-aware community damage calculator, and lists the counterplay you'll need to play around. The idea graph is built live in FalkorDB and viewable in the Browser. It's for competitive players and content creators who build off-meta teams, and for anyone curious how an agent can reason over game mechanics instead of guessing.

**Track:** Agents That Act on Connected Data. (Optionally also Agent Memory and Coordination: each idea graph persists between sessions and several agents read and write the same graphs.)

**Repository:** https://github.com/shivraj-S-bhatti/pokemon-battle-lab

**Demo video:** (your YouTube link)

**Live demo:** Local setup: `docker compose --profile explore up -d --build --wait`, `npm run prepare:data`, `npm run export:data`, `npm run ingest`, `node workbench/tools/prepare-calculator.mjs`, then `node workbench/jit/build-jit.mjs 1` through `6`. Browser at http://localhost:4319.

**How did you use FalkorDB?**
FalkorDB is the core of the product. It holds three kinds of graph:
1. **Catalog:** Pokémon Champions species, moves, abilities, types and learnsets, plus September Reg M-C usage snapshots with teammate co-usage. Source: the pinned Showdown engine and public Smogon stats.
2. **Exploration graphs:**
   - `gk_meta`: co-usage, mechanics and checks. We ran FalkorDB's label propagation, PageRank and betweenness on it to find the meta's archetypes and the bridge Pokémon between them. A Cypher gap query finds pairs where one Pokémon provides a mechanic another abuses, with low observed co-usage in the selected snapshot.
   - `gk_chain`: a graph of stat effects. A variable-length path query (`MATCH p=(s:Effect)-[:ENABLES*2..5]->(w:Effect {kind:'win'})`) searches multi-step setup chains, about 4,400 paths in around 110 ms, and surfaced a chain matching a community strategy. This was an exploratory run, not a blinded discovery evaluation.
3. **Idea graph** (`gk_jit`): built per idea by the agent. It holds the seed team, ally-boost moves derived from engine target and boost data, damage-calculator results on edges, counterplay and alternatives.

The agent reaches FalkorDB through the official MCP server. The Browser, with Pokémon sprites on nodes, is the human view.

Technical problems we solved with it:
- Representing multi-Pokémon interactions (a setter, a redirector and an attacker together) as plan and route nodes instead of pairwise edges.
- Bounding variable-length path queries so chain search stays fast.
- Keeping the catalog separate from disposable exploration graphs.

**Blog link:** https://github.com/shivraj-S-bhatti/pokemon-battle-lab/blob/main/workbench/jit/BLOG.md

**What did you like about FalkorDB?** Graph algorithms run inside the database: label propagation, PageRank, betweenness and BFS each finished in milliseconds on our graphs, with no export step. Variable-length path queries made chain search a one-liner. Docker setup took minutes, and the official MCP server let our agent query the graph directly. The Browser made the idea graph easy to show.

**What improvements would you like?**
- Silent result caps: queries stop at 10,000 rows with no warning, which can hide results from a looser path query.
- Styling: per-relationship colours and per-node images in the Browser would help, since we patched the Browser to show sprites.
- `shortestPath` is only allowed in WITH or RETURN, which tripped us up.
- Procedures are easier to discover from `dbms.procedures()` than from the docs.

## AI disclosure (put in the README)

Built with Claude Code and Codex as coding assistants. Shivraj chose the problem, the cases and the scope, reviewed each step, and corrected the agents' mechanics and claims throughout.
