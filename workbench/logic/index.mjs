import {buildCaseModel} from './cases.mjs';
import {initialScenario,intervene,assessModel,compareAssessments,findRepairs} from './engine.mjs';
export {buildCaseModel} from './cases.mjs';
export {UNKNOWN,truth,and,or,initialScenario,intervene,assessModel,compareAssessments,findRepairs} from './engine.mjs';
export {noGuardAccuracy,competitiveTrigger,raichuFormAbility} from './mechanics.mjs';

export function analyzeCase(caseRecord,options={}) {
  return analyzeModel(buildCaseModel(caseRecord),options);
}

/** Evaluate the supplied graph model without rebuilding it from a case ID. */
export function analyzeModel(model,options={}) {
  const original=initialScenario(model,options);
  const before=assessModel(model,initialScenario(model,{...options,team:model.team}));
  const {scenario,results}=intervene(model,original,options.interventions || []);
  const assessed=assessModel(model,scenario);
  const searched=findRepairs(model,scenario,options);
  const comparison=compareAssessments(before,assessed);
  const counts={enabled:0,blocked:0,unknown:0};
  for(const p of assessed.plans)counts[p.status]++;
  return {caseId:model.id,...assessed,...searched,alternatives:model.alternatives,
    summary:`${counts.enabled} goals pass their modeled requirements; ${counts.blocked} are blocked; ${counts.unknown} remain uncertain. ${comparison.retainedRoutes.length ? `${comparison.retainedRoutes.length} affected goals retain alternate routes to inspect. ` : ''}Scenario assumptions do not establish battle outcomes.`,
    scenario,interventionResults:results,comparison,continuations:comparison.retainedRoutes,model,
    scope:{selectionMode:scenario.selectionMode,battleMode:scenario.context.battleMode,format:scenario.context.format,metaSnapshotId:model.metaSnapshotId,
      legality:'Individual source-set checks do not validate an edited team or an active board.',battleSimulations:0},
  };
}
