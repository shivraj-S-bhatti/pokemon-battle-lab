import {readFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {query,rows} from '../../scripts/db.mjs';
import {buildCaseModel} from '../logic/index.mjs';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0,20);
export const defaultGraph='pokemon_workbench_v1';
const fields=['conditions','routes','goals','sets','members','candidateEdits','alternatives'];
const refs=x=>typeof x==='string'?[x]:x&&typeof x==='object'?Object.values(x).flatMap(v=>Array.isArray(v)?v.flatMap(refs):refs(v)):[];
export class GraphStore {
  constructor(client,graph=defaultGraph){if(!/^pokemon_workbench_[a-zA-Z0-9_]+$/.test(graph))throw Error('Use an isolated pokemon_workbench_ graph');this.client=client;this.graph=graph;}
  async q(c,p={}){return rows(await query(this.client,this.graph,c,p));}
  async seed(path=new URL('../../data/workbench-cases.json',import.meta.url)){
    const bank=JSON.parse(await readFile(path,'utf8'));
    const declarations=[...bank.sources.filter(s=>s.id==='engine').map(s=>s.revision),...bank.cases.flatMap(c=>c.sets.map(s=>s.legality?.engineRevision).filter(Boolean))];
    if(declarations.some(r=>r!==bank.engineRevision))throw Error('Engine provenance differs between bank, source, or checked set; update evidence together.');
    try{await this.q('CREATE INDEX FOR (n:WBNode) ON (n.key)');}catch(e){if(!/already indexed/i.test(e.message))throw e;}
    for(const record of bank.cases){
      const model=buildCaseModel(record),version=hash({storageSchema:4,engineRevision:bank.engineRevision,record,model,bankSources:bank.sources,species:bank.species,snapshots:bank.metaSnapshots});
      const root=`case:${record.id}`,scope=`${root}:${version}`;
      if((await this.q('MATCH (c:WBNode {key:$key}) RETURN c.version',{key:root}))[0]?.[0]===version)continue;
      const entries=[],links=[];
      const add=(key,kind,payload,ordinal=0)=>entries.push({key,kind,json:JSON.stringify(payload),scope,ordinal});
      const edge=(from,to,type,position=0)=>links.push({from,to,type,position});
      const expression=(value,key)=>{
        if(typeof value==='string')return `${scope}/conditions/${value}`;
        const operator=value&&typeof value==='object'?['all','any','not'].find(k=>k in value):null;
        add(key,'expression',{operator:operator||'unsupported'});
        const children=operator==='not'?[value.not]:Array.isArray(value?.[operator])?value[operator]:[];
        children.forEach((child,i)=>edge(key,expression(child,`${key}/${i}`),'ARG',i));return key;
      };
      const header=Object.fromEntries(Object.entries(model).filter(([k])=>!fields.includes(k)));
      add(scope,'model',{...header,record,engineRevision:bank.engineRevision,snapshot:bank.metaSnapshots.find(x=>x.id===record.metaSnapshotId),species:bank.species,sources:bank.sources,version});
      for(const field of fields)for(const [i,value] of (model[field]||[]).entries()){
        const key=`${scope}/${field}/${value.id||i}`;add(key,field,value,i);edge(scope,key,'HAS_COMPONENT');
      }
      for(const route of model.routes){
        const rk=`${scope}/routes/${route.id}`;edge(rk,expression(route.requirements,`${rk}/expression`),'HAS_EXPRESSION');edge(`${scope}/goals/${route.goalId}`,rk,'HAS_ROUTE');
        for(const id of new Set(refs(route.requirements)))if(model.conditions.some(c=>c.id===id))edge(rk,`${scope}/conditions/${id}`,'REQUIRES');
      }
      for(const c of model.conditions){
        const key=`${scope}/conditions/${c.id}`;
        for(const id of c.dependsOn||[])if(model.members.some(m=>m.id===id))edge(key,`${scope}/members/${id}`,'DEPENDS_ON');
        if(c.speciesId)edge(key,`${scope}/members/${c.speciesId}`,'DEPENDS_ON');
        if(c.setId)edge(key,`${scope}/sets/${c.setId}`,'READS_SET');
      }
      for(const source of bank.sources){add(`${scope}/sources/${source.id}`,'sources',source);edge(scope,`${scope}/sources/${source.id}`,'HAS_COMPONENT');}
      for(const p of record.plans)for(const s of p.sourceIds||[])edge(`${scope}/goals/${p.id}`,`${scope}/sources/${s}`,'SUPPORTED_BY');
      for(let i=0;i<entries.length;i+=100)await this.q('UNWIND $batch AS row MERGE (n:WBNode {key:row.key}) SET n.kind=row.kind,n.json=row.json,n.scope=row.scope,n.ordinal=row.ordinal',{batch:entries.slice(i,i+100)});
      for(const type of new Set(links.map(e=>e.type))){const batch=links.filter(e=>e.type===type);await this.q(`UNWIND $batch AS row MATCH (a:WBNode {key:row.from}),(b:WBNode {key:row.to}) MERGE (a)-[e:${type}]->(b) SET e.position=row.position`,{batch});}
      await this.q('MERGE (c:WBNode {key:$key}) SET c.kind="case",c.caseId=$id,c.version=$version,c.activeScope=$scope,c.json=$json',{key:root,id:record.id,version,scope,json:JSON.stringify(record)});
    }
  }
  async cases(){return (await this.q('MATCH (c:WBNode {kind:"case"}) RETURN c.json ORDER BY c.caseId')).map(([s])=>JSON.parse(s));}
  async load(id){
    const result=await this.q('MATCH (c:WBNode {key:$key}), (m:WBNode) WHERE m.key=c.activeScope MATCH (m)-[:HAS_COMPONENT]->(n) RETURN m.json,n.kind,n.json,m.key ORDER BY n.kind,n.ordinal',{key:`case:${id}`});
    if(!result.length){const e=Error('Unknown or uninitialized case');e.status=404;throw e;}
    const scope=result[0][3];
    const header=JSON.parse(result[0][0]);const {record,engineRevision,snapshot,species,sources,version,...base}=header;
    const model={...base,...Object.fromEntries(fields.map(f=>[f,[]]))};
    for(const [,kind,json]of result)if(fields.includes(kind))model[kind].push(JSON.parse(json));
    // The executable expression comes from graph edges, including argument order.
    const exprRows=await this.q('MATCH (a:WBNode)-[e:HAS_EXPRESSION|ARG]->(b:WBNode) WHERE a.scope=$scope RETURN a.key,type(e),e.position,b.key,b.kind,b.json',{scope});
    const childMap=new Map(),values=new Map();
    for(const [parent,type,position,key,kind,json] of exprRows){if(!childMap.has(parent))childMap.set(parent,[]);childMap.get(parent).push({key,position,type});values.set(key,{kind,payload:JSON.parse(json)});}
    const decode=(key,seen=new Set())=>{
      if(seen.has(key))return {};const node=values.get(key);if(!node)return {};
      if(node.kind==='conditions')return node.payload.id;
      const next=new Set(seen);next.add(key);const children=(childMap.get(key)||[]).sort((a,b)=>a.position-b.position).map(c=>decode(c.key,next));
      return node.payload.operator==='not'?{not:children[0]}:['all','any'].includes(node.payload.operator)?{[node.payload.operator]:children}:{};
    };
    for(const route of model.routes){const root=childMap.get(`${scope}/routes/${route.id}`)?.find(x=>x.type==='HAS_EXPRESSION');route.requirements=root?decode(root.key):{};}
    return {model,record,engineRevision,snapshot,species,sources,version};
  }
  async neighborhood(id,memberId){
    const scope=await this.scope(id);
    if(!scope)throw Object.assign(Error('Unknown case'),{status:404});
    const result=await this.q('MATCH (g:WBNode)-[:HAS_ROUTE]->(r:WBNode)-[:REQUIRES]->(p:WBNode)-[:DEPENDS_ON|READS_SET]->(m:WBNode) WHERE g.scope=$scope AND (m.key=$member OR m.key=$set) RETURN DISTINCT g.json,r.json,p.json',{scope,member:scope+`/members/${memberId}`,set:scope+`/sets/${memberId}`});
    return result.map(([goal,route,condition])=>({goal:JSON.parse(goal),route:JSON.parse(route),condition:JSON.parse(condition)}));
  }
  async scope(id){return (await this.q('MATCH (c:WBNode {key:$key}) RETURN c.activeScope',{key:`case:${id}`}))[0]?.[0];}
  async recordRun(id,request,result){
    const runId=randomUUID(),createdAt=new Date().toISOString();
    await this.q('MATCH (c:WBNode {key:$caseKey}) CREATE (r:WBNode {key:$key,kind:"run",json:$json}) CREATE (c)-[:HAS_RUN]->(r) SET c.latestRun=$key',{caseKey:`case:${id}`,key:`run:${runId}`,json:JSON.stringify({runId,createdAt,request,result})});return {runId,createdAt};
  }
  async latestRun(id){const row=await this.q('MATCH (c:WBNode {key:$key}),(r:WBNode) WHERE r.key=c.latestRun RETURN r.json',{key:`case:${id}`});return row.length?JSON.parse(row[0][0]):null;}
}
export function viewGraph(bundle){
  const {model,record,species,sources,version,engineRevision,snapshot}=bundle;
  const nodes=new Map(),edges=[];
  const add=n=>{if(!nodes.has(n.id))nodes.set(n.id,n);};
  const edge=(source,target,type)=>edges.push({id:`${source}|${type}|${target}`,source,target,type});
  for(const m of model.members){const s=species.find(s=>s.id===m.id);add({id:m.id,kind:'member',label:s?.name||m.id,description:s?.types?.join(' / ')||'Candidate; set not established'});}
  for(const source of sources)add({...source,id:`source:${source.id}`,kind:'source',label:source.title,sourceUrl:source.url});
  for(const goal of model.goals){
    const p=record.plans.find(p=>p.id===goal.sourcePlanId);
    add({id:goal.id,kind:'plan',label:goal.label,description:goal.purpose,status:p?.status,sourceIds:p?.sourceIds||[]});
    const routes=model.routes.filter(r=>r.goalId===goal.id);
    for(const route of routes){
      add({...route,id:`route:${route.id}`,kind:'route',label:route.label,planId:goal.id});edge(goal.id,`route:${route.id}`,'HAS_ROUTE');
      for(const id of new Set(refs(route.requirements))){const c=model.conditions.find(c=>c.id===id);if(!c)continue;
        add({...c,kind:'condition',planIds:[],routeIds:[],description:c.check,truth:'unknown',editable:c.predicate==='condition',assumable:c.predicate==='condition'});
        const condition=nodes.get(id);if(!condition.planIds.includes(goal.id))condition.planIds.push(goal.id);if(!condition.routeIds.includes(route.id))condition.routeIds.push(route.id);edge(goal.id,id,'REQUIRES');edge(`route:${route.id}`,id,'REQUIRES');
        for(const mid of [...(c.dependsOn||[]),...(c.speciesId?[c.speciesId]:[])])if(model.members.some(m=>m.id===mid))edge(goal.id,mid,'USES');
        if(c.setId){const member=model.members.find(m=>m.setId===c.setId);if(member)edge(goal.id,member.id,'USES');}
      }
    }
    for(const [i,label]of(p?.failureCases||[]).entries()){const id=`counter:${goal.id}:${i}`;add({id,kind:'counter',label,planId:goal.id});edge(goal.id,id,'BREAKS_IF');}
    for(const route of routes)for(const [i,label]of(route.outcomes||[]).entries()){const id=`outcome:${route.id}:${i}`;add({id,kind:'outcome',label,planId:goal.id,routeId:route.id,conditionalOn:`route:${route.id}`});edge(`route:${route.id}`,id,'YIELDS');}
    for(const id of p?.sourceIds||[])edge(goal.id,`source:${id}`,'SUPPORTED_BY');
  }
  for(const a of model.alternatives)add({...a,id:`alt:${a.id}`,kind:'alternative',label:a.purpose});
  return {case:record,team:model.team,sets:model.sets,species,nodes:[...nodes.values()],edges:[...new Map(edges.map(e=>[e.id,e])).values()],sources,meta:{engineRevision,snapshot,graphRevision:version,storage:'FalkorDB'}};
}
