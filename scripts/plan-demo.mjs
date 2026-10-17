import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {connect, query, rows} from './db.mjs';

// A manually extracted development fixture. These are attributed strategic
// claims, not verified battle outcomes or automatically extracted video data.
const source = 'https://www.reddit.com/r/PokemonChampions/comments/1wwsk73/after_a_million_calculations_and_practice_games_i/';
const format = 'gen9championsvgc2026regmc';
const plans = [
  {id:'electric-cover', name:'Protect Clawitzer from an Electric attack', role:'lightning-rod',
    member:'sceptile', evidence:'Author describes Sceptile providing Lightning Rod support against Raichu.',
    condition:'Support must be active and the attack must be redirectable; source claim, mechanics not simulated.'},
  {id:'priority-cover', name:'Interrupt an opposing priority move', role:'upper-hand',
    member:'sceptile', evidence:'Author describes Upper Hand support against Grassy Glide.',
    condition:'Opponent must choose an eligible priority attack; this does not stop ordinary Wood Hammer.'},
  {id:'gholdengo-pressure', name:'Pressure Gholdengo with Dark Pulse', role:'dark-pulse',
    member:'clawitzer', evidence:'Author reports Dark Pulse damage and identifies opposing double-targeting as a problem.',
    condition:'Clawitzer must survive to act; actual damage depends on the opposing set and battle state.'},
  {id:'garchomp-pressure', name:'Pressure Garchomp with Dragon Pulse', role:'dragon-pulse',
    member:'clawitzer', evidence:'Author reports a Dragon Pulse damage threshold against Garchomp.',
    condition:'Damage threshold needs calculator verification against the specific form, spread, item and field.'},
];
const graph = 'pokemon_plan_demo_v1';
const catalog = 'pokemon_mc_202609';
const client = await connect();
const require = createRequire(import.meta.url);
const {TeamValidator} = require('../.cache/showdown/dist/sim/team-validator.js');
const validator = new TeamValidator(format);
const generatedAt = new Date().toISOString();

async function insert(label, id, properties) {
  await query(client, graph, `MERGE (n:${label} {id:$id}) SET n += $properties`, {id, properties});
}
async function link(leftLabel, left, type, rightLabel, right) {
  await query(client, graph,
    `MATCH (a:${leftLabel} {id:$left}), (b:${rightLabel} {id:$right}) MERGE (a)-[:${type}]->(b)`, {left,right});
}
async function evaluate(removed) {
  const result = rows(await query(client, graph, `
    MATCH (p:Plan)-[:REQUIRES]->(r:Role)
    OPTIONAL MATCH (r)-[:PROVIDED_BY]->(m:Member)
    WHERE NOT m.id IN $removed
    RETURN p.id,p.name,r.id,collect(m.id)`, {removed}));
  const grouped = new Map();
  for (const [id,name,role,providers] of result) {
    if (!grouped.has(id)) grouped.set(id,{id,name,missingRoles:[]});
    if (!providers.length) grouped.get(id).missingRoles.push(role);
  }
  return [...grouped.values()].map(p=>({...p,documentedSupportAvailable:p.missingRoles.length===0})).sort((a,b)=>a.id.localeCompare(b.id));
}
try {
  await insert('Source','reddit-clawitzer',{url:source, ingestedAt:generatedAt,
    publicationTimeKnown:false, evidenceType:'author_report', extractionMethod:'manual',
    format:'Champions doubles', regulationConfirmedBySource:false});
  for (const p of plans) {
    await insert('Plan',p.id,{name:p.name,condition:p.condition,status:'attributed_claim'});
    await insert('Role',p.role,{name:p.role});
    await insert('Member',p.member,{name:p.member});
    await insert('Claim',p.id,{text:p.evidence,verifiedMechanically:false});
    await link('Plan',p.id,'REQUIRES','Role',p.role);
    await link('Role',p.role,'PROVIDED_BY','Member',p.member);
    await link('Claim',p.id,'JUSTIFIES','Plan',p.id);
    await link('Claim',p.id,'FROM','Source','reddit-clawitzer');
  }
  const before = await evaluate([]);
  const after = await evaluate(['sceptile']);
  const affected = after.filter(p=>!p.documentedSupportAvailable);
  // Independent evaluation over the same fixture checks the traversal, not
  // extraction truth. An unaffected negative control prevents blanket invalidation.
  assert(before.every(p=>p.documentedSupportAvailable));
  assert.deepEqual(affected.map(p=>p.id),plans.filter(p=>p.member==='sceptile').map(p=>p.id).sort());
  assert(after.find(p=>p.id==='gholdengo-pressure').documentedSupportAvailable);

  const candidateQuery = `MATCH (s:Species)-[:HAS_ABILITY]->(:Ability {id:'Ability:lightningrod'}),
    (s)-[:LEARNS]->(:Move {id:'Move:upperhand'})
    WHERE s.sampleSetValidated = true AND s.name <> 'Sceptile-Mega'
    RETURN DISTINCT s.name ORDER BY s.name`;
  const candidates = rows(await query(client,catalog,candidateQuery)).map(([species])=>{
    const partialSet={species,name:species,ability:'Lightning Rod',moves:['Upper Hand'],
      item:'',level:50,nature:'Serious',evs:{hp:32,atk:0,def:0,spa:0,spd:2,spe:32},
      ivs:{hp:31,atk:31,def:31,spa:31,spd:31,spe:31}};
    const errors=validator.validateSet(structuredClone(partialSet),{}) || [];
    return {species,partialSet,validationErrors:errors,passesPinnedSimulatorSetValidator:errors.length===0};
  });
  assert(candidates.some(c=>c.species==='Raichu' && c.passesPinnedSimulatorSetValidator));
  const evidencePaths=rows(await query(client,graph,`
    MATCH (s:Source)<-[:FROM]-(c:Claim)-[:JUSTIFIES]->(p:Plan)-[:REQUIRES]->(r:Role)-[:PROVIDED_BY]->(m:Member)
    WHERE m.id='sceptile' RETURN p.name,r.name,c.text,s.url ORDER BY p.name`));
  const report={generatedAt,graph,catalog,source,formatForCandidateValidation:format,
    before,scenario:{kind:'counterfactual',removedMember:'sceptile'},after,affected,
    evidencePaths,candidates,
    nextAction:'Compare candidate speed, bulk, damage and lost Sceptile roles before proposing any team substitution.',
    checks:{allFourInitiallySupported:true,onlyTwoDependentPlansAffected:true,unrelatedDamagePlanPreserved:true,raichuPartialSetValid:true},
    limits:['Manual source extraction; no video pipeline or autonomous agent implemented by this script.',
      'Support availability is not proof a plan succeeds. Conditions and counterplay remain explicit.',
      'Candidate validation uses a pinned community simulator and one-move partial sets, not full-team legality or game parity.',
      'Source regulation/publication time are unconfirmed; M-C is an explicit candidate-validation assumption.',
      'This counterfactual is not a historical event. No meta time series or win rate is inferred.',
      'Graph traversal equals a simple in-memory dependency check here; no graph-specific quality/speed advantage claimed.']};
  await fs.writeFile('research/evidence/plan-demo.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({graph,affected:affected.map(p=>p.name),candidates,nextAction:report.nextAction,checks:report.checks,limits:report.limits},null,2));
} finally {await client.quit();}
