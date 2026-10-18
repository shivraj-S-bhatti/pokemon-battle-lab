import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = new URL('../../', import.meta.url);
const config = JSON.parse(await readFile(new URL('.mcp.json', root), 'utf8'));
const server = config.mcpServers['pokemon-falkordb'];
const client = new Client({ name: 'pokemon-core-lab-mcp-smoke', version: '1.0.0' });
const transport = new StdioClientTransport({
  command: server.command,
  args: server.args,
  cwd: fileURLToPath(root),
  stderr: 'pipe',
});
let stderr = '';
transport.stderr?.on('data', chunk => { stderr += chunk; });
const evidence = {
  observedAt: new Date().toISOString(),
  package: '@falkordb/mcpserver@1.3.0',
  transport: 'stdio',
  endpoint: '127.0.0.1:6388',
  graph: 'pokemon_mc_202609',
  calls: [],
};
try {
  await client.connect(transport);
  evidence.initialize = client.getServerVersion();
  const tools = await client.listTools();
  evidence.tools = tools.tools.map(({ name, inputSchema }) => ({ name, inputSchema }));
  for (const name of ['list_graphs', 'query_graph', 'query_graph_readonly']) {
    if (!evidence.tools.some(tool => tool.name === name)) throw new Error(`Missing tool: ${name}`);
  }
  for (const call of [
    { name: 'list_graphs', arguments: {} },
    { name: 'query_graph_readonly', arguments: {
      graphName: evidence.graph,
      query: 'MATCH (n) RETURN count(n) AS nodes',
    } },
    { name: 'query_graph_readonly', arguments: {
      graphName: evidence.graph,
      query: 'MATCH ()-[r]->() RETURN count(r) AS relationships',
    } },
    { name: 'query_graph_readonly', arguments: {
      graphName: evidence.graph,
      query: 'MATCH (n) RETURN labels(n) AS labels, count(n) AS nodes ORDER BY nodes DESC LIMIT 10',
    } },
  ]) {
    const result = await client.callTool(call);
    evidence.calls.push({ ...call, result });
    if (result.isError) throw new Error(`Tool failed: ${call.name}`);
  }
  evidence.success = true;
} catch (error) {
  evidence.success = false;
  evidence.error = String(error);
  evidence.stderr = stderr;
  process.exitCode = 1;
} finally {
  await client.close();
  const output = new URL('smoke-evidence.json', import.meta.url);
  await writeFile(output, JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify(evidence, null, 2));
}
