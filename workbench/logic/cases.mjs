/** Explicit case adapter. Prose is preserved as evidence, never executed as a rule. */
export function buildCaseModel(record) {
  if (!record?.id || !Array.isArray(record.plans) || !Array.isArray(record.sets)) throw new TypeError('Expected a case-bank record with id, plans, and sets.');
  const aliases = { sableyemega:'sableye',raichumegay:'raichu',chimechomega:'chimecho' };
  const model = { id:record.id,context:{battleMode:record.battleMode,format:record.format},rosterSize:record.rosterSize,bringSize:record.bringSize,
    team:[...record.speciesIds],sets:structuredClone(record.sets),members:[...new Set([...record.speciesIds,...(record.alternatives||[]).flatMap(a=>a.speciesIds||[])])].map(id=>({id,setId:record.sets.find(s=>s.speciesId===(aliases[id] || id))?.id})),
    conditions:[],routes:[],goals:[],candidateEdits:[],metaSnapshotId:record.metaSnapshotId };
  const conditionIds = new Set();
  const add = condition => { if (!conditionIds.has(condition.id)) { model.conditions.push(condition);conditionIds.add(condition.id); } return condition.id; };
  const member = id => add({id:`member:${id}`,label:`${id} is selected`,predicate:'team_member',speciesId:id});
  const config = (species,kind,value) => {
    const setId=model.members.find(m=>m.id===species)?.setId;
    return add({id:`${kind}:${species}:${value}`,label:`${species} has ${value}`,predicate:`has_${kind}`,setId,value,sourceIds:['engine']});
  };
  const move=(s,v)=>config(s,'move',v),item=(s,v)=>config(s,'item',v),ability=(s,v)=>config(s,'ability',v);
  const fact=(id,label)=>add({id,label,predicate:'condition',scope:{battleMode:record.battleMode,format:record.format},check:'scenario_or_engine_trace',
    dependsOn:id.startsWith('three-slot-progress:') ? model.members.map(m=>m.id) : (id.startsWith('intimidate-deterrence:') && id !== 'intimidate-deterrence:conversion' ? ['milotic'] : record.plans.find(p=>id.startsWith(`${p.id}:`))?.participants) || (id.startsWith('direct-smash:') || id.startsWith('ground-targeted:') ? ['torterra'] : record.speciesIds)});
  const all=(...items)=>({all:items.flat()});
  const any=(...items)=>({any:items.flat()});
  function evidence(plan) {
    return {
      staticMechanics:plan.sourceIds?.includes('engine')?['engine']:[],
      sourceReports:(plan.sourceIds||[]).filter(id=>id!=='engine'&&!id.startsWith('usage-')),
      datedMeta:{snapshotId:record.metaSnapshotId,sourceIds:(plan.sourceIds||[]).filter(id=>id.startsWith('usage-')),use:'Historical exposure only; not a route prerequisite or strength estimate.'},
      planClaim:{status:plan.status,claim:plan.title},
      hypothesis:/hypothesis|design/.test(plan.status||'')?{status:plan.status,claim:plan.title}:null,
      reportScope:'Source reports retain their original inspection limits; no battle outcome is independently reproduced by this evaluator.',
    };
  }
  function goal(id,label,purpose,sourcePlan) {model.goals.push({id,label,purpose,evidence:evidence(sourcePlan),sourcePlanId:sourcePlan.id});}
  function route(plan,id,label,requirements,extra={}) {const r={id,goalId:plan.id,label,requirements,scope:{battleMode:record.battleMode,format:record.format},
    // Source plans may describe several mechanisms; each route must author its own result.
    tradeoffs:plan.failureCases || [],outcomes:[],evidence:evidence(plan),...extra};model.routes.push(r);return r;}
  const get=id=>record.plans.find(p=>p.id===id);
  for(const p of record.plans)goal(p.id,p.title,p.title,p);
  if(record.id==='sableye-slowking-bss') {
    let p=get('fairy-pivot');
    const pivotCore=[member('sableyemega'),member('slowkinggalar'),ability('slowkinggalar','regenerator'),fact('fairy-pivot:fairy-line','The incoming line is the specified Fairy attack, not unchecked coverage'),fact('fairy-pivot:survival','Slowking survives entry damage and the specified attack')];
    route(p,'fairy-pivot:reception','Slow pivot through Chilly Reception',all(pivotCore,move('slowkinggalar','chillyreception'),fact('fairy-pivot:reception-window','Slowking can execute Chilly Reception before fainting')),
      {outcomes:['Slowking exits through Chilly Reception and Regenerator restores health on switching out.']});
    route(p,'fairy-pivot:switch','Switch out to recover with Regenerator',all(pivotCore,fact('fairy-pivot:switch-window','A safe manual switch and suitable destination are available')),
      {outcomes:['Slowking switches manually to the checked destination and Regenerator restores health on switching out.'],tradeoffs:[...p.failureCases,'Manual switching spends the turn and does not guarantee favorable positioning.']});
    p=get('physical-control');
    const control=[member('sableyemega'),item('sableyemega','sablenite'),move('sableyemega','recover'),fact('physical-control:survival','Sableye survives the specified incoming line'),fact('physical-control:mega-active','Sableye has Mega Evolved and Magic Bounce is effective')];
    route(p,'physical-control:burn','Burn a susceptible physical attacker',all(control,move('sableyemega','willowisp'),fact('physical-control:burn-eligible','The target is burn susceptible and the selected burn line connects')),
      {outcomes:['The target is burned, reducing damage from its burn-sensitive physical attacks.']});
    route(p,'physical-control:foulplay','Use the target’s Attack through Foul Play',all(control,move('sableyemega','foulplay'),fact('physical-control:foulplay-value','Foul Play damage is useful against this actual target and set')),
      {outcomes:['Foul Play uses the target’s Attack for damage against the checked target.']});
    p=get('three-slot-progress');
    route(p,'three-slot-progress:design','Check a selected third against the opposing six',all(add({id:'three-slot-progress:third-member',label:'At least three candidate members are selected',predicate:'team_size',minimum:3}),fact('three-slot-progress:opponent','The opposing six and plausible sets are specified'),fact('three-slot-progress:bring','A legal three-member bring and the defensive slots needed are chosen'),fact('three-slot-progress:progress','The third member has a checked progress line against recovery and opposing pressure')),
      {outcomes:['The selected third member has a checked progress line against the specified opposing six.']});
    for (const alternative of record.alternatives || []) for (const speciesId of alternative.speciesIds || []) {
      model.candidateEdits.push({type:'add_member',speciesId,proposal:{goalId:'three-slot-progress',alternativeId:alternative.id,
        purpose:alternative.role,tradeoffs:[alternative.cost],evidence:{sourceIds:record.sourceIds || [],status:'research_candidate'}}});
    }
  } else if(record.id==='torterra-raichuy-milotic') {
    let p=get('wideguard-window');
    route(p,'wideguard-window:spread','Wide Guard creates an attack window',all(member('torterra'),member('raichumegay'),move('torterra','wideguard'),move('raichumegay','zapcannon'),item('raichumegay','raichunitey'),
      fact('wideguard-window:spread','The opponent uses a spread move that Wide Guard blocks'),fact('wideguard-window:guard-action','Torterra is active and free to execute Wide Guard'),fact('wideguard-window:raichu-action','Raichu is active, Mega Evolved with effective No Guard, and survives to act'),fact('wideguard-window:target','The target is susceptible to Zap Cannon and the attack is not prevented')),
      {resources:[{actor:'torterra',slot:'turn:guard',action:'wideguard'},{actor:'raichumegay',slot:'turn:guard',action:'zapcannon'}],
        outcomes:['Wide Guard blocks the specified opposing spread move for the side.','Mega Raichu Y executes Zap Cannon against the susceptible target with No Guard removing its accuracy check.']});
    p=get('intimidate-deterrence');
    route(p,'intimidate-deterrence:competitive','Convert an opponent-caused stat drop',all(member('milotic'),ability('milotic','competitive'),fact('intimidate-deterrence:active','Milotic is active and Competitive is effective'),fact('intimidate-deterrence:opponent-drop','An opponent actually lowers Milotic’s own stat'),fact('intimidate-deterrence:conversion','Milotic has a usable attack and the speed and survival to convert the boost')),
      {outcomes:['Competitive can trigger on an opponent-caused stat drop to Milotic. Deterrence and damage conversion still require separate evidence.']});
    p=get('avoid-friendly-fire');
    route(p,'avoid-friendly-fire:headlong','Use single-target Headlong Rush',all(member('torterra'),move('torterra','headlongrush'),fact('avoid-friendly-fire:ground-action','Torterra can execute the selected Ground attack against a valid target')),
      {resources:[{actor:'torterra',slot:'turn:ground',action:'headlongrush'}],outcomes:['The chosen Ground move does not damage the ally. This does not establish a KO.'],tradeoffs:['Headlong Rush lowers Torterra’s defenses.']});
    route(p,'avoid-friendly-fire:protect','Coordinate Earthquake with ally Protect',all(member('torterra'),move('torterra','earthquake'),any(all(member('raichumegay'),move('raichumegay','protect')),all(member('milotic'),move('milotic','protect'))),
      fact('avoid-friendly-fire:ground-action','Torterra can execute the selected Ground attack against a valid target'),fact('avoid-friendly-fire:protect-execution','The actual grounded ally executes effective Protect for this Earthquake')),
      {tradeoffs:['Protect spends the partner’s action. Spread damage can be blocked by opposing Wide Guard.'],outcomes:['The protected ally avoids this Earthquake if its protection remains effective.']});
  } else if(record.id==='simplebeam-torterra') {
    let p=get('beam-smash');
    const beam=route(p,'beam-smash:amplified','Simple Beam, then amplified Shell Smash',all(member('farfetchd'),member('torterra'),move('farfetchd','simplebeam'),move('torterra','shellsmash'),
      fact('beam-smash:order','Farfetch’d executes Simple Beam before Torterra uses Shell Smash'),fact('beam-smash:survival','Both Pokémon survive to execute their actions'),fact('beam-smash:beam-connects','Simple Beam reaches Torterra, is unblocked, and Simple remains effective for Shell Smash')),
      {resources:[{actor:'farfetchd',slot:'turn:setup',action:'simplebeam'},{actor:'torterra',slot:'turn:setup',action:'shellsmash'}],
        outcomes:['Simple amplifies Shell Smash to +4 Attack, Special Attack and Speed; defense drops are -2 before any clearing effect.'],
        tradeoffs:[...p.failureCases,'The -2 Defense and -2 Special Defense remain unless a separate effective clearing mechanism removes them.']});
    // Optional support must not become a prerequisite of the amplified stat changes.
    const herb=item('torterra','whiteherb');
    beam.enablers=[item('farfetchd','choicescarf'),ability('farfetchd','innerfocus'),herb];
    const defenseId='purpose:restore-smash-defenses';
    goal(defenseId,'Clear the amplified Shell Smash defense drops','Preserve defenses after setup',p);
    route({...p,id:defenseId},`${defenseId}:whiteherb`,'Activate White Herb after amplified Shell Smash',
      all(beam.requirements,herb,fact('beam-smash:herb-intact','White Herb remains intact and can activate after Shell Smash')),
      {outcomes:['White Herb clears negative stat stages when it activates; it does not create the amplified boosts.'],
        tradeoffs:['White Herb uses the item slot and can be consumed earlier.'],resources:structuredClone(beam.resources)});
    p=get('earthquake-partner');
    const eq=[member('torterra'),move('torterra','earthquake'),fact('earthquake-partner:attack','Torterra can execute Earthquake in this turn')];
    const levitate=route(p,'earthquake-partner:levitate','Earthquake beside effective Levitate',all(eq,member('chimechomega'),ability('chimechomega','levitate'),fact('earthquake-partner:levitate-board','Chimecho is the active partner and Levitate remains effective without grounding')),{outcomes:['Earthquake does not damage the active partner while its Ground immunity holds.']});
    const balloon=route(p,'earthquake-partner:balloon','Earthquake beside intact Air Balloon',all(eq,member('farigiraf'),item('farigiraf','airballoon'),fact('earthquake-partner:balloon-board','Farigiraf is the active partner, Air Balloon is intact, and grounding does not negate it')),{outcomes:['Earthquake does not damage the active partner while its Ground immunity holds.']});
    p=get('decorate-mode');
    const decorate=route(p,'decorate-mode:base','Use Decorate for an ordinary ally boost',all(member('alcremie'),member('torterra'),move('alcremie','decorate'),fact('decorate-mode:execution','Alcremie can act and Decorate reaches the intended ally')),
      {resources:[{actor:'alcremie',slot:'turn:decorate',action:'decorate'}],outcomes:['Decorate boosts its ally and can pass through Protect. Amplification requires Simple to be active.']});
    route(p,'decorate-mode:simple','Amplify Decorate with active Simple',all(decorate.requirements,fact('decorate-mode:simple-active','Simple is already active and effective on Torterra')),
      {outcomes:['Active Simple amplifies the eligible Decorate boosts.']});
    p=get('trickroom-fallback');
    const room=[fact('trickroom-fallback:order','The actual speed matchup favors the planned Trick Room mode'),fact('trickroom-fallback:execution','The selected setter establishes Trick Room and the beneficiary survives to use the window')];
    route(p,'trickroom-fallback:farigiraf','Use Farigiraf as the Trick Room setter',all(member('farigiraf'),move('farigiraf','trickroom'),any(member('torterra'),member('arbok')),room),
      {outcomes:['Farigiraf establishes Trick Room for the selected Torterra or Arbok beneficiary.']});
    route(p,'trickroom-fallback:chimecho','Use Chimecho as the Trick Room setter',all(member('chimechomega'),move('chimechomega','trickroom'),any(member('torterra'),member('arbok')),room),
      {outcomes:['Chimecho establishes Trick Room for the selected Torterra or Arbok beneficiary.']});
    // Shared purposes do not erase differences in outcome: ordinary setup never restores the +4 route.
    const setupId='purpose:boost-torterra';goal(setupId,'Create a boosted Torterra','Create offensive pressure through setup',get('beam-smash'));
    model.routes.push({...structuredClone(beam),id:`${setupId}:beam`,goalId:setupId});
    route({...get('beam-smash'),id:setupId},`${setupId}:direct`,'Use ordinary Shell Smash',all(member('torterra'),move('torterra','shellsmash'),fact('direct-smash:window','Torterra has an executable setup turn and survives to use its boosts')),
      {outcomes:['Ordinary Shell Smash boosts Attack, Special Attack and Speed without Simple amplification.'],tradeoffs:['Smaller boosts than the Simple route. Defense drops remain unless an effective clearing mechanism is present.']});
    model.routes.push({...structuredClone(decorate),id:`${setupId}:decorate`,goalId:setupId});
    const groundId='purpose:ground-without-friendly-fire';goal(groundId,'Keep Ground pressure without hurting the ally','Maintain Ground pressure without friendly fire',get('earthquake-partner'));
    model.routes.push({...structuredClone(levitate),id:`ground:${levitate.id}`,goalId:groundId},{...structuredClone(balloon),id:`ground:${balloon.id}`,goalId:groundId});
    route({...get('earthquake-partner'),id:groundId},`${groundId}:targeted`,'Change to a single-target Ground move',all(member('torterra'),move('torterra','headlongrush'),fact('ground-targeted:legality','The edited Torterra set passes the selected format validator'),fact('ground-targeted:action','Torterra can use Headlong Rush against the intended target')),
      {outcomes:['Single-target Ground pressure avoids allied Earthquake damage.'],tradeoffs:['Headlong Rush lowers Torterra’s defenses and spends a move slot. It does not preserve spread damage.']});
    model.candidateEdits.push({type:'replace_move',setId:model.members.find(m=>m.id==='torterra').setId,from:'earthquake',to:'headlongrush'});
  } else {
    for(const p of record.plans)route(p,`${p.id}:unmodeled`,p.title,all(fact(`${p.id}:explicit-model-required`,'This plan requires an explicit typed route model before evaluation')),
      {unmodeled:true,sourcePrerequisites:p.prerequisites});
  }
  model.alternatives=(record.alternatives||[]).map(a=>({id:a.id,purpose:a.role,description:a.helps,tradeoffs:[a.cost],speciesIds:a.speciesIds,status:'research_candidate',evidence:{sourceIds:record.sourceIds || [],inference:'Candidate direction from case research; complete route and set validation required.'}}));
  return model;
}
