// Native-calculator check for the Memento plan: does +2 Atk change Mega Staraptor's KO on its targets?
// Run: node workbench/board/checks/staraptor-memento.mjs  (writes staraptor-memento.json beside it)
import fs from 'node:fs';
import { calculateRow } from '../../tools/calculator.mjs';
const D = JSON.parse(fs.readFileSync(new URL('../../../data/meta-sets.json', import.meta.url)));
const F = D.formats.find(f => f.format.includes('vgc'));
const set = n => F.species.find(s => s.name === n).candidate.set;
const att = { ...set('Staraptor-Mega'), canonicalSpecies: 'Staraptor-Mega' };
const rows = [];
for (const [target, move] of [['Rillaboom','Brave Bird'],['Sneasler','Brave Bird'],['Incineroar','Close Combat'],['Garchomp','Brave Bird'],['Gholdengo','Brave Bird'],['Archaludon','Close Combat'],['Pelipper','Close Combat'],['Basculegion','Close Combat']])
  for (const b of [0, 2]) {
    const r = await calculateRow({ id: `${target}-${b}`, format: 'gen9championsvgc2026regmc', attacker: { set: att, state: { boosts: { atk: b } } }, defender: set(target), move });
    rows.push({ target, move, boost: b, status: r.status, fullDesc: r.native?.fullDesc ?? null, kochance: r.native?.kochance ?? null, errors: r.errors ?? null, input: { attacker: att, boosts: { atk: b }, defender: set(target) } });
  }
fs.writeFileSync(new URL('./staraptor-memento.json', import.meta.url), JSON.stringify({ calculator: 'workbench/tools/calculator.mjs (native Smogon Champions, c1eb09b)', sets: 'data/meta-sets.json candidates (constructed, not observed)', field: 'neutral', rows }, null, 1) + '\n');
