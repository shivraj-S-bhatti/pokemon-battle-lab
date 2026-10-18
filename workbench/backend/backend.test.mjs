import http from 'node:http';
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {connect,query} from '../../scripts/db.mjs';
import {readFile} from 'node:fs/promises';
import {buildCaseModel} from '../logic/index.mjs';
import {createWorkbench} from './server.mjs';
let app,client,base;const graph=`pokemon_workbench_test_${process.pid}_${Date.now()}`;
before(async()=>{client=await connect();app=await createWorkbench({client,graph});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${app.server.address().port}`;});
after(async()=>{await app?.close();if(client){await client.sendCommand(['GRAPH.DELETE',graph]);await client.quit();}});
async function post(payload){return fetch(base+'/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});}
test('all three cases produce real graph and logic output, and context retains human edits',async()=>{
 const {cases}=await(await fetch(base+'/api/cases')).json();assert.equal(cases.length,3);
 for(const c of cases){const view=await(await fetch(base+'/api/graph?case='+c.id)).json();assert.equal(view.meta.storage,'FalkorDB');assert(view.nodes.some(n=>n.kind==='route'));assert(view.edges.some(e=>e.type==='HAS_ROUTE'));
  const response=await post({caseId:c.id,interventions:[{type:'remove_member',speciesId:c.speciesIds[0]}]});assert.equal(response.status,200);const a=await response.json();assert(a.plans.length);assert.equal(a.graph.name,graph);assert(!a.scenario.team.includes(c.speciesIds[0]));
  const context=await(await fetch(base+'/api/context?case='+c.id)).json();assert.equal(context.latestRun.runId,a.run.runId);assert.deepEqual(context.latestRun.request.interventions,[{type:'remove_member',speciesId:c.speciesIds[0]}]);
 }
});
test('stored graph rule changes analysis, proving evaluation does not rebuild hardcoded cases',async()=>{
 const id='simplebeam-torterra',b=await app.store.load(id),scope=await app.store.scope(id),route=b.model.routes.find(r=>r.goalId==='beam-smash');
 const exprKey=scope+'/routes/'+route.id+'/expression';
 const original=(await app.store.q('MATCH (n:WBNode {key:$key}) RETURN n.json',{key:exprKey}))[0][0];
 await app.store.q('MATCH (n:WBNode {key:$key}) SET n.json=$json',{key:exprKey,json:JSON.stringify({operator:'unsupported'})});
 const a=await(await post({caseId:id})).json();
 assert.deepEqual(a.model.routes.find(r=>r.id===route.id).requirements,{});
 assert.equal(a.plans.find(p=>p.id==='beam-smash').status,'unknown');
 await app.store.q('MATCH (n:WBNode {key:$key}) SET n.json=$json',{key:exprKey,json:original});
});
test('dependency traversal finds plans affected by a member or set',async()=>{
 const r=await(await fetch(base+'/api/affected?case=simplebeam-torterra&member=farfetchd')).json();assert(r.dependencies.some(d=>d.goal.id==='beam-smash'));
});
test('bad cases, oversized history, cross-origin writes and rebinding hosts are rejected',async()=>{
 assert.equal((await post({caseId:'missing'})).status,404);
 assert.equal((await post({caseId:'simplebeam-torterra',interventions:Array(101).fill({})})).status,400);
 assert.equal((await fetch(base+'/api/analyze',{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body:'{}'})).status,403);
 const status=await new Promise((resolve,reject)=>http.get(base+'/api/cases',{headers:{host:'evil.example'}},r=>{r.resume();resolve(r.statusCode)}).on('error',reject));assert.equal(status,403);
});
test('catalog retrieval returns engine catalog candidates rather than fixed case lists',async()=>{
 const r=await(await fetch(base+'/api/catalog?move=wideguard')).json();assert(r.candidates.length>0);assert(r.candidates.some(x=>x.id==='torterra'));assert(r.scope.includes('not a legal'));
});

test('graph roundtrip preserves expression structure and budgeted candidate order',async()=>{
 const bank=JSON.parse(await readFile(new URL('../../data/workbench-cases.json',import.meta.url)));
 for(const c of bank.cases){const original=buildCaseModel(c),stored=(await app.store.load(c.id)).model;
 assert.deepEqual(stored.routes.map(r=>r.requirements),original.routes.map(r=>r.requirements));
 assert.deepEqual(stored.candidateEdits,original.candidateEdits);
 }
});

test('outcomes belong to actual routes and shared facts retain every owner',async()=>{
 const b=await app.store.load('simplebeam-torterra');
 const {viewGraph}=await import('./store.mjs');const v=viewGraph(b);
 for(const r of b.model.routes){
  const yielded=v.edges.filter(e=>e.source==='route:'+r.id&&e.type==='YIELDS').map(e=>v.nodes.find(n=>n.id===e.target).label);
  assert.deepEqual(yielded,r.outcomes||[]);
 }
 assert(!v.edges.some(e=>e.type==='YIELDS'&&v.nodes.find(n=>n.id===e.source)?.kind==='plan'));
 const c=v.nodes.find(n=>n.id==='move:torterra:shellsmash');
 assert(c.planIds.includes('beam-smash'));assert(c.planIds.includes('purpose:boost-torterra'));assert(c.planIds.includes('purpose:restore-smash-defenses'));assert(c.routeIds.length>=3);assert.equal(c.planId,undefined);
});

test('load remains on its captured scope during concurrent publication',async()=>{
 const id='simplebeam-torterra',scope=await app.store.scope(id),q=app.store.q.bind(app.store);
 let switched=false;
 app.store.q=async(c,p)=>{const result=await q(c,p);if(c.includes('RETURN m.json')&&!switched){switched=true;await q('MATCH (c:WBNode {key:$key}) SET c.activeScope="unpublished-scope"',{key:'case:'+id});}return result;};
 try{const b=await app.store.load(id);assert(switched);assert(b.model.routes.every(r=>Object.keys(r.requirements).length));assert(scope.endsWith(b.version));}
 finally{app.store.q=q;await q('MATCH (c:WBNode {key:$key}) SET c.activeScope=$scope',{key:'case:'+id,scope});}
});

test('exports label historical analysis and stale clients must reload before analysis',async()=>{
 const id='simplebeam-torterra';const result=await(await post({caseId:id})).json();
 assert.match(result.graph.evaluatorRevision,/^[a-f0-9]{64}$/);
 let c=await(await fetch(base+'/api/context?case='+id)).json();assert.equal(c.latestRun.stale,false);assert.deepEqual(c.latestRun.result.graph,result.graph);
 const wrong=await post({caseId:id,expectedGraphRevision:'old-version'});assert.equal(wrong.status,409);
 assert.equal((await app.store.latestRun(id)).runId,result.run.runId);
 result.graph.revision='historical-version';await app.store.recordRun(id,{caseId:id},result);
 c=await(await fetch(base+'/api/context?case='+id)).json();assert.equal(c.latestRun.stale,true);assert.equal(c.latestRun.result.graph.revision,'historical-version');assert.notEqual(c.meta.graphRevision,'historical-version');
});

test('engine provenance changes publish a different scope',async()=>{
 const {mkdtemp,writeFile,rm}=await import('node:fs/promises');const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const bank=JSON.parse(await readFile(new URL('../../data/workbench-cases.json',import.meta.url)));const id=bank.cases[0].id;
 const original=await app.store.load(id),dir=await mkdtemp(join(tmpdir(),'gimmikghoul-test-'));
 try{bank.engineRevision='different-declared-engine';const path=join(dir,'cases.json');await writeFile(path,JSON.stringify(bank));await assert.rejects(app.store.seed(path),/Engine provenance differs/);
 for(const source of bank.sources)if(source.id==='engine')source.revision=bank.engineRevision;
 for(const c of bank.cases)for(const set of c.sets)if(set.legality?.engineRevision)set.legality.engineRevision=bank.engineRevision;
 await writeFile(path,JSON.stringify(bank));await app.store.seed(path);const updated=await app.store.load(id);assert.notEqual(updated.version,original.version);assert.equal(updated.engineRevision,bank.engineRevision);}
 finally{await app.store.seed();await rm(dir,{recursive:true,force:true});}
});
