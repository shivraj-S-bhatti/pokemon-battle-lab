# Gimmikghoul: find the team behind the trick

Track: **Agents That Act on Connected Data**

## Project description

A surprising Pokémon pairing is a starting point. Building around it means finding support, choosing the matchups that matter, and keeping another way to play when the trick is interrupted.

Gimmikghoul gives a player and coding agent a shared graph for that investigation. The recording example starts from a creator's Alcremie team report. Engine data supplies candidate support moves and learners. Native Champions damage calculations show what a boost changes against selected sets. The graph keeps those results beside the source's suggested modes, counterplay and alternative support directions. Pokémon sprites make the graph explorable in native FalkorDB Browser.

The demo grows in six steps: seed the reported cores, find support candidates, compare selected attacks before and after boosting, inspect counterplay, examine sleep protection and contact-chip opportunities, then retrieve other support directions. A stat-lowering move can become a boost candidate when paired with Contrary, provided its targeting permits an ally. Conditions such as redirection prompt a different line of play; they do not automatically disqualify a team.

FalkorDB holds the connected context. The agent can traverse Pokémon → learnable move → proposed recipient, inspect exact calculation conditions and retrieve alternatives through the installed MCP connection or CLI. The six-step recording is scripted; the player and agent choose the questions and interpret results. The graph is not a battle solver, and no team win rate or discovery advantage is claimed.

A separate minimal theory example saves a hypothesis and selected native check, revises the donor's item, and retains the earlier result as stale. Git preserves revisions. This example and the discussion graph are separate entry points in the current release.

## Run and record

- [Repository setup](../README.md)
- [Six-step recording runbook and graph queries](jit/README.md)
- [Exact selected calculator inputs and results](jit/checks/step3-decorate.json)
- [Theory revision example](../data/theories/memento-staraptor/README.md)
- [Agent connection through MCP](mcp/README.md)

Record the graph growing, inspect one calculation edge, and show how an agent uses a retrieved support candidate to propose the next question. Describe proposed candidates as proposals. The seed team and tournament result are attributed to the supplied creator material; this project did not invent that team.

## Disclosure and delivery

Shivraj supplied the problem framing, examples and product direction. Claude built the JIT demonstration and reviewed the theory loop. Codex implemented the underlying tools, integrated the workflow and reviewed mechanics and evidence handling. Existing research and generic infrastructure are retained; distinguish that history from graph work built during the event.

A working demo video must be added before submission. Registration, video upload and event submission are not recorded here as completed.

The [official event page](https://www.wemakedevs.org/hackathons/falkordb), checked October 18, requires FalkorDB to support a central product function. Local projects need complete setup instructions and a working demo video. Submissions close October 18 at **14:29 America/New_York**, corresponding to **23:59 IST**. Reused generic infrastructure is allowed; the submission and main FalkorDB implementation must be event work.
