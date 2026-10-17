import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {Dex}=require('../.cache/showdown/dist/sim/dex.js');
const dex=Dex.mod('champions');
const url='https://www.smogon.com/stats/2026-09/chaos/gen9championsbssregmc-1500.json';
const path='.cache/singles-202609-1500.json';
await fs.mkdir('.cache',{recursive:true});
await fs.mkdir('research/evidence',{recursive:true});
let cached=true;
try {await fs.access(path);} catch {
  cached=false;
  const response=await fetch(url);
  if(!response.ok) throw new Error(`${response.status}: ${url}`);
  await fs.writeFile(path,Buffer.from(await response.arrayBuffer()));
}
const bytes=await fs.readFile(path), data=JSON.parse(bytes);
if(data.info.metagame!=='gen9championsbssregmc') throw new Error('Wrong format');
const names=['Sableye-Mega','Slowking-Galar','Banette-Mega','Pawmot','Basculegion'];
const rosterHtml=await fs.readFile('.cache/official-roster.html','utf8');
const roster=JSON.parse(rosterHtml.match(/const pokemons\s*=\s*(\[.*?\]);/s)[1]);
const nationalNumbers=Object.keys(data.data).map(name=>dex.species.get(name).num);
if(nationalNumbers.some(n=>!Number.isInteger(n)||n<=0)) throw new Error('Unresolved usage species');
const report={url,inspectedAt:new Date().toISOString(),cached,bytes:bytes.length,
  sha256:createHash('sha256').update(bytes).digest('hex'),info:data.info,
  usageEntriesIncludingForms:Object.keys(data.data).length,
  distinctNationalNumbersInUsage:new Set(nationalNumbers).size,
  cachedOfficialRosterRows:roster.length,
  cachedOfficialRosterNationalNumbers:new Set(roster.map(r=>Number(r[0].split('-')[0]))).size,
  examples:names.map(name=>{
    const row=data.data[name];
    if(!row) throw new Error(`Missing species: ${name}`);
    return {name,weightedUsageFraction:row.usage,rawCount:row['Raw count'],
      availableFields:Object.keys(row),
      leadingTeammatesByAggregateWeight:Object.entries(row.Teammates).sort((a,b)=>b[1]-a[1]).slice(0,5)};
  }),
  boundaries:['Historical Showdown BSS usage; not official Champions ladder usage.',
    'Source number of battles is metadata; no corresponding full battle-log corpus was downloaded.',
    'Usage entries include distinct forms; national numbers collapse these entries into species.',
    'Aggregate teammate weights are not conditional win rates or complete teams.',
    'Moves, items and spreads are marginal distributions, not joint sets.',
    'This is a separate raw singles snapshot; the existing FalkorDB graph remains doubles.']};
await fs.writeFile('research/evidence/singles-data-inspection.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({usageEntriesIncludingForms:report.usageEntriesIncludingForms,
  distinctNationalNumbersInUsage:report.distinctNationalNumbersInUsage,
  cachedOfficialRosterRows:report.cachedOfficialRosterRows,
  cachedOfficialRosterNationalNumbers:report.cachedOfficialRosterNationalNumbers,info:report.info,
  examples:report.examples.map(({name,weightedUsageFraction})=>({name,weightedUsageFraction}))},null,2));
