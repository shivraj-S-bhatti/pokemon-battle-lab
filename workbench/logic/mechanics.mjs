import { UNKNOWN } from './engine.mjs';
/** These narrow predicates use effective abilities supplied for the actual state.
 * They do not resolve targeting, immunity, Protect, damage, or battle value. */
export function noGuardAccuracy({attackerAbility,targetAbility}={}) {
  if(attackerAbility==='noguard'||targetAbility==='noguard')return true;
  if(typeof attackerAbility!=='string'||typeof targetAbility!=='string')return UNKNOWN;
  return false;
}
export function competitiveTrigger({holderActive,holderAbility,recipientIsHolder,sourceSide,delta}={}) {
  if(holderActive===false||recipientIsHolder===false||sourceSide==='ally'||sourceSide==='self'||(typeof delta==='number'&&delta>=0)||(typeof holderAbility==='string'&&holderAbility!=='competitive'))return false;
  if(holderActive===true&&recipientIsHolder===true&&holderAbility==='competitive'&&sourceSide==='opponent'&&typeof delta==='number'&&delta<0)return true;
  return UNKNOWN;
}
/** Ability assigned by the form. Suppression and ability replacement require actual-state resolution. */
export function raichuFormAbility({form,baseAbility}={}) {
  if(form==='raichumegay')return 'noguard';
  if(form==='raichu')return typeof baseAbility==='string'?baseAbility:UNKNOWN;
  return UNKNOWN;
}
