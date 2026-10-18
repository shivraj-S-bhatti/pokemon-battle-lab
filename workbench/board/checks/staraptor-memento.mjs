// Native-calculator check for the Memento plan: does +2 Atk change Mega Staraptor's KO on selected targets?
// Each target is calculated with both Brave Bird and Close Combat so a resisted move is never the only row.
// Run: node workbench/board/checks/staraptor-memento.mjs  (writes staraptor-memento.json beside it)
import fs from 'node:fs';
import { calculateRow } from '../../tools/calculator.mjs';
const D = JSON.parse(fs.readFileSync(new URL('../../../data/meta-sets.json', import.meta.url)));
const F = D.formats.find(f => f.format === 'gen9championsvgc2026regmc');
const set = n => F.species.find(s => s.name === n).candidate.set;
const att = { ...set('Staraptor-Mega'), canonicalSpecies: 'Staraptor-Mega' };
const targets = ['Rillaboom', 'Sneasler', 'Incineroar', 'Kingambit', 'Garchomp', 'Archaludon', 'Pelipper', 'Gholdengo', 'Basculegion'];
const rows = [];
for (const target of targets) for (const move of ['Brave Bird', 'Close Combat']) for (const b of [0, 2]) {
  const r = await calculateRow({ id: `${target}|${move}|${b}`, format: F.format, attacker: { set: att, state: { boosts: { atk: b } } }, defender: set(target), move });
  rows.push({ id: `${target}|${move}|+${b}`, target, move, boost: b, status: r.status, fullDesc: r.native?.fullDesc ?? null, kochance: r.native?.kochance ?? null, errors: r.errors ?? null,
    input: { attacker: att, attackerBoosts: { atk: b }, defender: set(target), field: 'neutral (no weather, terrain, screens or Intimidate)' } });
}
fs.writeFileSync(new URL('./staraptor-memento.json', import.meta.url), JSON.stringify({
  calculator: 'workbench/tools/calculator.mjs (native Smogon Champions, c1eb09b)', format: F.format,
  sets: 'data/meta-sets.json candidate sets (marginal modes combined, not observed full sets)', field: 'neutral', rows }, null, 1) + '\n');
