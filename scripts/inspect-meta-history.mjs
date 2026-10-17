import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const snapshots=[['2026-04','ma'],['2026-05','ma'],['2026-06','ma'],['2026-06','mb'],['2026-07','mb'],['2026-08','mb'],['2026-09','mb'],['2026-09','mc']];
await fs.mkdir('.cache/meta-history',{recursive:true});
const results=await Promise.allSettled(snapshots.map(async([month,regulation])=>{
  const format=`gen9championsbssreg${regulation}`, cutoff=1500;
  const url=`https://www.smogon.com/stats/${month}/${format}-${cutoff}.txt`;
  const path=`.cache/meta-history/${month}-${format}-${cutoff}.txt`;
  let bytes;
  try {bytes=await fs.readFile(path);} catch {
    const response=await fetch(url);
    if(!response.ok) throw new Error(`${response.status}: ${url}`);
    bytes=Buffer.from(await response.arrayBuffer()); await fs.writeFile(path,bytes);
  }
  const text=bytes.toString('utf8');
  const battles=Number(text.match(/Total battles:\s*(\d+)/)?.[1]);
  const rows=text.split('\n').filter(line=>/^\|\s*\d+\s*\|/.test(line)).map(line=>{
    const cells=line.split('|').map(x=>x.trim());
    return {rank:Number(cells[1]),name:cells[2],usagePercent:Number(cells[3].replace('%',''))};
  });
  if(!battles||!rows.length) throw new Error(`Parser failed: ${url}`);
  return {month,regulation,format,cutoff,sourcePopulation:'Showdown',battles,url,
    sha256:createHash('sha256').update(bytes).digest('hex'),rows};
}));
const errors=results.filter(r=>r.status==='rejected').map(r=>String(r.reason));
const data=results.filter(r=>r.status==='fulfilled').map(r=>r.value);
await fs.writeFile('research/evidence/meta-history.json',JSON.stringify({inspectedAt:new Date().toISOString(),data,errors,
  boundaries:['Regulations are separate series, including overlapping months.',
    'Monthly Showdown weighted usage does not establish official Champions popularity or within-month changes.',
    'No causal or win-rate claim follows from a usage trend.']},null,2));
console.log(JSON.stringify({errors,volcarona:data.map(({month,regulation,battles,rows})=>({month,regulation,battles,...rows.find(r=>r.name==='Volcarona')}))},null,2));
if(errors.length) process.exitCode=1;
