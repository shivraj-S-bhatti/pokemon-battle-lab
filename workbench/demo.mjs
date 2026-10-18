// Reproducible API walkthrough. Uses its own temporary FalkorDB graph and leaves live UI runs alone.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {connect} from '../scripts/db.mjs';
import {createWorkbench} from './backend/server.mjs';

const output=resolve(process.argv[2]||'.artifacts/workbench/demo-run.json');
const graph=`pokemon_workbench_demo_${process.pid}_${Date.now()}`;
const client=await connect();let app;
const report={recordedAt:new Date().toISOString(),kind:'scripted API walkthrough',storage:'FalkorDB',graph,
  scope:'Authored conditional plans and typed interventions. No LLM call, battle simulation, win-rate estimate, or edited-team legality certification.',steps:[]};
try {
 app=await createWorkbench({client,graph});
 await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${app.server.address().port}`;
 const get=async path=>{const r=await fetch(base+path);assert.equal(r.status,200);return r.json();};
 async function analyze(caseId,interventions=[],pinned=[]){
  const c=await get('/api/context?case='+caseId);
  const request={caseId,expectedGraphRevision:c.meta.graphRevision,interventions,pinned};
  const response=await fetch(base+'/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(request)});
  assert.equal(response.status,200);const result=await response.json();
  const handoff=await get('/api/context?case='+caseId);
  assert.equal(handoff.latestRun.runId,result.run.runId);assert.equal(handoff.latestRun.stale,false);
  assert.deepEqual(handoff.latestRun.result.scenario,result.scenario);
  return {request,result};
 }
 const plan=(a,id)=>{const p=a.result.plans.find(p=>p.id===id);assert(p,`Missing goal ${id}`);return p;};
 const route=(a,id)=>{const r=a.result.routes.find(r=>r.id===id);assert(r,`Missing route ${id}`);return r;};
 function retain(title,a,goalIds){
  const goals=goalIds.map(id=>plan(a,id));
  const step={title,request:a.request,run:a.result.run,graph:a.result.graph,
    acceptedTeam:a.result.scenario.team,assessments:a.result.scenario.conditions,proposalResults:a.result.interventionResults,
    goals:goals.map(p=>({id:p.id,status:p.status,routes:p.routeOptions.map(r=>({id:r.id,status:r.status,outcomes:r.outcomes,unresolved:r.unknown.map(c=>c.id),missing:r.missing.map(c=>c.id),evidence:r.evidence}))})),
    battleSimulations:a.result.scope.battleSimulations};
  report.steps.push(step);console.log(`${title}\n  ${step.goals.map(p=>`${p.id}: ${p.status}`).join(' | ')}`);
 }
 const bss=await analyze('sableye-slowking-bss');
 assert.equal(plan(bss,'three-slot-progress').status,'blocked');retain('1. Two defensive members leave an actual third-slot gap',bss,['three-slot-progress']);
 const third=await analyze('sableye-slowking-bss',[{type:'add_member',speciesId:'garchomp'}]);
 assert.equal(plan(third,'three-slot-progress').status,'unknown');retain('2. Add Garchomp: structure improves; matchup checks stay unknown',third,['three-slot-progress']);
 const pin=await analyze('sableye-slowking-bss',[{type:'remove_member',speciesId:'sableyemega'}],['sableyemega']);
 assert.equal(pin.result.interventionResults[0].applied,false);assert(pin.result.scenario.team.includes('sableyemega'));
 retain('3. A pinned removal stays a rejected proposal',pin,['fairy-pivot']);
 const removed=await analyze('simplebeam-torterra',[{type:'remove_member',speciesId:'farfetchd'}]);
 assert.equal(route(removed,'beam-smash:amplified').status,'blocked');assert.equal(route(removed,'purpose:boost-torterra:direct').status,'unknown');
 retain('4. Lose amplification, retain ordinary setup and Decorate',removed,['beam-smash','purpose:boost-torterra']);
 const hypothetical=await analyze('simplebeam-torterra',[{type:'remove_member',speciesId:'farfetchd'},{type:'set_condition',conditionId:'direct-smash:window',truth:true}]);
 assert.equal(route(hypothetical,'purpose:boost-torterra:direct').status,'enabled');
 assert.equal(route(hypothetical,'beam-smash:amplified').status,'blocked');
 assert.equal(hypothetical.result.conditionStates['direct-smash:window'].assessmentStatus,'assumed');
 retain('5. Hypothetical safe setup enables only the ordinary route',hypothetical,['beam-smash','purpose:boost-torterra']);
 const dependencies=await get('/api/affected?case=simplebeam-torterra&member=farfetchd');
 assert(dependencies.dependencies.some(d=>d.goal.id==='beam-smash'));
 report.affectedByFarfetchd=[...new Set(dependencies.dependencies.map(d=>d.goal.id))];
 const alternative=await analyze('simplebeam-torterra',[{type:'replace_move',setId:'torterra-smash',from:'earthquake',to:'headlongrush'}]);
 assert.equal(route(alternative,'purpose:ground-without-friendly-fire:targeted').status,'unknown');
 assert.equal(plan(alternative,'earthquake-partner').status,'blocked');
 retain('6. Change the Ground move: preserve purpose, lose spread route',alternative,['earthquake-partner','purpose:ground-without-friendly-fire']);
 const groundSwap=await analyze('torterra-raichuy-milotic',[{type:'replace_move',setId:'torterra-guard',from:'headlongrush',to:'earthquake'}]);
 assert.equal(route(groundSwap,'avoid-friendly-fire:headlong').status,'blocked');
 assert.equal(route(groundSwap,'avoid-friendly-fire:protect').status,'unknown');
 assert.equal(groundSwap.result.comparison.changes.length,0);
 retain('7. Doubles: same goal status, different surviving Ground route',groundSwap,['avoid-friendly-fire']);
 const doubles=await analyze('torterra-raichuy-milotic',[{type:'replace_move',setId:'torterra-guard',from:'wideguard',to:'earthquake'}]);
 // Fail rather than silently accepting an invalid or stale demonstration proposal.
 assert.equal(doubles.result.interventionResults[0].applied,true);
 assert.equal(plan(doubles,'wideguard-window').status,'blocked');
 assert.equal(plan(doubles,'avoid-friendly-fire').status,'unknown');
 retain('8. Doubles: losing Wide Guard does not erase single-target Ground play',doubles,['wideguard-window','avoid-friendly-fire']);
 report.graphSize={nodes:(await app.store.q('MATCH (n) RETURN count(n)'))[0][0],edges:(await app.store.q('MATCH ()-[e]->() RETURN count(e)'))[0][0]};
 report.checks='passed';
 await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(report,null,2)+'\n');
 console.log(`\nPassed. Evidence: ${output}\nTemporary graph removed; existing workbench runs preserved.`);
} finally {
 await app?.close();
 try {await client.sendCommand(['GRAPH.DELETE',graph]);} finally {await client.quit();}
}
