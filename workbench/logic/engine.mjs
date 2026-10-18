/** Three-valued dependency evaluation. No battle outcome inference or I/O. */
export const UNKNOWN = 'unknown';
export const truth = value => value === true || value === false ? value : UNKNOWN;
export const and = values => !values.length ? UNKNOWN : values.includes(false) ? false : values.every(v => v === true) ? true : UNKNOWN;
export const or = values => !values.length ? UNKNOWN : values.includes(true) ? true : values.every(v => v === false) ? false : UNKNOWN;
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);
const clone = value => structuredClone(value);
const list = value => Array.isArray(value) ? value : [];
const stateName = value => value === true ? 'enabled' : value === false ? 'blocked' : 'unknown';

export function initialScenario(model, options = {}) {
  const accepted = [], conditionInputResults = [];
  for (const [id, supplied] of Object.entries(options.conditions || {})) {
    const definition = model.conditions.find(c=>c.id===id);
    const value = typeof supplied === 'object' && supplied !== null ? supplied.truth : supplied;
    let reason = null;
    if (!definition) reason = 'Unknown condition ID.';
    else if (definition.predicate !== 'condition' || definition.expression) reason = 'Computed or derived facts are not editable scenario conditions.';
    else if (![true,false,UNKNOWN].includes(value)) reason = 'Truth must be true, false, or unknown.';
    conditionInputResults.push({id,applied:reason === null,...(reason ? {reason} : {})});
    if (!reason) accepted.push([id,clone(supplied)]);
  }
  return {
    team: [...new Set(options.team === undefined ? model.team : list(options.team))],
    sets: clone(model.sets || []),
    conditions: Object.fromEntries(accepted),
    conditionInputResults,
    context: { ...(model.context || {}), ...(options.context || {}) },
    selectionMode: options.selectionMode || 'roster',
    pinned: [...new Set(list(options.pinned))],
  };
}

function memberForEdit(model, edit) {
  if (typeof edit.speciesId === 'string') return model.members.find(m=>m.id===edit.speciesId);
  if (typeof edit.setId === 'string') return model.members.find(m=>m.setId===edit.setId);
  return undefined;
}

function isPinned(model, scenario, edit) {
  const member = memberForEdit(model,edit);
  return scenario.pinned.includes(edit.speciesId) || scenario.pinned.includes(edit.setId) ||
    !!member && (scenario.pinned.includes(member.id) || scenario.pinned.includes(member.setId));
}

export function intervene(model, scenario, edits = []) {
  const next = clone(scenario), results = [];
  for (const raw of list(edits)) {
    const edit = clone(raw), reject = reason => results.push({ edit, applied: false, reason });
    const previousState = JSON.stringify({team:next.team,sets:next.sets});
    if (!edit || typeof edit !== 'object') { reject('An edit must be an object.'); continue; }
    if (isPinned(model, next, edit)) { reject('This member or set is pinned.'); continue; }
    if (edit.type === 'add_member') {
      if (!model.members.some(m => m.id === edit.speciesId)) { reject('Unknown member; a set and scope must be supplied first.'); continue; }
      const limit = next.selectionMode === 'bring' ? model.bringSize : model.rosterSize;
      if (!next.team.includes(edit.speciesId) && Number.isInteger(limit) && next.team.length >= limit) { reject('Selection size limit reached.'); continue; }
      if (!next.team.includes(edit.speciesId)) next.team.push(edit.speciesId);
    } else if (edit.type === 'remove_member') {
      if (!model.members.some(m => m.id === edit.speciesId)) { reject('Unknown member.'); continue; }
      next.team = next.team.filter(id => id !== edit.speciesId);
    } else if (['set_item', 'set_ability', 'replace_move'].includes(edit.type)) {
      const set = next.sets.find(s => s.id === edit.setId);
      if (!set) { reject('Unknown set.'); continue; }
      if (edit.type === 'replace_move') {
        const index = set.moveIds.indexOf(edit.from);
        if (index < 0 || typeof edit.to !== 'string' || !edit.to || set.moveIds.includes(edit.to)) { reject('Move replacement requires an existing move and a distinct new move.'); continue; }
        set.moveIds[index] = edit.to;
      } else {
        const key = edit.type === 'set_item' ? 'itemId' : 'abilityId';
        if (typeof edit[key] !== 'string') { reject(`${key} must be a string.`); continue; }
        set[key] = edit[key];
      }
    } else if (edit.type === 'set_condition') {
      const condition = model.conditions.find(c => c.id === edit.conditionId);
      if (!condition || condition.predicate !== 'condition' || condition.expression) { reject('Only scenario conditions can be assumed; structural facts are computed.'); continue; }
      if (![true, false, UNKNOWN].includes(edit.truth)) { reject('Truth must be true, false, or unknown.'); continue; }
      next.conditions[edit.conditionId] = { truth: edit.truth, basis: 'scenario_assumption' };
    } else { reject('Unsupported edit type.'); continue; }
    const invalidated = [];
    // A checked speed/survival/position claim belongs to the previous configuration.
    // Without a finer proof dependency, conservatively require its recheck after edits.
    if (edit.type !== 'set_condition' && previousState !== JSON.stringify({team:next.team,sets:next.sets})) {
      const changedMember = memberForEdit(model,edit);
      for (const c of model.conditions.filter(c => c.predicate === 'condition' &&
        (!Array.isArray(c.dependsOn) || !c.dependsOn.length || c.dependsOn.includes(changedMember?.id)))) {
        if (own(next.conditions,c.id)) {
          next.conditions[c.id] = {truth:UNKNOWN,basis:'invalidated_by_intervention',previousAssessment:next.conditions[c.id]};
          invalidated.push(c.id);
        }
      }
    }
    results.push({ edit, applied: true, invalidated });
  }
  return { scenario: next, results };
}

function scopeTruth(scope, context) {
  const entries = Object.entries(scope || {}).filter(([, value]) => value != null);
  if (!entries.length) return true;
  return and(entries.map(([key, value]) => context?.[key] == null ? UNKNOWN : context[key] === value));
}

export function assessModel(model, scenario) {
  const byId = new Map(model.conditions.map(c => [c.id, c]));
  const memo = new Map();
  const diagnostics = [];
  function evaluate(expression, visited = new Set()) {
    if (typeof expression === 'string') return condition(expression, visited).truth;
    if (!expression || typeof expression !== 'object') return UNKNOWN;
    if (own(expression, 'all')) return and(list(expression.all).map(e => evaluate(e, visited)));
    if (own(expression, 'any')) return or(list(expression.any).map(e => evaluate(e, visited)));
    if (own(expression, 'not')) { const v = evaluate(expression.not, visited); return v === UNKNOWN ? UNKNOWN : !v; }
    diagnostics.push({ type: 'unsupported_expression' });
    return UNKNOWN;
  }
  function condition(id, visited) {
    if (visited.has(id)) { diagnostics.push({ type: 'cycle', conditionId: id }); return { id, label: id, truth: UNKNOWN, basis: 'cyclic_dependency' }; }
    if (memo.has(id)) return memo.get(id);
    const c = byId.get(id);
    if (!c) { diagnostics.push({ type: 'missing_condition', conditionId: id }); return { id, label: id, truth: UNKNOWN, basis: 'missing_definition' }; }
    const path = new Set(visited); path.add(id);
    let value = UNKNOWN, basis = 'unassessed', supplied = null;
    const set = scenario.sets.find(s => s.id === c.setId);
    if (c.expression) { value = evaluate(c.expression, path); basis = 'derived'; }
    else if (c.predicate === 'team_member') { value = scenario.team.includes(c.speciesId); basis = 'selection'; }
    else if (c.predicate === 'team_size') { value = Number.isInteger(c.minimum) ? scenario.team.length >= c.minimum : UNKNOWN; basis = 'selection'; }
    else if (c.predicate === 'has_move') { value = set ? list(set.moveIds).includes(c.value) : UNKNOWN; basis = 'set_configuration'; }
    else if (c.predicate === 'has_item') { value = set ? set.itemId === c.value : UNKNOWN; basis = 'set_configuration'; }
    else if (c.predicate === 'has_ability') { value = set ? set.abilityId === c.value : UNKNOWN; basis = 'set_configuration'; }
    else if (c.predicate === 'condition') {
      if (own(scenario.conditions, id)) {
        supplied = scenario.conditions[id];
        value = truth(typeof supplied === 'object' && supplied !== null ? supplied.truth : supplied);
        basis = supplied?.basis || 'scenario_assumption';
        if (supplied && typeof supplied === 'object' && supplied.context && scopeTruth(supplied.context, scenario.context) !== true) {
          value = UNKNOWN; basis = 'assessment_scope_mismatch';
        }
      }
    } else { diagnostics.push({ type: 'unsupported_predicate', conditionId: id, predicate: c.predicate }); }
    const scoped = scopeTruth(c.scope, scenario.context);
    value = and([value, scoped]);
    const editable = c.predicate === 'condition' && !c.expression;
    const assessmentStatus = !editable ? 'computed' : basis === 'invalidated_by_intervention' ? 'stale' :
      basis === 'assessment_scope_mismatch' || scoped !== true ? 'out_of_scope' : basis === 'unassessed' ? 'unassessed' :
      basis === 'scenario_assumption' ? 'assumed' : 'provided_evidence';
    const result = { ...clone(c), truth: value, basis, editable, assessmentStatus, assessmentEvidence: supplied?.sourceIds || [], ...(scoped !== true ? { scopeStatus: scoped } : {}) };
    memo.set(id, result);
    return result;
  }
  function leaves(expression, seen = new Set()) {
    if (typeof expression === 'string') {
      if (seen.has(expression)) return [expression];
      const c = byId.get(expression), next = new Set(seen); next.add(expression);
      return c?.expression ? [expression, ...leaves(c.expression, next)] : [expression];
    }
    if (!expression || typeof expression !== 'object') return [];
    return [...list(expression.all), ...list(expression.any), ...(own(expression, 'not') ? [expression.not] : [])].flatMap(e => leaves(e, seen));
  }
  function explain(expression, expectedTruth = true, seen = new Set()) {
    const value = evaluate(expression);
    const shared = { truth:value, expectedTruth, satisfied:value === expectedTruth };
    if (typeof expression === 'string') {
      const c = condition(expression, new Set());
      if (c.expression && !seen.has(expression)) {
        const next = new Set(seen); next.add(expression);
        return {...shared,operator:'derived',id:c.id,label:c.label,children:[explain(c.expression,expectedTruth,next)]};
      }
      return {...shared,operator:'condition',condition:c};
    }
    if (!expression || typeof expression !== 'object') return {...shared,operator:'unsupported',children:[]};
    if (own(expression,'not')) return {...shared,operator:'not',children:[explain(expression.not,!expectedTruth,seen)]};
    if (own(expression,'all')) return {...shared,operator:'all',children:list(expression.all).map(e=>explain(e,expectedTruth,seen))};
    if (own(expression,'any')) return {...shared,operator:'any',children:list(expression.any).map(e=>explain(e,expectedTruth,seen))};
    return {...shared,operator:'unsupported',children:[]};
  }
  function problems(tree) {
    if (tree.satisfied) return [];
    if (tree.operator === 'condition') return [{...tree.condition,
      label:tree.expectedTruth ? tree.condition.label : `Not: ${tree.condition.label || tree.condition.id}`,
      actualTruth:tree.truth,expectedTruth:tree.expectedTruth,truth:tree.truth === UNKNOWN ? UNKNOWN : false}];
    return (tree.children || []).flatMap(problems);
  }
  const limit = scenario.selectionMode === 'bring' ? model.bringSize : model.rosterSize;
  const selectionErrors = [];
  if (Number.isInteger(limit) && scenario.team.length > limit) selectionErrors.push(`Selection has ${scenario.team.length} members; ${scenario.selectionMode} limit is ${limit}.`);
  for (const id of scenario.team) if (!model.members.some(m => m.id === id)) selectionErrors.push(`Unknown selected member: ${id}`);
  const routes = model.routes.map(route => {
    const requirementTruth = evaluate(route.requirements);
    const scoped = scopeTruth(route.scope, scenario.context);
    const resources = new Map(), conflicts = [];
    for (const use of route.resources || []) {
      const key = `${use.actor}:${use.slot}`;
      if (resources.has(key) && resources.get(key) !== use.action) conflicts.push({ id: key, label: `${use.actor} cannot use ${resources.get(key)} and ${use.action} in ${use.slot}.`, truth: false, basis: 'action_slot_conflict' });
      resources.set(key, use.action);
    }
    const blockerChecks = list(route.blockers).map(id => condition(id, new Set()));
    const blockers = blockerChecks.filter(c => c.truth === true).map(c => ({ ...c, truth: false, blockingTruth: true }));
    const blockerClear = blockerChecks.length ? and(blockerChecks.map(c => c.truth === UNKNOWN ? UNKNOWN : !c.truth)) : true;
    const value = and([requirementTruth, scoped, blockerClear, !conflicts.length, !selectionErrors.length]);
    const checks = [...new Set(leaves(route.requirements))].map(id => condition(id, new Set()));
    const explanation = explain(route.requirements);
    const unmet = problems(explanation);
    const missing = unmet.filter(c => c.truth === false);
    const unknown = unmet.filter(c => c.truth === UNKNOWN);
    // A false leaf in a satisfied OR branch is explanatory, not a route blocker.
    return { ...clone(route), truth: value, status: stateName(value), checks, explanation, missing: requirementTruth === true ? [] : missing, unknown: requirementTruth === true ? [] : unknown,
      blockers: [...blockers, ...conflicts, ...selectionErrors.map((label,i) => ({ id:`selection:${i}`,label,truth:false,basis:'selection_constraint' })), ...(scoped === false ? [{ id:'scope',label:'Route does not apply in this format or battle mode.',truth:false,basis:'scope_mismatch' }] : [])],
      unresolvedBlockers: blockerChecks.filter(c => c.truth === UNKNOWN), scopeTruth: scoped,
      conditional: checks.some(c => c.basis === 'scenario_assumption'),
    };
  });
  const plans = model.goals.map(goal => {
    const alternatives = routes.filter(r => r.goalId === goal.id);
    const value = or(alternatives.map(r => r.truth));
    const unique = values => [...new Map(values.map(v => [v.id, v])).values()];
    return { ...clone(goal), truth: value, status: stateName(value), routes: alternatives,
      routeOptions: alternatives.map(r=>({id:r.id,label:r.label,truth:r.truth,status:r.status,explanation:r.explanation,missing:r.missing,unknown:r.unknown,blockers:r.blockers})),
      missing: value === true ? [] : unique(alternatives.flatMap(r => r.missing)),
      unknown: value === true ? [] : unique(alternatives.flatMap(r => [...r.unknown, ...r.unresolvedBlockers])),
      blockers: value === true ? [] : unique(alternatives.flatMap(r => r.blockers)),
      conditional: alternatives.some(r => r.truth === true && r.conditional),
    };
  });
  const conditions = model.conditions.map(c=>condition(c.id,new Set()));
  return { plans, routes, conditions, conditionStates:Object.fromEntries(conditions.map(c=>[c.id,c])),
    conditionInputResults:clone(scenario.conditionInputResults || []), diagnostics, selectionErrors };
}

export function compareAssessments(before, after) {
  const previous = new Map(before.plans.map(p => [p.id, p]));
  const changes = after.plans.flatMap(p => {
    const old = previous.get(p.id);
    return old && old.truth !== p.truth ? [{ id:p.id,label:p.label,before:old.truth,after:p.truth }] : [];
  });
  const previousRoutes = new Map((before.routes || []).map(r=>[r.id,r]));
  const routeChanges = (after.routes || []).flatMap(r=>{const old=previousRoutes.get(r.id);return old && old.truth!==r.truth ? [{id:r.id,goalId:r.goalId,label:r.label,before:old.truth,after:r.truth}] : [];});
  const retainedRoutes = after.plans.flatMap(goal=>{
    const disrupted=routeChanges.filter(r=>r.goalId===goal.id && r.after===false);
    if (!disrupted.length) return [];
    const alternatives=goal.routes.filter(r=>r.truth!==false).map(r=>({id:r.id,label:r.label,truth:r.truth,status:r.status,
      requirements:r.requirements,unresolved:[...r.unknown,...r.unresolvedBlockers],outcomes:r.outcomes || [],tradeoffs:r.tradeoffs || [],evidence:r.evidence}));
    return alternatives.length ? [{goalId:goal.id,purpose:goal.purpose || goal.label,disrupted,alternatives}] : [];
  });
  return { changes, routeChanges, retainedRoutes, restored:changes.filter(p => p.after === true), lost:changes.filter(p => p.before === true),
    improved:changes.filter(p => p.before === false && p.after === UNKNOWN),
    worsened:changes.filter(p => p.before === UNKNOWN && p.after === false) };
}

function restorationEdits(model, scenario) {
  const candidates = [];
  for (const id of model.team) if (!scenario.team.includes(id)) candidates.push({ type:'add_member',speciesId:id });
  for (const id of scenario.team) if (!model.team.includes(id)) candidates.push({ type:'remove_member',speciesId:id });
  for (const original of model.sets) {
    const current = scenario.sets.find(s => s.id === original.id);
    if (!current) continue;
    if (original.itemId !== current.itemId) candidates.push({ type:'set_item',setId:original.id,itemId:original.itemId });
    if (original.abilityId !== current.abilityId) candidates.push({ type:'set_ability',setId:original.id,abilityId:original.abilityId });
    const added = current.moveIds.filter(m => !original.moveIds.includes(m));
    for (const missing of original.moveIds.filter(m => !current.moveIds.includes(m))) for (const from of added) candidates.push({ type:'replace_move',setId:original.id,from,to:missing });
  }
  return [...list(model.candidateEdits), ...candidates].filter(edit => !isPinned(model, scenario, edit));
}

function restoresSource(model, edit) {
  if (edit.type==='add_member') return model.team.includes(edit.speciesId);
  if (edit.type==='remove_member') return !model.team.includes(edit.speciesId);
  const source=model.sets.find(s=>s.id===edit.setId);
  if (!source) return false;
  if (edit.type==='set_item') return source.itemId===edit.itemId;
  if (edit.type==='set_ability') return source.abilityId===edit.abilityId;
  if (edit.type==='replace_move') return source.moveIds.includes(edit.to) && !source.moveIds.includes(edit.from);
  return false;
}

export function findRepairs(model, scenario, options = {}) {
  const baseline = assessModel(model, scenario);
  const maxEdits = Math.max(0, Math.min(2, Number.isInteger(options.maxEdits) ? options.maxEdits : 2));
  const maxCandidates = Math.max(0, Math.min(512, Number.isInteger(options.maxCandidates) ? options.maxCandidates : 128));
  const edits = [...new Map(restorationEdits(model, scenario).map(e => [JSON.stringify(e),e])).values()];
  const candidateCombinations = (maxEdits >= 1 ? edits.length : 0) + (maxEdits >= 2 ? edits.length*(edits.length-1)/2 : 0);
  function* combinations() {
    if (maxEdits >= 1) for (let i=0; i<edits.length; i++) yield [i];
    if (maxEdits >= 2) for (let i=0; i<edits.length; i++) for (let j=i+1; j<edits.length; j++) yield [i,j];
  }
  const repairs = [], rejected = []; let tested=0, supersetsPruned=0;
  const minimal = new Map();
  for (const indexes of combinations()) {
    if (tested >= maxCandidates) break;
    tested++;
    // Remove before adding so a valid swap can be assessed at a full roster.
    const proposed = indexes.map(i => edits[i]).sort((a,b) => Number(b.type==='remove_member')-Number(a.type==='remove_member'));
    if (proposed.some(e => e.type === 'set_condition')) { rejected.push({edits:proposed,reason:'Search never repairs a plan by assuming a scenario fact.'}); continue; }
    const trial = intervene(model, scenario, proposed);
    if (trial.results.some(r => !r.applied)) { rejected.push({edits:proposed,reason:'Edit constraints failed.'}); continue; }
    const assessed = assessModel(model, trial.scenario);
    if (assessed.selectionErrors.length) { rejected.push({edits:proposed,reason:'Selection constraints failed.'}); continue; }
    const comparison = compareAssessments(baseline, assessed);
    const beforeRoutes = new Map(baseline.routes.map(r=>[r.id,r]));
    const improvedRoutes = assessed.routes.flatMap(route=>{
      const before = beforeRoutes.get(route.id);
      if (!before || before.truth === route.truth || route.truth === false) return [];
      const structural = before.missing.filter(c=>c.predicate && c.predicate !== 'condition' && !c.expression);
      const resolvedStructural = structural.filter(c=>route.checks.some(after=>after.id === c.id && after.truth === (c.expectedTruth ?? true)));
      // Removing an unfavorable observation from the knowledge state is not a repair.
      if (before.truth === false && route.truth === UNKNOWN && !resolvedStructural.length) return [];
      return [{id:route.id,goalId:route.goalId,label:route.label,before:before.truth,after:route.truth,resolvedStructural}];
    });
    const goalIds = [...new Set([...comparison.restored.map(p=>p.id),...improvedRoutes.map(r=>r.goalId)])];
    for (const goalId of goalIds) {
      const goal = assessed.plans.find(p => p.id === goalId);
      const relevant = improvedRoutes.filter(r=>r.goalId===goalId);
      // A worse overall goal is not repaired merely because another route opened.
      const oldGoal = baseline.plans.find(p=>p.id===goalId);
      if ((oldGoal.truth === true && goal.truth !== true) || goal.truth === false) continue;
      const goalSets = minimal.get(goal.id) || [];
      if (goalSets.some(s => s.truth === goal.truth && s.indexes.every(i => indexes.includes(i)))) { supersetsPruned++; continue; }
      goalSets.push({ indexes,truth:goal.truth }); minimal.set(goal.id,goalSets);
      const benefitingRoutes = goal.routes.filter(r=>relevant.some(change=>change.id===r.id));
      const unresolved = benefitingRoutes.flatMap(r => [...r.unknown,...r.unresolvedBlockers]);
      const goalChanged = oldGoal.truth !== goal.truth;
      const restores=proposed.map(e=>restoresSource(model,e));
      const repairKind=restores.every(Boolean)?'restore_source':restores.some(Boolean)?'mixed':'alternative';
      const proposals=proposed.flatMap(e=>e.proposal && (!e.proposal.goalId || e.proposal.goalId===goal.id)?[e.proposal]:[]);
      repairs.push({ id:`repair:${goal.id}:${indexes.join('-')}`,label:`${goalChanged ? goal.truth===true?'Restore':'Reopen' : 'Open another route to'} ${goal.label}`,purpose:goal.purpose || goal.label,goalId:goal.id,
        repairKind, proposals, edits:proposed,add:proposed.filter(e=>e.type==='add_member').map(e=>e.speciesId),remove:proposed.filter(e=>e.type==='remove_member').map(e=>e.speciesId),
        truth:goal.truth,status:goalChanged && goal.truth===true?'modeled_requirements_restored':'conditional_candidate',restored:comparison.restored,improved:comparison.improved,lost:[...comparison.lost,...comparison.worsened],
        routeImprovements:relevant,resolvedStructural:relevant.flatMap(r=>r.resolvedStructural),
        unresolved,conditions:benefitingRoutes.map(r=>({id:r.id,requirements:r.requirements,explanation:r.explanation,truth:r.truth})),
        tradeoffs:[...new Set([...benefitingRoutes.flatMap(r=>r.tradeoffs || []),...proposals.flatMap(p=>p.tradeoffs || [])]),...comparison.lost.map(p=>`Loses modeled support for ${p.label}.`),...comparison.worsened.map(p=>`Blocks the unresolved route for ${p.label}.`)],
        evidence:goal.evidence,legality:{status:'requires_validation',scope:'Edited set and team combinations have not been validated by this evaluator.'},
        minimality:'Subset-minimal for this goal truth within the tested edit universe; extra route coverage alone does not justify a superset.',
      });
    }
  }

  const kindOrder={alternative:0,mixed:1,restore_source:2};
  repairs.sort((a,b)=>kindOrder[a.repairKind]-kindOrder[b.repairKind] || a.edits.length-b.edits.length);
  const repairGroups = model.goals.map(g=>({purpose:g.purpose || g.label,goalId:g.id,repairs:repairs.filter(r=>r.goalId===g.id)})).filter(g=>g.repairs.length);
  return {repairs,repairGroups,search:{maxEdits,maxCandidates,candidateEdits:edits.length,candidateCombinations,tested,truncated:candidateCombinations>tested,rejected:rejected.length,supersetsPruned,
    scope:'Bounded edits from supplied candidates and restoration of recorded components. No exhaustive legality or battle search.'}};
}
