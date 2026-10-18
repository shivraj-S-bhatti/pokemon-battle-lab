# Connect agents to FalkorDB

The official [`@falkordb/mcpserver`](https://github.com/FalkorDB/FalkorDB-MCPServer)
is pinned to **1.3.0** in this directory. Both clients launch `start.sh` over
stdio and connect to the existing database at `127.0.0.1:6388`. This connection
uses no password or external LLM API key.

## Open the connection

1. Keep the existing FalkorDB container running. From the repository root,
   restore dependencies with `npm ci --prefix workbench/mcp` if needed.
2. **Codex:** `pokemon-falkordb` is registered in the actual user configuration.
   Restart the client or its MCP server, then use `/mcp` to inspect the connection.
   `codex mcp get pokemon-falkordb --json` verifies the saved registration.
3. **Claude Code:** start `claude` from this repository, approve the
   `pokemon-falkordb` entry from `.mcp.json` when prompted, and inspect `/mcp`.
   `claude mcp get pokemon-falkordb` reports its current approval/connection state.

Codex also has a project entry in `.codex/config.toml`, but this installed client
does not load it until this exact repository is trusted. The working user-level
registration avoids requiring that trust change. It is visible in other Codex
projects too. Existing trust and tool approval settings are unchanged.

The current chat does not gain newly configured tools automatically. Restart or
reload before asking the agent to use them. Claude's first-use server approval
remains pending; the setup did not bypass it.

## Query conventions

Treat `pokemon_mc_202609` as source data. Use `query_graph_readonly` against it.
The database remains writable: this convention is not an ACL. Put experimental
graphs in the `gk_*` namespace and use `query_graph` for authorized writes.

Example tool arguments:

```json
{
  "graphName": "pokemon_mc_202609",
  "query": "MATCH (n) RETURN labels(n) AS labels, count(n) AS nodes ORDER BY nodes DESC LIMIT 10"
}
```

Discovered tools: `query_graph`, `query_graph_readonly`, `list_graphs`,
`delete_graph`, `get_graph_schema`, `get_node_schema`, and
`get_relationship_schema`. No HTTP MCP port is opened; each client starts its
own stdio process.

## Verify or reinstall

```sh
cd /Users/apple/Projects/pokemon-core-lab
npm ci --prefix workbench/mcp
npm run --prefix workbench/mcp smoke
```

The smoke test initializes the configured server, lists its tools, lists graphs,
and reads catalog node counts, relationship counts, and label counts. It writes
`smoke-evidence.json`. On 2026-10-18 it observed **3,877 nodes** and **151,201
relationships** in `pokemon_mc_202609`; all four tool calls succeeded. It did not
write to any graph.

To restore the working Codex registration:

```sh
codex mcp add pokemon-falkordb -- /bin/sh /Users/apple/Projects/pokemon-core-lab/workbench/mcp/start.sh
```

The launcher paths in both client configurations are specific to this checkout.
Update them if moving it. Node.js 18+ is required. The launcher uses the current
PATH, with `/opt/homebrew/bin/node` as the macOS fallback. Upstream 1.3.0 creates
`~/Library/Logs/falkordb-mcp/0.1.0` during initialization even when file logging
is disabled; a sandbox that denies that directory can prevent startup.

Configuration references: [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
and [Claude Code MCP](https://code.claude.com/docs/en/mcp).
