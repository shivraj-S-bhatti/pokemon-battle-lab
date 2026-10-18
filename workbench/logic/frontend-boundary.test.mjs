import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Execute the real event callbacks with no browser, network, or persistent storage.
function harness() {
  const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
  assert.match(source,/boot\(\);\s*$/);
  const handlers=new Map(),saved=[];
  const context=vm.createContext({
    document:{getElementById:id=>({addEventListener:(event,fn)=>handlers.set(`${id}:${event}`,fn)}),addEventListener(){}},
    window:{addEventListener(){}},
    localStorage:{setItem:(key,value)=>saved.push({key,value:JSON.parse(value)})},
  });
  const run=code=>vm.runInContext(code,context);
  run(source.replace(/boot\(\);\s*$/,''));
  run(`renderMap=renderTray=renderInspector=()=>{};
    el=(tag,attrs,...kids)=>({tag,attrs,kids});describeEdit=e=>e.type;
    S.loadingCase=true;S.caseId='case-B';S.graph={case:{id:'case-A'},meta:{graphRevision:'fixture-revision'}};
    S.interventions=[{type:'remove_member',speciesId:'case-A-member'}];
    S.collected=new Set(['case-A-condition']);`);
  return {run,context,handlers,saved};
}

function findButton(node,label) {
  if(!node || typeof node!=='object')return;
  if(node.tag==='button' && node.kids.includes(label))return node;
  for(const kid of (node.kids || []).flat(Infinity)) {
    const found=findButton(kid,label);if(found)return found;
  }
}

test('Old repair and tray callbacks cannot mutate or save while another case loads',()=>{
  const {run,context,handlers,saved}=harness();
  const before=run('JSON.stringify({interventions:S.interventions,collected:[...S.collected]})');
  run(`globalThis.card=repairCard({id:'old-repair',edits:[{type:'add_member',speciesId:'case-A-alternative'}]});`);
  const button=findButton(context.card,'Try it');assert.ok(button);
  button.attrs.onclick();
  handlers.get('tray-clear:click')();
  assert.equal(run('JSON.stringify({interventions:S.interventions,collected:[...S.collected]})'),before);
  assert.deepEqual(saved,[]);
});

test('Central persistence requires a loaded graph matching the selected case',()=>{
  const {run,saved}=harness();
  run("S.graph.case.id='case-B';store.save()");
  assert.deepEqual(saved,[]);
  run("S.loadingCase=false;S.graph.case.id='case-A';store.save()");
  assert.deepEqual(saved,[]);
  run("S.graph.case.id='case-B';store.save()");
  assert.equal(saved.length,1);assert.equal(saved[0].key,'gk:case-B');
});
