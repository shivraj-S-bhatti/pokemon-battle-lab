import http from 'node:http';
import {createHash} from 'node:crypto';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {connect,query,rows} from '../../scripts/db.mjs';
import * as logic from '../logic/index.mjs';
import {GraphStore,viewGraph} from './store.mjs';
const publicRoot=resolve(dirname(fileURLToPath(import.meta.url)),'../public');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const fail=(message,status=400)=>Object.assign(Error(message),{status});
async function body(req){let text='';for await(const part of req){text+=part;if(Buffer.byteLength(text)>100000)throw fail('Request too large',413);}try{return JSON.parse(text);}catch{throw fail('Expected JSON');}}
function validateInput(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw fail('Expected an object');
 if(typeof input.caseId!=='string')throw fail('caseId is required');
 for(const key of ['team','pinned'])if(input[key]!==undefined&&(!Array.isArray(input[key])||input[key].length>30||input[key].some(x=>typeof x!=='string')))throw fail(`Invalid ${key}`);
 if(input.interventions!==undefined&&(!Array.isArray(input.interventions)||input.interventions.length>100||input.interventions.some(e=>!e||typeof e!=='object')))throw fail('Invalid intervention history');
 if(input.conditions!==undefined&&(!input.conditions||typeof input.conditions!=='object'||Array.isArray(input.conditions)||Object.keys(input.conditions).length>300))throw fail('Invalid conditions');
}
export async function createWorkbench({client,graph,seed=true}={}){
 const evaluatorRevision=createHash('sha256');
 // Hash the evaluator module tree, not the imported game-engine revision.
 const {readdir}=await import('node:fs/promises');
 for(const file of (await readdir(new URL('../logic/',import.meta.url))).filter(f=>f.endsWith('.mjs')&&!f.endsWith('.test.mjs')).sort()){evaluatorRevision.update(file);evaluatorRevision.update(await readFile(new URL('../logic/'+file,import.meta.url)));}
 const evaluatorHash=evaluatorRevision.digest('hex');
 const owned=!client;if(!client)client=await connect();const store=new GraphStore(client,graph);if(seed)await store.seed();
 const server=http.createServer(async(req,res)=>{
  const json=(obj,status=200)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(obj));};
  try{
   const host=req.headers.host||'';if(!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host))throw fail('Local host required',403);
   const origin=req.headers.origin;if(origin&&origin!==`http://${host}`)throw fail('Same-origin requests required',403);
   const url=new URL(req.url,`http://${host}`),id=url.searchParams.get('case');
   if(req.method==='GET'&&url.pathname==='/api/health')return json({ok:await client.ping()==='PONG',storage:'FalkorDB',graph:store.graph});
   if(req.method==='GET'&&url.pathname==='/api/cases')return json({cases:(await store.cases()).map(({sets,plans,...c})=>c)});
   if(req.method==='GET'&&url.pathname==='/api/graph')return json(viewGraph(await store.load(id)));
   if(req.method==='POST'&&url.pathname==='/api/analyze'){
    if(!req.headers['content-type']?.startsWith('application/json'))throw fail('JSON content type required',415);
    const input=await body(req);validateInput(input);const bundle=await store.load(input.caseId);
    if(input.expectedGraphRevision!==undefined&&input.expectedGraphRevision!==bundle.version)throw fail('Graph revision changed; reload the case and recheck assumptions.',409);
    if(!logic.analyzeModel)throw fail('Logic model evaluator not yet available',503);
    const options={team:input.team,conditions:input.conditions||{},interventions:input.interventions||[],pinned:input.pinned||[],selectionMode:input.selectionMode||'roster',context:bundle.model.context,maxEdits:2,maxCandidates:128};
    const result=logic.analyzeModel(bundle.model,options);
    result.graph={name:store.graph,revision:bundle.version,evaluatorRevision:evaluatorHash,storage:'FalkorDB'};
    const run=await store.recordRun(input.caseId,input,result);return json({...result,run});
   }
   if(req.method==='GET'&&url.pathname==='/api/context'){
    const b=await store.load(id),run=await store.latestRun(id);
    const {sets,plans,alternatives,...caseHeader}=b.record;
    const compact=run?{runId:run.runId,createdAt:run.createdAt,request:run.request,stale:run.result.graph?.revision!==b.version||run.result.graph?.evaluatorRevision!==evaluatorHash,result:{graph:run.result.graph,summary:run.result.summary,scenario:run.result.scenario,comparison:run.result.comparison,plans:run.result.plans.map(p=>({id:p.id,label:p.label,status:p.status,routeOptions:p.routeOptions?.map(r=>({id:r.id,label:r.label,status:r.status,outcomes:r.outcomes,tradeoffs:r.tradeoffs,evidence:r.evidence,sourceIds:r.sourceIds,explanation:r.explanation,blockers:r.blockers,unresolvedBlockers:p.routes?.find(x=>x.id===r.id)?.unresolvedBlockers,scopeTruth:p.routes?.find(x=>x.id===r.id)?.scopeTruth})),unknown:p.unknown.map(c=>c.id),missing:p.missing.map(c=>c.id)})),repairs:run.result.repairs,scope:run.result.scope}}:null;
    return json({case:caseHeader,model:b.model,sources:b.sources.filter(s=>b.record.sourceIds.includes(s.id)),meta:{snapshot:b.snapshot,engineRevision:b.engineRevision,graphRevision:b.version,evaluatorRevision:evaluatorHash},latestRun:compact,instructions:'Read route alternatives separately. Unknown assumptions are not established outcomes. Propose typed edits with evidence. Use POST /api/analyze to check the proposal; edited team legality requires a separate validator.'});
   }
   if(req.method==='GET'&&url.pathname==='/api/affected'){
    await store.load(id);return json({caseId:id,dependencies:await store.neighborhood(id,url.searchParams.get('member'))});
   }
   if(req.method==='GET'&&url.pathname==='/api/catalog'){
    const move=url.searchParams.get('move'),ability=url.searchParams.get('ability');
    if(!move&&!ability)throw fail('Supply move or ability');
    for(const x of [move,ability])if(x&&!/^[a-z0-9]{1,60}$/.test(x))throw fail('Use canonical move/ability IDs');
    const matches=await rows(await query(client,'pokemon_mc_202609',`MATCH (s:Species) ${move?'MATCH (s)-[:LEARNS]->(m:Move) WHERE m.id=$move':''} ${ability?'MATCH (s)-[:HAS_ABILITY]->(a:Ability) WHERE a.id=$ability':''} RETURN DISTINCT s.id,s.name LIMIT 50`,{...(move?{move:'Move:'+move}:{}),...(ability?{ability:'Ability:'+ability}:{})}));
    const snapshots=rows(await query(client,'pokemon_mc_202609','MATCH (s:Snapshot) RETURN s.name,s.revision,s.usageMonth,s.cutoff,s.createdAt'));
    return json({catalog:{graph:'pokemon_mc_202609',snapshots:snapshots.map(([format,engineRevision,usageMonth,cutoff,createdAt])=>({format,engineRevision,usageMonth,cutoff,createdAt}))},candidates:matches.map(([id,name])=>({id:id.replace(/^Species:/,''),name})),scope:'Catalog retrieval only; not a legal or effective set recommendation.'});
   }
   if(url.pathname.startsWith('/api/'))throw fail('Unknown endpoint',404);
   if(req.method!=='GET')throw fail('Method not allowed',405);
   const file=resolve(publicRoot,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
   if(!file.startsWith(publicRoot+'/'))throw fail('Invalid path',403);
   try{if(!(await stat(file)).isFile())throw Error();const content=await readFile(file);res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','x-content-type-options':'nosniff','cache-control':'no-cache'});res.end(content);}catch{throw fail('Not found',404);}
  }catch(e){json({error:e.status?e.message:'Backend request failed',...(e.status?{}:{detail:'Check server logs; no fallback data was served.'})},e.status||500);if(!e.status)console.error(e);}
 });
 return {server,store,close:async()=>{await new Promise(r=>server.close(r));if(owned)await client.quit();}};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const app=await createWorkbench();const port=Number(process.env.PORT||4318);app.server.listen(port,'127.0.0.1',()=>console.log(`Gimmikghoul real FalkorDB workbench: http://127.0.0.1:${port}`));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>app.close().then(()=>process.exit()));
}
