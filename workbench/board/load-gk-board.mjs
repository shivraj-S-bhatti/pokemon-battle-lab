// Loads the symbolic discussion board (board.json + native checks) into FalkorDB graph gk_board.
// Run from repo root: node workbench/board/load-gk-board.mjs   (rebuilds gk_board only)
import fs from 'node:fs';
import { connect, query } from '../../scripts/db.mjs';

const read = p => JSON.parse(fs.readFileSync(new URL(p, import.meta.url)));
const B = read('./board.json');
const staraptor = read('./checks/staraptor-memento.json');
const G = B.graph;
const toID = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

const c = await connect();
const q = (cy, p = {}) => query(c, G, cy, p);
await q('MATCH (n) DETACH DELETE n');

const mon = name => q('MERGE (m:Mon {id:$id}) ON CREATE SET m.name = $name', { id: toID(name), name });
for (const s of B.sources) await q('CREATE (:Source {id:$id, label:$label, path:$path})', { id: s.id, label: s.label, path: s.path ?? '' });

for (const p of B.plans) {
  await q('CREATE (:Plan {id:$id, title:$title, format:$format, status:$status, summary:$summary, verdict:$verdict})',
    { id: p.id, title: p.title, format: p.format, status: p.status, summary: p.summary, verdict: p.verdict });
  for (const u of p.uses) { await mon(u.mon); await q('MATCH (p:Plan {id:$p}), (m:Mon {id:$m}) CREATE (p)-[:USES {role:$role}]->(m)', { p: p.id, m: toID(u.mon), role: u.role }); }
  for (const k of p.conditions)
    await q('MATCH (p:Plan {id:$p}) CREATE (p)-[:NEEDS]->(:Condition {id:$id, text:$text, status:$status, decisive:$decisive})', { p: p.id, ...k });
  for (const [list, rel] of [[p.targets, 'TARGETS'], [p.acceptedLosses, 'ACCEPTS_LOSS'], [p.notChanged, 'UNCHANGED_BY_PLAN']])
    for (const t of list) { await mon(t.mon); await q(`MATCH (p:Plan {id:$p}), (m:Mon {id:$m}) CREATE (p)-[:${rel} {why:$why, status:$status}]->(m)`, { p: p.id, m: toID(t.mon), why: t.why, status: t.status }); }
  for (const t of p.threats) {
    await q('MATCH (p:Plan {id:$p}) CREATE (p)-[:BLOCKED_BY]->(:Threat {id:$id, name:$name, effect:$effect, status:$status})', { p: p.id, id: `${p.id}:${toID(t.name)}`, name: t.name, effect: t.effect, status: t.status });
    for (const m of t.mons) { await mon(m); await q('MATCH (t:Threat {id:$t}), (m:Mon {id:$m}) CREATE (m)-[:CARRIES]->(t)', { t: `${p.id}:${toID(t.name)}`, m: toID(m) }); }
  }
  for (const s of p.sources) await q('MATCH (p:Plan {id:$p}), (s:Source {id:$s}) CREATE (p)-[:FROM]->(s)', { p: p.id, s });
}
for (const p of B.plans) for (const a of p.alternatives)
  await q('MATCH (p:Plan {id:$p}), (a:Plan {id:$a}) CREATE (a)-[:ALTERNATIVE_TO]->(p)', { p: p.id, a });

// Native calculator rows, attached to the plan they decide and the defender they test.
for (const r of staraptor.rows) {
  const id = `staraptor:${toID(r.target)}:${r.boost}`;
  await mon(r.target);
  await q(`MATCH (p:Plan {id:'memento-staraptor'}), (m:Mon {id:$m})
           CREATE (p)-[:CHECKED_BY]->(k:Check {id:$id, question:$question, ko:$ko, fullDesc:$desc, status:$status, calculator:$calc})-[:AGAINST]->(m)`,
    { m: toID(r.target), id, question: `Mega Staraptor ${r.move} at +${r.boost} Atk into ${r.target}`,
      ko: r.kochance?.text ?? '', desc: r.fullDesc ?? '', status: r.status === 'calculated' ? 'native_checked' : 'native_partial', calc: staraptor.calculator });
}

const counts = await q('MATCH (n) RETURN labels(n)[0] AS l, count(n) ORDER BY l');
console.log(JSON.stringify(counts[1]));
await c.quit();
