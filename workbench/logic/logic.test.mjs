import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {and,or,UNKNOWN,initialScenario,intervene,assessModel,findRepairs,analyzeCase,analyzeModel,buildCaseModel,noGuardAccuracy,competitiveTrigger,raichuFormAbility} from './index.mjs';
const bank=JSON.parse(readFileSync(new URL('../../data/workbench-cases.json',import.meta.url)));
const caseById=id=>bank.cases.find(c=>c.id===id);
const plan=(r,id)=>r.plans.find(p=>p.id===id);
const base=()=>({id:'fixture',context:{battleMode:'doubles',format:'test'},rosterSize:6,bringSize:4,team:['a','b'],members:[{id:'a',setId:'a-set'},{id:'b',setId:'b-set'}],sets:[{id:'a-set',moveIds:['beam','protect'],itemId:'herb',abilityId:'focus'},{id:'b-set',moveIds:['smash'],itemId:'berry',abilityId:'armor'}],conditions:[{id:'a',label:'A selected',predicate:'team_member',speciesId:'a'},{id:'b',label:'B selected',predicate:'team_member',speciesId:'b'},{id:'timing',label:'Correct order',predicate:'condition'}],routes:[{id:'route',goalId:'goal',requirements:{all:['a','b','timing']},scope:{battleMode:'doubles'}}],goals:[{id:'goal',label:'Execute setup',purpose:'Setup',evidence:{staticMechanics:['engine'],hypothesis:{status:'test'}}}],candidateEdits:[]});

test('Strong Kleene AND/OR exhaustive triples, including empty inputs',()=>{
  for(const a of [true,false,UNKNOWN])for(const b of [true,false,UNKNOWN])for(const c of [true,false,UNKNOWN]){
    const xs=[a,b,c];assert.equal(and(xs),xs.includes(false)?false:xs.includes(UNKNOWN)?UNKNOWN:true);
    assert.equal(or(xs),xs.includes(true)?true:xs.includes(UNKNOWN)?UNKNOWN:false);
  }
  assert.equal(and([]),UNKNOWN);assert.equal(or([]),UNKNOWN);
});
test('Missing runtime evidence stays unknown; one failed AND condition blocks',()=>{
  const m=base();assert.equal(plan(assessModel(m,initialScenario(m)),'goal').truth,UNKNOWN);
  const s=initialScenario(m,{team:['a'],conditions:{timing:true}});assert.equal(plan(assessModel(m,s),'goal').truth,false);
});
test('OR requires one complete route, not a satisfied predecessor from each route',()=>{
  const m=base();m.conditions.push({id:'x',predicate:'condition'},{id:'y',predicate:'condition'});
  m.routes=[{id:'left',goalId:'goal',requirements:{all:['a','x']}},{id:'right',goalId:'goal',requirements:{all:['b','y']}}];
  let r=assessModel(m,initialScenario(m,{team:['a'],conditions:{x:false,y:true}}));assert.equal(plan(r,'goal').truth,false);
  r=assessModel(m,initialScenario(m,{team:['a'],conditions:{x:true,y:false}}));assert.equal(plan(r,'goal').truth,true);
});
test('Nested OR/NOT, unsupported predicates, and cycles retain unknowns',()=>{
  const m=base();m.conditions.push({id:'x',expression:{not:'y'}},{id:'y',expression:{all:['x']}},{id:'unsupported',predicate:'invented'});
  m.routes[0].requirements={all:['a',{any:['x','unsupported']}]};
  const r=assessModel(m,initialScenario(m));assert.equal(plan(r,'goal').truth,UNKNOWN);assert.ok(r.diagnostics.some(d=>d.type==='cycle'));assert.ok(r.diagnostics.some(d=>d.type==='unsupported_predicate'));
});
test('False unused OR leaf is not reported as a missing route prerequisite',()=>{
  const m=base();m.routes[0].requirements={any:['a','b']};
  const r=assessModel(m,initialScenario(m,{team:['a']}));assert.equal(r.routes[0].truth,true);assert.deepEqual(r.routes[0].missing,[]);
});
test('An active blocker defeats a route; unchecked counter presence remains unknown',()=>{
  const m=base();m.conditions.push({id:'counter',predicate:'condition'});m.routes[0].blockers=['counter'];
  assert.equal(assessModel(m,initialScenario(m,{conditions:{timing:true}})).routes[0].truth,UNKNOWN);
  assert.equal(assessModel(m,initialScenario(m,{conditions:{timing:true,counter:true}})).routes[0].truth,false);
  assert.equal(assessModel(m,initialScenario(m,{conditions:{timing:true,counter:false}})).routes[0].truth,true);
});
test('Mode mismatch blocks doubles; missing context and stale assessment context are unknown',()=>{
  const m=base(),s=initialScenario(m,{conditions:{timing:true},context:{battleMode:'singles'}});
  assert.equal(assessModel(m,s).routes[0].truth,false);
  s.context={};assert.equal(assessModel(m,s).routes[0].truth,UNKNOWN);
  s.context={battleMode:'doubles'};s.conditions.timing={truth:true,context:{battleMode:'singles'}};
  assert.equal(assessModel(m,s).routes[0].truth,UNKNOWN);
});
test('Two different actions in one actor-slot conflict even when every fact passes',()=>{
  const m=base();m.routes[0].resources=[{actor:'a',slot:'turn1',action:'protect'},{actor:'a',slot:'turn1',action:'beam'}];
  const r=assessModel(m,initialScenario(m,{conditions:{timing:true}}));assert.equal(r.routes[0].truth,false);assert.equal(r.routes[0].blockers[0].basis,'action_slot_conflict');
});
test('Interventions are immutable, honor pins, and reject structural overrides',()=>{
  const m=base(),s=initialScenario(m,{pinned:['a']});const snapshot=structuredClone(s);
  const {scenario,results}=intervene(m,s,[{type:'set_item',setId:'a-set',itemId:'berry'},{type:'remove_member',speciesId:'a'},{type:'set_condition',conditionId:'a',truth:true},{type:'remove_member',speciesId:'b'}]);
  assert.deepEqual(s,snapshot);assert.deepEqual(results.map(r=>r.applied),[false,false,false,true]);assert.deepEqual(scenario.team,['a']);
});
test('Changed configurations invalidate previously checked battle conditions',()=>{
  const m=base(),s=initialScenario(m,{conditions:{timing:{truth:true,basis:'engine_trace',sourceIds:['trace1']}}});
  const changed=intervene(m,s,[{type:'set_item',setId:'a-set',itemId:'scarf'}]);
  assert.equal(changed.scenario.conditions.timing.truth,UNKNOWN);assert.equal(changed.results[0].invalidated[0],'timing');
  const rechecked=intervene(m,s,[{type:'set_item',setId:'a-set',itemId:'scarf'},{type:'set_condition',conditionId:'timing',truth:true}]);
  assert.equal(assessModel(m,rechecked.scenario).routes[0].truth,true);assert.equal(assessModel(m,rechecked.scenario).routes[0].conditional,true);
});
test('Roster, bring-size, and unknown-member constraints do not masquerade as legal selections',()=>{
  const m=base();m.bringSize=1;
  assert.equal(assessModel(m,initialScenario(m,{conditions:{timing:true}})).selectionErrors.length,0);
  assert.equal(assessModel(m,initialScenario(m,{selectionMode:'bring',conditions:{timing:true}})).routes[0].truth,false);
  assert.equal(assessModel(m,initialScenario(m,{team:['a','unknown']})).selectionErrors.length,1);
  assert.equal(intervene(m,initialScenario(m,{team:['a'],selectionMode:'bring'}),[{type:'add_member',speciesId:'b'}]).results[0].applied,false);
});
test('Repair search finds a necessary two-edit repair and never assumes timing',()=>{
  const m=base(),s=initialScenario(m,{team:[]});
  assert.equal(findRepairs(m,s,{maxEdits:1}).repairs.length,0);
  const r=findRepairs(m,s,{maxEdits:2});assert.equal(r.repairs.length,1);assert.equal(r.repairs[0].edits.length,2);assert.equal(r.repairs[0].status,'conditional_candidate');assert.ok(r.repairs[0].unresolved.some(c=>c.id==='timing'));assert.equal(r.repairs[0].restored.length,0);
  const limited=findRepairs(m,s,{maxCandidates:1});assert.equal(limited.search.tested,1);assert.equal(limited.search.truncated,true);
});
test('Bounded repairs expose lost goals and subset minimality by purpose',()=>{
  const m=base();m.conditions.push({id:'berry',predicate:'has_item',setId:'a-set',value:'berry'},{id:'herb',predicate:'has_item',setId:'a-set',value:'herb'});
  m.goals.push({id:'other',label:'Berry role'});m.routes=[{id:'herb-route',goalId:'goal',requirements:{all:['herb']}},{id:'berry-route',goalId:'other',requirements:{all:['berry']}}];
  const s=intervene(m,initialScenario(m),[{type:'set_item',setId:'a-set',itemId:'berry'}]).scenario;
  const r=findRepairs(m,s);assert.equal(r.repairs.length,1);assert.equal(r.repairs[0].lost[0].id,'other');assert.equal(r.repairs[0].edits.length,1);assert.equal(r.repairGroups[0].goalId,'goal');
});
test('Pinned choices and synthetic condition changes cannot become repairs',()=>{
  const m=base();m.candidateEdits=[{type:'set_condition',conditionId:'timing',truth:true}];
  const r=findRepairs(m,initialScenario(m,{team:['a'],pinned:['b']}));assert.equal(r.repairs.length,0);assert.ok(r.search.rejected>0);
});
test('All supplied cases default to uncertainty rather than fabricated strength',()=>{
  for(const c of bank.cases){const before=JSON.stringify(c),r=analyzeCase(c);assert.ok(r.plans.every(p=>p.truth===UNKNOWN || (p.id==='three-slot-progress' && p.truth===false)));assert.equal(r.scope.battleSimulations,0);assert.equal(JSON.stringify(c),before);assert.ok(r.plans.every(p=>p.evidence.datedMeta.snapshotId===c.metaSnapshotId));}
});
test('Simple Beam removal blocks amplification while ordinary setup remains a different route',()=>{
  const c=caseById('simplebeam-torterra'),r=analyzeCase(c,{interventions:[{type:'replace_move',setId:'farfetchd-beam',from:'simplebeam',to:'protect'}]});
  assert.equal(plan(r,'beam-smash').truth,false);assert.equal(plan(r,'purpose:boost-torterra').truth,UNKNOWN);
  const repair=r.repairs.find(r=>r.goalId==='beam-smash');assert.ok(repair);assert.equal(repair.edits[0].to,'simplebeam');assert.equal(repair.status,'conditional_candidate');
  assert.ok(r.alternatives.some(a=>a.id==='redirect-window'&&a.tradeoffs.join(' ').includes('Does not replace Simple')));
});
test('Air Balloon removal has conditional Levitate and single-target alternatives without inventing immunity',()=>{
  const c=caseById('simplebeam-torterra');const r=analyzeCase(c,{team:['torterra','farigiraf'],interventions:[{type:'set_item',setId:'farigiraf-support',itemId:'leftovers'}]});
  assert.equal(plan(r,'earthquake-partner').truth,false);
  const repairs=r.repairs.filter(r=>r.goalId==='purpose:ground-without-friendly-fire');
  assert.ok(repairs.some(r=>r.edits.some(e=>e.speciesId==='chimechomega')));
  assert.ok(repairs.some(r=>r.edits.some(e=>e.to==='headlongrush')));
  assert.ok(repairs.every(r=>r.legality.status==='requires_validation'));
});
test('Choice Scarf is an order enabler, not proof of order or an unconditional required item',()=>{
  const c=caseById('simplebeam-torterra'),model=buildCaseModel(c);
  const conditions=Object.fromEntries(model.conditions.filter(c=>c.predicate==='condition').map(c=>[c.id,true]));
  const r=analyzeCase(c,{conditions,interventions:[{type:'set_item',setId:'farfetchd-beam',itemId:'focussash'},...Object.keys(conditions).map(conditionId=>({type:'set_condition',conditionId,truth:true}))]});
  assert.equal(plan(r,'beam-smash').truth,true);assert.equal(plan(r,'beam-smash').conditional,true);
});
test('Doubles cases cannot be enabled by selecting all six in a singles projection',()=>{
  for(const id of ['simplebeam-torterra','torterra-raichuy-milotic']){
    const c=caseById(id),m=buildCaseModel(c),conditions=Object.fromEntries(m.conditions.filter(c=>c.predicate==='condition').map(c=>[c.id,true]));
    const r=analyzeCase(c,{conditions,context:{battleMode:'singles'}});assert.ok(r.plans.every(p=>p.truth===false));
  }
});
test('Mega Raichu Y replaces Lightning Rod; No Guard is not an allied accuracy aura',()=>{
  assert.equal(raichuFormAbility({form:'raichumegay',baseAbility:'lightningrod'}),'noguard');
  assert.equal(noGuardAccuracy({attackerAbility:'competitive',targetAbility:'intimidate',allyAbility:'noguard'}),false);
  assert.equal(noGuardAccuracy({attackerAbility:'noguard',targetAbility:'intimidate'}),true);
  assert.equal(noGuardAccuracy({attackerAbility:'competitive',targetAbility:'noguard'}),true);
  assert.equal(noGuardAccuracy({attackerAbility:'competitive'}),UNKNOWN);
});
test('Competitive needs an opponent-caused drop to the active holder itself',()=>{
  const event={holderActive:true,holderAbility:'competitive',recipientIsHolder:true,sourceSide:'opponent',delta:-1};
  assert.equal(competitiveTrigger(event),true);assert.equal(competitiveTrigger({...event,sourceSide:'ally'}),false);assert.equal(competitiveTrigger({...event,recipientIsHolder:false}),false);assert.equal(competitiveTrigger({...event,holderActive:false}),false);assert.equal(competitiveTrigger({...event,sourceSide:undefined}),UNKNOWN);
});
test('Historical meta changes do not turn usage into prerequisite truth',()=>{
  const c=caseById('torterra-raichuy-milotic');const a=analyzeCase(c),b=analyzeCase({...c,metaSnapshotId:'future-empty-snapshot'});
  assert.deepEqual(a.plans.map(p=>p.truth),b.plans.map(p=>p.truth));assert.equal(b.scope.metaSnapshotId,'future-empty-snapshot');
});
test('A Torterra move edit does not invalidate an independent Milotic trigger assessment',()=>{
  const c=caseById('torterra-raichuy-milotic');
  const conditions={'intimidate-deterrence:active':true,'intimidate-deterrence:opponent-drop':true,'intimidate-deterrence:conversion':true};
  const r=analyzeCase(c,{conditions,interventions:[{type:'replace_move',setId:'torterra-guard',from:'wideguard',to:'earthquake'}]});
  // The trigger stays specified; survival/damage conversion may depend on Torterra's support.
  assert.equal(r.scenario.conditions['intimidate-deterrence:active'],true);
  assert.equal(r.scenario.conditions['intimidate-deterrence:opponent-drop'],true);
  assert.equal(r.scenario.conditions['intimidate-deterrence:conversion'].truth,UNKNOWN);
  assert.equal(plan(r,'intimidate-deterrence').truth,UNKNOWN);
});
test('Team-toggle comparison uses the recorded source selection as its baseline',()=>{
  const c=caseById('simplebeam-torterra');const r=analyzeCase(c,{team:['torterra']});
  assert.ok(r.comparison.changes.some(c=>c.id==='beam-smash'&&c.before===UNKNOWN&&c.after===false));
});
test('A third-slot design needs a third candidate; adding an alternative does not certify its progress',()=>{
  const c=caseById('sableye-slowking-bss');assert.equal(plan(analyzeCase(c),'three-slot-progress').truth,false);
  const r=analyzeCase(c,{team:['sableyemega','slowkinggalar','garchomp']});assert.equal(plan(r,'three-slot-progress').truth,UNKNOWN);assert.deepEqual(r.selectionErrors,[]);
});
test('Source reconstruction and a new hypothesis retain different evidence categories',()=>{
  const reported=plan(analyzeCase(caseById('simplebeam-torterra')),'beam-smash').evidence;
  assert.equal(reported.hypothesis,null);assert.ok(reported.sourceReports.includes('torterra-video'));
  const proposed=plan(analyzeCase(caseById('torterra-raichuy-milotic')),'wideguard-window').evidence;
  assert.equal(proposed.hypothesis.status,'mechanics_grounded_hypothesis');assert.deepEqual(proposed.staticMechanics,['engine']);
});
test('Compact route options retain each alternative’s own claims and provenance',()=>{
  const model=buildCaseModel(caseById('simplebeam-torterra'));
  const routes=model.routes.filter(r=>r.goalId==='purpose:boost-torterra');
  assert.ok(new Set(routes.map(r=>JSON.stringify(r.outcomes))).size>1);
  routes[0].sourceIds=['route-specific-fixture'];
  const result=analyzeModel(model);
  for(const route of routes){
    const option=plan(result,'purpose:boost-torterra').routeOptions.find(r=>r.id===route.id);
    assert.deepEqual(option.outcomes,route.outcomes);
    assert.deepEqual(option.tradeoffs,route.tradeoffs);
    assert.deepEqual(option.evidence,route.evidence);
    assert.deepEqual(option.sourceIds,route.sourceIds || []);
  }
  const empty=base(),option=assessModel(empty,initialScenario(empty)).plans[0].routeOptions[0];
  assert.deepEqual(option.outcomes,[]);assert.deepEqual(option.sourceIds,[]);assert.equal(option.evidence,null);
});
test('Source-plan outcome additions never propagate into executable route claims',()=>{
  for(const record of bank.cases){
    const changed=structuredClone(record);
    for(const p of changed.plans)p.outcomes=['Unmodeled source-only result'];
    const expected=buildCaseModel(record),actual=buildCaseModel(changed);
    assert.deepEqual(actual.routes.map(r=>[r.id,r.outcomes]),expected.routes.map(r=>[r.id,r.outcomes]));
    assert.ok(actual.routes.every(r=>r.outcomes.length>0));
  }
  const unsupported={...structuredClone(caseById('sableye-slowking-bss')),id:'unmodeled-case'};
  assert.ok(buildCaseModel(unsupported).routes.every(r=>r.unmodeled && r.outcomes.length===0));
});
test('BSS alternatives and Trick Room claim only the mechanism required by that route',()=>{
  const c=structuredClone(caseById('sableye-slowking-bss'));
  for(const s of c.sets)s.moveIds=s.moveIds.filter(m=>!['chillyreception','willowisp'].includes(m));
  const m=buildCaseModel(c),conditions=Object.fromEntries(m.conditions.filter(c=>c.predicate==='condition').map(c=>[c.id,true]));
  const r=analyzeModel(m,{conditions}),route=id=>r.routes.find(r=>r.id===id);
  assert.equal(route('fairy-pivot:switch').truth,true);assert.equal(route('fairy-pivot:reception').truth,false);
  assert.match(route('fairy-pivot:switch').outcomes.join(' '),/Regenerator/);
  assert.doesNotMatch(route('fairy-pivot:switch').outcomes.join(' '),/Chilly Reception/);
  assert.equal(route('physical-control:foulplay').truth,true);assert.equal(route('physical-control:burn').truth,false);
  assert.match(route('physical-control:foulplay').outcomes.join(' '),/Foul Play/);
  assert.doesNotMatch(route('physical-control:foulplay').outcomes.join(' '),/burn|Reflect/i);
  assert.doesNotMatch(route('physical-control:burn').outcomes.join(' '),/Foul Play|Reflect/);
  const room=analyzeCase(caseById('simplebeam-torterra'),{team:['farigiraf','torterra'],conditions:{'trickroom-fallback:order':true,'trickroom-fallback:execution':true}});
  const farigiraf=room.routes.find(r=>r.id==='trickroom-fallback:farigiraf');
  assert.equal(farigiraf.truth,true);
  assert.match(farigiraf.outcomes.join(' '),/Farigiraf establishes Trick Room/);
  for(const route of room.routes.filter(r=>r.goalId==='trickroom-fallback'))assert.doesNotMatch(route.outcomes.join(' '),/Simple|Coil/);
});
test('Invalidating an unfavorable runtime assumption alone is not a repair',()=>{
  const m=base();m.candidateEdits=[{type:'set_item',setId:'a-set',itemId:'berry'}];
  const r=findRepairs(m,initialScenario(m,{conditions:{timing:false}}));
  assert.equal(r.repairs.length,0);
});
test('A lost route can be repaired even when another route keeps its goal unknown',()=>{
  const c=caseById('simplebeam-torterra');const r=analyzeCase(c,{interventions:[{type:'set_item',setId:'farigiraf-support',itemId:'leftovers'}]});
  assert.equal(plan(r,'earthquake-partner').truth,UNKNOWN);
  assert.ok(r.repairs.some(r=>r.goalId==='earthquake-partner'&&r.edits.some(e=>e.itemId==='airballoon')));
});
test('Negated prerequisite explains the required absence instead of hiding the blocker',()=>{
  const m=base();m.routes[0].requirements={not:'a'};
  const r=assessModel(m,initialScenario(m));assert.equal(r.routes[0].truth,false);
  assert.equal(r.routes[0].missing[0].id,'a');assert.equal(r.routes[0].missing[0].expectedTruth,false);assert.equal(r.routes[0].missing[0].actualTruth,true);
});
test('AND/OR explanation preserves alternatives instead of making all unmet leaves mandatory',()=>{
  const m=base();m.routes[0].requirements={all:['timing',{any:['a','b']}]};
  const r=assessModel(m,initialScenario(m,{team:[],conditions:{timing:true}}));
  assert.equal(r.routes[0].explanation.operator,'all');
  assert.equal(r.routes[0].explanation.children[1].operator,'any');
  assert.equal(plan(r,'goal').routeOptions[0].explanation.children[1].children.length,2);
});
test('A negated structural prerequisite can be repaired by removing the forbidden member',()=>{
  const m=base();m.routes[0].requirements={not:'a'};m.candidateEdits=[{type:'remove_member',speciesId:'a'}];
  const r=findRepairs(m,initialScenario(m));assert.equal(r.repairs.length,1);assert.equal(r.repairs[0].truth,true);
  assert.equal(r.repairs[0].resolvedStructural[0].expectedTruth,false);
});
test('Condition input maps explicitly reject computed, derived, unknown, and malformed assessments',()=>{
  const m=base();m.conditions.push({id:'derived',predicate:'condition',expression:{all:['a']}});
  const s=initialScenario(m,{team:['b'],conditions:{a:true,derived:false,missing:true,timing:'yes'}});
  assert.equal(s.conditionInputResults.filter(r=>!r.applied).length,4);
  assert.deepEqual(s.conditions,{});
  assert.equal(intervene(m,s,[{type:'set_condition',conditionId:'derived',truth:false}]).results[0].applied,false);
});
test('Every condition has a canonical evaluated state and editability for the UI',()=>{
  const c=caseById('simplebeam-torterra'),r=analyzeCase(c,{conditions:{'beam-smash:order':true},interventions:[{type:'set_item',setId:'farfetchd-beam',itemId:'focussash'}]});
  assert.equal(Object.keys(r.conditionStates).length,r.model.conditions.length);
  assert.equal(r.conditionStates['beam-smash:order'].truth,UNKNOWN);
  assert.equal(r.conditionStates['beam-smash:order'].assessmentStatus,'stale');
  assert.equal(r.conditionStates['beam-smash:order'].editable,true);
  assert.equal(r.conditionStates['member:farfetchd'].editable,false);
  assert.equal(r.conditionStates['item:farfetchd:choicescarf'].truth,false);
});
test('Pinning an alternative without a set does not pin unrelated members or scenario facts',()=>{
  const c=caseById('sableye-slowking-bss'),r=analyzeCase(c,{pinned:['corviknight'],interventions:[{type:'add_member',speciesId:'garchomp'},{type:'set_condition',conditionId:'fairy-pivot:survival',truth:true}]});
  assert.ok(r.interventionResults.every(r=>r.applied));assert.ok(r.scenario.team.includes('garchomp'));
});
test('Changing the chosen third invalidates progress checks for the previous third',()=>{
  const c=caseById('sableye-slowking-bss'),r=analyzeCase(c,{team:['sableyemega','slowkinggalar','garchomp'],conditions:{'three-slot-progress:opponent':true,'three-slot-progress:bring':true,'three-slot-progress:progress':true},interventions:[{type:'remove_member',speciesId:'garchomp'},{type:'add_member',speciesId:'primarina'}]});
  assert.equal(plan(r,'three-slot-progress').truth,UNKNOWN);
  assert.equal(r.scenario.conditions['three-slot-progress:progress'].truth,UNKNOWN);
});
// End-of-cycle regressions for the graph integration seam and Claude review.
test('analyzeModel evaluates the supplied graph model without a hardcoded case lookup',()=>{
  const m=buildCaseModel(caseById('torterra-raichuy-milotic'));m.id='graph-revision:new-model';
  m.routes.find(r=>r.goalId==='wideguard-window').requirements={all:['member:milotic']};
  const snapshot=JSON.stringify(m),r=analyzeModel(m);
  assert.equal(r.caseId,m.id);assert.equal(plan(r,'wideguard-window').truth,true);assert.equal(JSON.stringify(m),snapshot);
  assert.equal(plan(analyzeModel(m,{team:['torterra','raichumegay']}),'wideguard-window').truth,false);
});
test('White Herb clears defenses but is not required for amplified Shell Smash boosts',()=>{
  const c=caseById('simplebeam-torterra');const edits=[{type:'set_item',setId:'torterra-smash',itemId:'sitrusberry'},...['order','survival','beam-connects'].map(k=>({type:'set_condition',conditionId:`beam-smash:${k}`,truth:true}))];
  const r=analyzeCase(c,{interventions:edits});assert.equal(plan(r,'beam-smash').truth,true);
  assert.equal(plan(r,'purpose:restore-smash-defenses').truth,false);
  assert.ok(plan(r,'beam-smash').routes[0].tradeoffs.some(t=>t.includes('-2 Defense')));
  assert.ok(r.repairs.some(r=>r.goalId==='purpose:restore-smash-defenses'&&r.edits.some(e=>e.itemId==='whiteherb')));
});
test('Default minimal repairs exclude adding both partners when either reopens the goal',()=>{
  const c=caseById('simplebeam-torterra'),r=analyzeCase(c,{interventions:[{type:'remove_member',speciesId:'farigiraf'},{type:'remove_member',speciesId:'chimechomega'}]});
  const repairs=r.repairs.filter(r=>r.goalId==='earthquake-partner');
  assert.equal(repairs.length,2);assert.ok(repairs.every(r=>r.edits.length===1));assert.ok(r.search.supersetsPruned>0);
});
test('The incomplete BSS core offers its three third-member hypotheses with their costs',()=>{
  const c=caseById('sableye-slowking-bss'),r=analyzeCase(c),repairs=r.repairs.filter(r=>r.goalId==='three-slot-progress');
  assert.equal(repairs.length,3);assert.deepEqual(repairs.map(r=>r.add[0]).sort(),['corviknight','garchomp','primarina']);
  for(const repair of repairs){const a=c.alternatives.find(a=>a.speciesIds.includes(repair.add[0]));assert.ok(repair.tradeoffs.includes(a.cost));assert.equal(repair.status,'conditional_candidate');assert.equal(repair.repairKind,'alternative');assert.ok(repair.unresolved.length);}
});
test('Restoring source components is labeled separately from alternative mechanisms',()=>{
  const c=caseById('simplebeam-torterra'),r=analyzeCase(c,{interventions:[{type:'replace_move',setId:'farfetchd-beam',from:'simplebeam',to:'protect'}]});
  assert.equal(r.repairs.find(r=>r.goalId==='beam-smash').repairKind,'restore_source');
});
test('When amplification breaks, ordinary setup continuations stay visible with their outcomes',()=>{
  const c=caseById('simplebeam-torterra'),r=analyzeCase(c,{interventions:[{type:'replace_move',setId:'farfetchd-beam',from:'simplebeam',to:'protect'}]});
  const kept=r.continuations.find(c=>c.goalId==='purpose:boost-torterra');assert.ok(kept);
  assert.ok(kept.alternatives.some(r=>r.id.endsWith(':direct')&&r.outcomes.some(o=>o.includes('without Simple amplification'))));
  assert.ok(kept.alternatives.some(r=>r.id.endsWith(':decorate')));assert.ok(kept.alternatives.every(r=>r.truth===UNKNOWN));
});
