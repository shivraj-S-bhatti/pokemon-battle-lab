// Gimmikghoul workbench UI. API contract: workbench/UI_CONTRACT.md.
'use strict';

const S = {
  cases: [], caseId: null, graph: null, nodes: new Map(), out: new Map(),
  interventions: [], pinned: new Set(),
  selected: null, collected: new Set(),
  analysis: null, analysisError: null, analyzing: false, seq: 0,
  showBreaks: true, contextCache: new Map(),
};
const $ = id => document.getElementById(id);
const toID = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const asList = v => (Array.isArray(v) ? v : v == null ? [] : [v]);

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(n.dataset, v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return n;
}
const safeUrl = u => (/^https?:\/\//i.test(String(u || '')) ? u : null);

async function api(path, opts) {
  const res = await fetch(path, opts);
  let body = null;
  try { body = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok) throw new Error((body && body.error) || `${res.status} ${res.statusText}`);
  return body;
}

// ---------- persistence (per case, per browser) ----------
const store = {
  load(id) { try { return JSON.parse(localStorage.getItem(`gk:${id}`)) || null; } catch { return null; } },
  save() {
    if(S.loadingCase || S.graph?.case?.id !== S.caseId)return;
    try {
      localStorage.setItem(`gk:${S.caseId}`, JSON.stringify({ graphRevision: S.graph.meta.graphRevision, interventions: S.interventions, pinned: [...S.pinned], collected: [...S.collected] }));
    } catch { /* storage unavailable */ }
  },
};

// ---------- derived state ----------
const species = id => (S.graph?.species || []).find(s => s.id === id);
const speciesName = id => species(id)?.name || S.nodes.get(id)?.label || id;
const baseTeam = () => S.graph?.team || [];

function roster() {
  const ids = [...baseTeam()];
  for (const e of S.interventions) if (e.type === 'add_member' && !ids.includes(e.speciesId)) ids.push(e.speciesId);
  return ids;
}
function currentTeam() { return [...(S.analysis?.scenario?.team || baseTeam())]; }
function setFor(speciesId) {
  const member = S.analysis?.model?.members?.find(m => m.id === speciesId);
  const sets = S.analysis?.scenario?.sets || S.graph?.sets || [];
  const set = sets.find(s => member?.setId ? s.id === member.setId : s.speciesId === speciesId || speciesId.startsWith(s.speciesId));
  if (!set) return null;
  const original = (S.graph?.sets || []).find(s => s.id === set.id);
  const edited = new Set();
  if (original?.itemId !== set.itemId) edited.add('item');
  if (original?.abilityId !== set.abilityId) edited.add('ability');
  for (const m of set.moveIds || []) if (!original?.moveIds?.includes(m)) edited.add(`move:${m}`);
  return { ...set, moveIds: [...(set.moveIds || [])], edited };
}
const isFresh = () => !S.analyzing && !S.analysisError && S.analysis && S.analysisSeq === S.seq;
// Effective truth: the analysis scenario (after invalidation) when fresh, else the latest toggle.
function truthOf(id) { return isFresh() ? S.analysis.conditionStates?.[id]?.truth ?? 'unknown' : 'unknown'; }
const planResult = id => isFresh() ? (S.analysis?.plans || []).find(p => p.id === id) : null;
const plansOf = nodeId => {
  const n = S.nodes.get(nodeId);
  return [...new Set([...(n?.planIds || []), ...(n?.planId ? [n.planId] : []), ...(S.graph?.edges || []).filter(e => e.target === nodeId && S.nodes.get(e.source)?.kind === 'plan').map(e => e.source)])];
};
const planOf = nodeId => plansOf(nodeId)[0];
const targets = (from, type) => (S.out.get(from) || []).filter(e => !type || e.type === type).map(e => e.target);
const participants = planId => targets(planId, 'USES').filter(id => S.nodes.get(id)?.kind === 'member' || species(id));
const plansUsing = memberId => S.graph.nodes.filter(n => n.kind === 'plan' && participants(n.id).includes(memberId)).map(n => n.id);

function refLabel(ref) {
  if (ref == null) return '';
  if (typeof ref === 'string') return S.nodes.get(ref)?.label || speciesName(ref);
  return ref.label || ref.title || ref.description || ref.reason || (ref.id && S.nodes.get(ref.id)?.label) || ref.id || JSON.stringify(ref);
}
const refId = ref => (typeof ref === 'string' ? ref : ref?.id || ref?.nodeId || ref?.target || null);

function describeEdit(e) {
  switch (e.type) {
    case 'remove_member': return `Remove ${speciesName(e.speciesId)}`;
    case 'add_member': return `Add ${speciesName(e.speciesId)}`;
    case 'set_item': return `${setLabel(e.setId)} holds ${e.itemId}`;
    case 'set_ability': return `${setLabel(e.setId)} ability → ${e.abilityId}`;
    case 'replace_move': return `${setLabel(e.setId)}: ${e.from} → ${e.to}`;
    case 'set_condition': return `Assume “${refLabel(e.conditionId)}” is ${e.truth}${e.invalidatedBy ? ' (graph changed; recheck)' : ''}`;
    default: return JSON.stringify(e);
  }
}
const setLabel = setId => (S.graph?.sets || []).find(s => s.id === setId)?.name || setId;

// ---------- boot ----------
async function boot() {
  try {
    const { cases } = await api('/api/cases');
    S.cases = cases || [];
    renderTabs();
    const wanted = decodeURIComponent(location.hash.slice(1));
    await openCase(S.cases.find(c => c.id === wanted)?.id || S.cases[0]?.id);
  } catch (err) {
    fatal(`Could not load cases: ${err.message}`, boot);
  }
}
function fatal(msg, retry) {
  $('banner').replaceChildren(el('div', { class: 'error-box' }, el('span', { text: msg }), el('button', { class: 'btn small', type: 'button', onclick: retry }, 'Retry')));
}

function renderTabs() {
  $('case-tabs').replaceChildren(...S.cases.map(c => el('button', {
    class: 'case-tab', type: 'button', role: 'tab', 'aria-selected': String(c.id === S.caseId), title: c.title,
    onclick: () => openCase(c.id),
  }, shortTitle(c))));
}
function shortTitle(c) {
  const mode = c.battleMode === 'singles' ? 'BSS' : c.battleMode === 'doubles' ? 'VGC' : (c.format || '');
  return `${(c.title || c.id).split(':')[0]} · ${mode}`;
}

async function openCase(id) {
  if (!id) { fatal('No cases returned by /api/cases.', boot); return; }
  const generation = ++S.seq; clearTimeout(analyzeTimer); S.analyzing = true; S.loadingCase = true; $('export-open').disabled = true; $('tray-export').disabled = true;
  S.caseId = id; S.selected = null; S.analysis = null; S.analysisError = null;
  history.replaceState(null, '', `#${encodeURIComponent(id)}`);
  renderTabs();
  $('banner').replaceChildren(el('p', { class: 'muted' }, 'Loading case…'));
  try {
    const graph = await api(`/api/graph?case=${encodeURIComponent(id)}`);
    if (generation !== S.seq || id !== S.caseId) return;
    S.graph = graph;
  } catch (err) { if (generation !== S.seq) return; fatal(`Could not load the case graph: ${err.message}`, () => openCase(id)); return; }
  S.nodes = new Map(S.graph.nodes.map(n => [n.id, n]));
  for (const s of S.graph.species || []) if (!S.nodes.has(s.id)) S.nodes.set(s.id, { id: s.id, kind: 'member', label: s.name });
  S.out = new Map();
  for (const e of S.graph.edges || []) { if (!S.out.has(e.source)) S.out.set(e.source, []); S.out.get(e.source).push(e); }
  S.loadingCase = false;
  const saved = store.load(id) || {};
  S.interventions = [...Object.entries(saved.conditions || {}).map(([conditionId, truth]) => ({type:'set_condition',conditionId,truth})), ...(saved.interventions || [])]; // Old condition bags preceded edits.
  if(saved.graphRevision !== S.graph.meta.graphRevision) S.interventions = S.interventions.map(e => e.type === 'set_condition' ? {...e,previousTruth:e.truth,truth:'unknown',invalidatedBy:'graph_revision_change'} : e);
  S.pinned = new Set(saved.pinned || []);
  S.collected = new Set(saved.collected || []);
  $('export-open').disabled = true;
  renderAll();
  analyze();
}

// ---------- analysis ----------
let analyzeTimer = null;
function changed() { if(S.loadingCase)return; ++S.seq; S.analyzing = true; S.analysisError = null; store.save(); renderAll(); $('export-open').disabled = true; $('tray-export').disabled = true; clearTimeout(analyzeTimer); analyzeTimer = setTimeout(analyze, 160); }
async function analyze() {
  const seq = S.seq, caseId = S.caseId, request = (S.requestSeq = (S.requestSeq || 0) + 1);
  S.analyzing = true; $('export-open').disabled = true; $('tray-export').disabled = true; renderAnalysis();
  try {
    const res = await api('/api/analyze', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ caseId, expectedGraphRevision: S.graph.meta.graphRevision, team: baseTeam(), conditions: {}, interventions: S.interventions, pinned: [...S.pinned] }),
    });
    if (seq !== S.seq || caseId !== S.caseId || request !== S.requestSeq) return; // a newer revision is in flight
    S.analysis = res; S.analysisSeq = seq; S.analysisError = null;
    // Every condition's effective truth, read from the route explanation trees (covers computed team/set facts).
    S.leafTruth = new Map(asList(res.plans).flatMap(p => asList(p.routeOptions).flatMap(r => leaves(r.explanation))).map(l => [l.id, l.truth]));
  } catch (err) {
    if (seq !== S.seq || caseId !== S.caseId || request !== S.requestSeq) return;
    S.analysisError = err.message;
  }
  S.analyzing = false;
  renderAll(); $('export-open').disabled = !isFresh(); $('tray-export').disabled = !isFresh();
}

// ---------- edits ----------
function pushEdit(e) { if(S.loadingCase)return; S.interventions.push(e); changed(); }
function undoEdit(i) { if(S.loadingCase)return; S.interventions.splice(i, 1); changed(); }
function toggleMember(id) {
  const inTeam = currentTeam().includes(id);
  const want = inTeam ? 'remove_member' : 'add_member', opposite = inTeam ? 'add_member' : 'remove_member';
  const last = S.interventions.map((e, i) => [e, i]).filter(([e]) => e.speciesId === id && (e.type === 'add_member' || e.type === 'remove_member')).pop();
  if (last && last[0].type === opposite) undoEdit(last[1]); else pushEdit({ type: want, speciesId: id });
}
// Assumptions go into the edit list in order, so a later edit can invalidate them and a later check can restore them.
function setCondition(id, v) {
  if(S.loadingCase)return;
  const last = S.interventions[S.interventions.length - 1];
  if (last && last.type === 'set_condition' && last.conditionId === id) S.interventions.pop(); // re-toggling the same need
  S.interventions.push({ type: 'set_condition', conditionId: id, truth: v });
  changed();
}
function togglePin(id) { if(S.loadingCase)return; S.pinned.has(id) ? S.pinned.delete(id) : S.pinned.add(id); changed(); }
function toggleCollect(id) { if(S.loadingCase)return; S.collected.has(id) ? S.collected.delete(id) : S.collected.add(id); store.save(); renderMap(); renderTray(); renderInspector(); }
function select(id) { S.selected = S.selected === id ? null : id; renderMap(); renderInspector(); }

// ---------- render ----------
function renderAll() { renderBanner(); renderTeam(); renderBench(); renderEdits(); renderMap(); renderInspector(); renderAnalysis(); renderTray(); }

function renderBanner() {
  const c = S.graph.case || {}, snap = S.graph.meta?.snapshot;
  const chips = [
    c.format, c.battleMode && `${c.battleMode}${c.bringSize ? ` · bring ${c.bringSize}` : ''}`,
    c.regulation, snap && `usage ${snap.month} · ${snap.population || ''}${snap.cutoff ? ` ${snap.cutoff}+` : ''}`,
  ].filter(Boolean).map(t => el('span', { class: 'chip' }, t));
  if (c.status) chips.push(el('span', { class: 'chip warn', title: 'Evidence status of this case' }, c.status.replaceAll('_', ' ')));
  $('banner').replaceChildren(
    el('h1', {}, c.title || c.id),
    c.question && el('p', { class: 'question' }, c.question),
    el('div', { class: 'chips' }, chips),
  );
}

function sprite(id, size = 44) {
  const img = el('img', { class: 'sprite', src: `/assets/sprites/${id}.png`, alt: '', width: size, height: size, loading: 'lazy' });
  img.addEventListener('error', () => img.replaceWith(el('span', { class: 'sprite fallback', style: `width:${size}px;height:${size}px` }, speciesName(id).slice(0, 2))));
  return img;
}

function renderTeam() {
  const team = currentTeam(), ids = roster();
  $('team-count').textContent = `${team.length}${S.graph.case?.bringSize ? ` · bring ${S.graph.case.bringSize}` : ''}`;
  $('team-list').replaceChildren(...ids.map(id => memberCard(id, team.includes(id))));
}
function memberCard(id, inTeam) {
  const sp = species(id), set = setFor(id);
  const card = el('article', { class: `member${inTeam ? '' : ' out'}` },
    el('div', { class: 'member-top' },
      el('input', { type: 'checkbox', checked: inTeam, 'aria-label': `Include ${speciesName(id)}`, onchange: () => toggleMember(id) }),
      sprite(id),
      el('div', {}, el('button', { class: 'linklike member-name', type: 'button', onclick: () => select(id) }, speciesName(id)),
        el('div', { class: 'types' }, (sp?.types || []).map(t => el('span', { class: 'type' }, t)))),
      el('button', { class: 'icon-btn', type: 'button', title: 'Pin: protects this member and set from proposed edits and repairs', 'aria-pressed': String(S.pinned.has(id)), onclick: () => togglePin(id) }, '📌'),
    ));
  if (set) {
    card.append(el('div', { class: 'member-set' },
      el('div', {}, el('b', { class: set.edited.has('item') ? 'edited' : '' }, set.itemId || '—'), ' · ', el('b', { class: set.edited.has('ability') ? 'edited' : '' }, set.abilityId || '—')),
      el('div', { class: 'moves' }, set.moveIds.map(m => el('span', { class: `move${set.edited.has(`move:${m}`) ? ' edited' : ''}` }, m)))),
    setEditor(set, sp));
  }
  return card;
}
function setEditor(set, sp) {
  const itemIn = el('input', { value: set.itemId || '', 'aria-label': 'Item ID', placeholder: 'item id' });
  const abilities = Object.values(sp?.abilities || {}).map(toID);
  if (set.abilityId && !abilities.includes(set.abilityId)) abilities.unshift(set.abilityId);
  const abilitySel = el('select', { 'aria-label': 'Ability' }, abilities.map(a => el('option', { value: a, selected: a === set.abilityId }, a)));
  const fromSel = el('select', { 'aria-label': 'Move to replace' }, set.moveIds.map(m => el('option', { value: m }, m)));
  const toIn = el('input', { placeholder: 'new move id', 'aria-label': 'Replacement move ID' });
  return el('details', { class: 'set-edit' }, el('summary', {}, 'Edit set'),
    el('div', { class: 'set-form' },
      el('label', {}, 'Item', el('div', { class: 'row' }, itemIn, el('button', { class: 'btn small', type: 'button', onclick: () => { const v = toID(itemIn.value); if (v && v !== set.itemId) pushEdit({ type: 'set_item', setId: set.id, itemId: v }); } }, 'Set'))),
      el('label', {}, 'Ability', el('div', { class: 'row' }, abilitySel, el('button', { class: 'btn small', type: 'button', onclick: () => { if (abilitySel.value !== set.abilityId) pushEdit({ type: 'set_ability', setId: set.id, abilityId: abilitySel.value }); } }, 'Set'))),
      el('label', {}, 'Move', el('div', { class: 'row' }, fromSel, el('span'))),
      el('label', {}, '→', el('div', { class: 'row' }, toIn, el('button', { class: 'btn small', type: 'button', onclick: () => { const v = toID(toIn.value); if (v && !set.moveIds.includes(v)) pushEdit({ type: 'replace_move', setId: set.id, from: fromSel.value, to: v }); } }, 'Swap'))),
    ));
}

function benchItems() {
  const fromAnalysis = S.analysis?.alternatives || [];
  const nodes = S.graph.nodes.filter(n => n.kind === 'alternative');
  return nodes.map(n => ({ id: n.id, role: n.label, description: n.description, speciesIds: n.speciesIds || [],
    status: (fromAnalysis.find(a => `alt:${a.id}` === n.id || a.id === n.id) || {}).status }));
}
function renderBench() {
  const team = currentTeam(), items = benchItems();
  $('bench-list').replaceChildren(...(items.length ? items.map(a => {
    const sid = a.speciesIds.find(s => species(s)) || a.speciesIds[0];
    const inTeam = sid && team.includes(sid);
    return el('div', { class: 'bench-card' },
      sid ? sprite(sid, 40) : el('span'),
      el('div', {}, el('button', { class: 'linklike role', type: 'button', onclick: () => select(a.id) }, a.role), el('p', {}, a.speciesIds.map(speciesName).join(' or '))),
      sid && species(sid) ? el('button', { class: 'btn small', type: 'button', disabled: inTeam, onclick: () => pushEdit({ type: 'add_member', speciesId: sid }) }, inTeam ? 'In team' : 'Try') : el('span'));
  }) : [el('p', { class: 'empty' }, 'No alternatives in this case.')]));
}

function renderEdits() {
  const results = isFresh() ? S.analysis?.interventionResults || [] : [];
  const rows = S.interventions.map((e, i) => {
    const r = results[i];
    return el('li', { class: r && r.applied === false ? 'rej' : '' }, describeEdit(e),
      r && r.applied === false ? ` (rejected: ${r.reason || 'not applied'})` : '',
      el('button', { class: 'btn-link', type: 'button', onclick: () => undoEdit(i) }, 'undo'));
  });
  $('edit-log').replaceChildren(...(rows.length ? rows : [el('li', { class: 'empty' }, 'Source team, no assumptions.')]));
  $('reset-all').disabled = !rows.length;
}

// ---------- map ----------
function related(id) {
  if (!id) return null;
  const n = S.nodes.get(id), set = new Set([id]);
  if (!n) return set;
  if (n.kind === 'member') for (const p of plansUsing(id)) set.add(p);
  if (n.kind === 'plan') { participants(id).forEach(x => set.add(x)); targets(id).forEach(x => set.add(x)); }
  if (n.kind === 'condition' || n.kind === 'counter' || n.kind === 'outcome') { for (const p of plansOf(id)) { set.add(p); participants(p).forEach(x => set.add(x)); } }
  if (n.kind === 'alternative') for (const s of n.speciesIds || []) set.add(s);
  return set;
}

function statusPill(status, extra) {
  const st = status || 'pending';
  return el('span', { class: `status st-${st}` }, S.analyzing && !status ? 'checking' : st, extra);
}

function renderMap() {
  if (!S.graph) return;
  const team = currentTeam(), rel = related(S.selected);
  const cls = (id, base) => `${base}${rel && !rel.has(id) ? ' dim' : ''}${S.selected === id ? ' sel' : ''}${S.collected.has(id) ? ' collected' : ''}`;
  const onNode = id => ev => { if (ev.shiftKey || ev.metaKey || ev.ctrlKey) toggleCollect(id); else select(id); };
  const changes = new Map((S.analysis?.comparison?.changes || []).map(c => [c.id, c]));

  const memberIds = roster();
  for (const p of S.graph.nodes.filter(n => n.kind === 'plan')) for (const m of participants(p.id)) if (!memberIds.includes(m)) memberIds.push(m);
  $('map-members').replaceChildren(el('div', { class: 'stack-label' }, 'Members'), ...memberIds.map(id => el('button', {
    class: cls(id, `node node-member${team.includes(id) ? '' : ' out'}`), type: 'button', dataset: { id }, onclick: onNode(id),
  }, sprite(id, 40), el('span', {}, el('span', { class: 'node-label' }, speciesName(id)), el('span', { class: 'node-sub', style: 'display:block' }, team.includes(id) ? (setFor(id)?.itemId || '') : 'not on team')))));

  const plans = S.graph.nodes.filter(n => n.kind === 'plan');
  $('map-plans').replaceChildren(...plans.map(p => {
    const res = planResult(p.id), ch = changes.get(p.id);
    const needs = targets(p.id, 'REQUIRES').map(id => S.nodes.get(id)).filter(Boolean);
    const breaks = targets(p.id, 'BREAKS_IF').map(id => S.nodes.get(id)).filter(Boolean);
    const planNode = el('button', { class: cls(p.id, 'node node-plan'), type: 'button', dataset: { id: p.id }, onclick: onNode(p.id) },
      el('span', { class: 'pin', 'aria-hidden': 'true' }),
      el('div', { class: 'node-label' }, p.label),
      el('div', {}, statusPill(res?.status, ch ? el('span', { class: 'delta', title: `was ${ch.before}` }, `was ${ch.before}`) : null)),
      el('div', { class: 'who' }, participants(p.id).map(m => sprite(m, 26))));
    const needCol = el('div', { class: 'stack' }, el('div', { class: 'stack-label' }, `Requirements across routes · ${needs.length}`),
      ...needs.map(c => {
        const t = String(truthOf(c.id));
        return el('div', { class: cls(c.id, `node node-need t-${t}`), role: 'button', tabindex: '0', dataset: { id: c.id }, onclick: onNode(c.id), onkeydown: ev => { if (ev.key === 'Enter') onNode(c.id)(ev); } },
          el('span', { class: 'node-label' }, c.label), c.assumable === false ? el('span', { class: `computed t-${t}`, title: 'Computed from the team and sets' }, glyph(truthOf(c.id))) : tri(c.id, t));
      }));
    const row = el('div', { class: `plan-row${S.showBreaks ? '' : ' no-breaks'}`, dataset: { plan: p.id } }, planNode, needCol);
    if (S.showBreaks) row.append(el('div', { class: 'stack' }, el('div', { class: 'stack-label' }, 'Breaks if'),
      ...breaks.map(b => el('button', { class: cls(b.id, 'node node-break'), type: 'button', dataset: { id: b.id }, onclick: onNode(b.id) }, el('span', { class: 'node-label' }, b.label)))));
    return row;
  }));
  requestAnimationFrame(drawStrings);
}

function tri(id, current) {
  const opts = [['true', '✓', 'Assume true'], ['unknown', '?', 'Unknown'], ['false', '✗', 'Assume false']];
  return el('span', { class: 'tri', role: 'group', 'aria-label': 'Assumption' }, opts.map(([v, glyph, label]) => el('button', {
    type: 'button', title: label, 'aria-label': label, 'aria-pressed': String(current === v), dataset: { v },
    onclick: ev => { ev.stopPropagation(); setCondition(id, v === 'unknown' ? 'unknown' : v === 'true'); },
  }, glyph)));
}

function drawStrings() {
  const map = $('map'), svg = $('strings');
  if (!map || getComputedStyle(svg).display === 'none') return;
  const box = map.getBoundingClientRect();
  svg.setAttribute('width', map.scrollWidth); svg.setAttribute('height', map.scrollHeight);
  const at = (node, side) => {
    const r = node.getBoundingClientRect();
    return [(side === 'r' ? r.right : r.left) - box.left + map.scrollLeft, r.top + r.height / 2 - box.top + map.scrollTop];
  };
  const curve = ([x1, y1], [x2, y2]) => { const dx = Math.max(30, (x2 - x1) / 2); return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`; };
  const rel = related(S.selected), paths = [];
  const nodeEl = id => map.querySelector(`[data-id="${CSS.escape(id)}"]`);
  for (const p of S.graph.nodes.filter(n => n.kind === 'plan')) {
    const pe = nodeEl(p.id); if (!pe) continue;
    const blocked = planResult(p.id)?.status === 'blocked';
    for (const m of participants(p.id)) {
      const me = nodeEl(m); if (!me) continue;
      paths.push([curve(at(me, 'r'), at(pe, 'l')), `${blocked ? 'blocked' : ''} ${rel && rel.has(m) && rel.has(p.id) ? 'hot' : ''}`]);
    }
    for (const [type, k] of [['REQUIRES', 'need'], ['BREAKS_IF', 'break']]) for (const t of targets(p.id, type)) {
      const te = nodeEl(t); if (!te) continue;
      paths.push([curve(at(pe, 'r'), at(te, 'l')), `${k} ${rel && rel.has(t) && rel.has(p.id) ? 'hot' : ''}`]);
    }
  }
  svg.replaceChildren(...paths.map(([d, c]) => { const pth = document.createElementNS('http://www.w3.org/2000/svg', 'path'); pth.setAttribute('d', d); pth.setAttribute('class', c.trim()); return pth; }));
}

// ---------- inspector ----------
function block(title, ...content) { return el('div', { class: 'insp-block' }, el('h3', {}, title), ...content); }
function list(items, render = x => x) { return items.length ? el('ul', { class: 'insp-list' }, items.map(x => el('li', {}, render(x)))) : el('p', { class: 'empty' }, 'None recorded.'); }
const jump = id => el('a', { class: 'linklike', href: '#', role: 'button', onclick: ev => { ev.preventDefault(); select(id); } }, refLabel(id));

function renderInspector() {
  const id = S.selected, n = id && S.nodes.get(id), box = $('inspector');
  if (!n) { box.replaceChildren(el('p', { class: 'hint' }, 'Select a member, plan, need or counter to inspect it. Shift-click collects it for export.')); return; }
  const kids = [el('div', { class: 'insp-kind' }, n.kind), el('h2', {}, n.label || speciesName(id))];
  if (n.description) kids.push(el('p', {}, n.description));
  if (n.kind === 'member') kids.push(...inspectMember(id));
  if (n.kind === 'plan') kids.push(...inspectPlan(id));
  if (n.kind === 'condition') kids.push(...inspectCondition(id));
  if (n.kind === 'counter' || n.kind === 'outcome') { const p = planOf(id); if (p) kids.push(block('Plan', jump(p))); }
  if (n.kind === 'source' && safeUrl(n.url)) kids.push(el('a', { class: 'source-link', href: safeUrl(n.url), target: '_blank', rel: 'noopener' }, 'Open source'));
  if (n.kind === 'alternative') kids.push(block('Species', list((n.speciesIds || []), speciesName)));
  kids.push(el('div', { class: 'insp-actions' },
    el('button', { class: 'btn small', type: 'button', onclick: () => toggleCollect(id) }, S.collected.has(id) ? 'Uncollect' : 'Collect for export')));
  box.replaceChildren(...kids);
}
function inspectMember(id) {
  const sp = species(id), set = setFor(id), inTeam = currentTeam().includes(id);
  const out = [el('div', { class: 'chips' }, (sp?.types || []).map(t => el('span', { class: 'chip' }, t)), el('span', { class: 'chip' }, inTeam ? 'on team' : 'not on team'))];
  if (set) out.push(block('Set', el('p', {}, `${set.itemId || '—'} · ${set.abilityId || '—'}`), el('div', { class: 'moves' }, set.moveIds.map(m => el('span', { class: 'move' }, m))),
    set.spreads && el('p', { class: 'hint' }, set.spreads), set.status && el('span', { class: 'chip' }, set.status.replaceAll('_', ' '))));
  out.push(block('Plans that use it', list(plansUsing(id), jump)));
  out.push(el('div', { class: 'insp-actions' },
    el('button', { class: 'btn small', type: 'button', onclick: () => toggleMember(id) }, inTeam ? 'Remove from team' : 'Add to team'),
    el('button', { class: 'btn small', type: 'button', onclick: () => togglePin(id) }, S.pinned.has(id) ? 'Unpin' : 'Pin')));
  return out;
}
function inspectPlan(id) {
  const res = planResult(id), routes = res?.routes || res?.routeOptions || [], out = [el('div', {}, statusPill(res?.status))];
  out.push(block('Who', list(participants(id), jump)));
  const mech = targets(id, 'USES').filter(t => S.nodes.get(t)?.kind === 'mechanism');
  if (mech.length) out.push(block('Mechanisms', el('div', { class: 'chips' }, mech.map(m => el('span', { class: 'chip' }, refLabel(m))))));
  out.push(block('Requirements across alternative routes', list(targets(id, 'REQUIRES'), c => el('span', {}, `${glyph(truthOf(c))} `, jump(c)))));
  out.push(block('Breaks if', list(targets(id, 'BREAKS_IF'), refLabel)));
  if (routes.length) {
    // Keep nested AND/OR/NOT and expected truth intact.
    out.push(block(`Routes · any one of ${routes.length}`, ...routes.map(r => el('div', { class: 'route' },
      el('div', { class: 'route-head' }, el('span', { class: 'node-label' }, r.label || r.id), statusPill(r.status)),
      renderExplanation(r.explanation),
      r.scopeTruth !== undefined && r.scopeTruth !== true ? el('p', {}, `Format/scope check: ${String(r.scopeTruth)}`) : null,
      asList(r.blockers).length ? block('Active blockers', list(r.blockers, refLabel)) : null,
      asList(r.unresolvedBlockers).length ? block('Unchecked blockers', list(r.unresolvedBlockers, refLabel)) : null,
      asList(r.tradeoffs).length ? block('Tradeoffs', list(r.tradeoffs, refLabel)) : null,
      block('Outcome if these requirements hold', list(r.outcomes || S.analysis?.model?.routes.find(x => x.id === r.id)?.outcomes || [], refLabel))))));
  } else if (res) {
    const why = [...asList(res.blockers).map(b => ['blocked by', b]), ...asList(res.missing).map(b => ['missing', b]), ...asList(res.unknown).map(b => ['unchecked', b])];
    if (why.length) out.push(block('Why this status', list(why, ([k, r]) => el('span', {}, `${k}: `, refId(r) && S.nodes.has(refId(r)) ? jump(refId(r)) : refLabel(r)))));
  }
  out.push(block('Evidence', sourceList(asList(S.nodes.get(id).sourceIds).concat(targets(id, 'SUPPORTED_BY')))));
  const fixes = repairsFor(id);
  out.push(el('div', { class: 'insp-actions' },
    fixes.length ? el('button', { class: 'btn small', type: 'button', onclick: () => $('repairs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, `${fixes.length} repair${fixes.length > 1 ? 's' : ''}`) : null));
  return out;
}
function inspectCondition(id) {
  const owners = plansOf(id), t = truthOf(id), n = S.nodes.get(id);
  const out = [el('div', {}, n?.assumable === false ? el('span', { class: 'chip' }, `${glyph(t)} computed from the team and sets`) : tri(id, String(t)))];
  if (owners.length) out.push(block('Used by these goals', list(owners, jump)));
  const checks = asList(S.graph.case?.nextCalculations);
  if (checks.length) out.push(block('Checks that could settle it', list(checks, c => (typeof c === 'string' ? c : refLabel(c)))));
  return out;
}
function renderExplanation(node) {
  if (!node) return el('p', {}, 'No explanation available');
  if (node.operator === 'condition') return el('div', {class:'requirement'},
    `${node.satisfied ? '✓' : '?'} Requires ${String(node.expectedTruth)}: `,
    S.nodes.has(node.condition.id) ? jump(node.condition.id) : node.condition.label,
    ` (currently ${String(node.truth)})`);
  const label = `${String(node.operator).toUpperCase()} must be ${String(node.expectedTruth)} · ${node.satisfied ? 'satisfied' : 'unresolved'}`;
  if (node.satisfied) return el('details', {}, el('summary', {}, label), ...asList(node.children).map(renderExplanation));
  return el('div', {class:'requirement-group'}, el('strong', {}, label), el('ul', {}, asList(node.children).map(c => el('li', {}, renderExplanation(c)))));
}
// Condition leaves of an explanation tree, with whether each meets what its route expects.
function leaves(node, outList = []) {
  if (!node) return outList;
  if (node.operator === 'condition' && node.condition) outList.push({ id: node.condition.id, label: node.condition.label, truth: node.truth, satisfied: node.satisfied, expected: node.expectedTruth });
  for (const c of asList(node.children)) leaves(c, outList);
  return outList;
}
const glyph = t => (t === true ? '✓' : t === false ? '✗' : '?');
function sourceList(ids) {
  const uniq = [...new Set(ids.map(s => (String(s).startsWith('source:') ? s : `source:${s}`)))];
  const srcs = uniq.map(s => S.nodes.get(s) || (S.graph.sources || []).find(x => `source:${x.id}` === s)).filter(Boolean);
  return list(srcs, s => (safeUrl(s.url) ? el('a', { class: 'source-link', href: s.url, target: '_blank', rel: 'noopener' }, s.label || s.title) : (s.label || s.title)));
}

// ---------- analysis panel ----------
const editKey = r => JSON.stringify(asList(r.edits).length ? r.edits : [asList(r.add), asList(r.remove)]);
// A repair that only puts back something from the source case reads as "undo", not a new idea.
function isUndo(r) {
  const base = S.graph?.sets || [], team = baseTeam();
  return asList(r.edits).length > 0 && asList(r.edits).every(e =>
    (e.type === 'add_member' && team.includes(e.speciesId)) ||
    (e.type === 'set_item' && base.some(b => b.id === e.setId && b.itemId === e.itemId)) ||
    (e.type === 'set_ability' && base.some(b => b.id === e.setId && b.abilityId === e.abilityId)) ||
    (e.type === 'replace_move' && base.some(b => b.id === e.setId && asList(b.moveIds).includes(e.to))));
}
function mergedRepairs() {
  const byKey = new Map();
  for (const g of repairsAll()) for (const r of g.repairs) {
    const k = editKey(r);
    if (!byKey.has(k)) byKey.set(k, { ...r, purposes: [], goals: [], undo: isUndo(r) });
    const m = byKey.get(k);
    if (!m.purposes.includes(g.purpose)) m.purposes.push(g.purpose);
    if (r.goalId && !m.goals.includes(r.goalId)) m.goals.push(r.goalId);
    m.routeImprovements = [...asList(m.routeImprovements), ...asList(r.routeImprovements).filter(x => !asList(m.routeImprovements).some(y => y.id === x.id))];
  }
  return [...byKey.values()].sort((a, b) => a.undo - b.undo || asList(a.edits).length - asList(b.edits).length);
}
function repairsAll() {
  const a = S.analysis || {};
  if (Array.isArray(a.repairGroups) && a.repairGroups.length) return a.repairGroups.map(g => ({ purpose: g.purpose || g.goalId, goalId: g.goalId, repairs: g.repairs || [] }));
  const groups = new Map();
  for (const r of asList(a.repairs)) { const k = r.purpose || r.goalId || 'Other'; if (!groups.has(k)) groups.set(k, { purpose: k, goalId: r.goalId, repairs: [] }); groups.get(k).repairs.push(r); }
  return [...groups.values()];
}
const repairsFor = planId => mergedRepairs().filter(r => r.goals.includes(planId) || asList(r.restored).some(x => refId(x) === planId) || asList(r.improved).some(x => refId(x) === planId));

function renderAnalysis() {
  const box = $('analysis');
  if (!S.graph) return box.replaceChildren();
  const a = S.analysis;
  if (S.analysisError) {
    return box.replaceChildren(el('div', { class: 'error-box' }, el('span', {}, `Analysis failed: ${S.analysisError}`), el('button', { class: 'btn small', type: 'button', onclick: analyze }, 'Retry')));
  }
  if (!a) return box.replaceChildren(el('p', { class: 'hint' }, 'Analyzing the source team…'));
  const kids = [];
  const summary = typeof a.summary === 'string' ? a.summary : a.summary ? Object.entries(a.summary).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' · ') : '';
  kids.push(el('div', { class: `summary${S.analyzing ? ' stale' : ''}` }, summary || `${asList(a.plans).length} plans checked.`));

  const changes = asList(a.comparison?.changes);
  kids.push(el('div', {}, el('h3', {}, 'What changed vs the source team'),
    changes.length ? el('div', {}, changes.map(c => el('div', { class: 'change' }, jump(c.id), el('span', { class: 'arrow' }, `${glyph(c.before)} → ${glyph(c.after)}`))))
      : el('p', { class: 'empty' }, S.interventions.length ? 'No plan changed status.' : 'Make an edit to see what moves.')));

  kids.push(el('div', {}, el('h3', {}, 'Plans'), asList(a.plans).map(p => el('div', { class: 'plan-line' }, jump(p.id), statusPill(p.status)))));

  const unchecked = [...new Set(asList(a.plans).flatMap(p => asList(p.unknown).map(refId)).filter(Boolean))];
  kids.push(el('div', {}, el('h3', {}, `Unchecked assumptions · ${unchecked.length}`),
    unchecked.length ? list(unchecked.slice(0, 12), id => S.nodes.has(id) ? jump(id) : refLabel(id)) : el('p', { class: 'empty' }, 'Nothing left unchecked.'),
    asList(S.graph.case?.nextCalculations).length ? el('p', { class: 'hint' }, 'Checks to run: ', asList(S.graph.case.nextCalculations).map(c => (typeof c === 'string' ? c : refLabel(c))).join(' · ')) : null));

  const repairs = mergedRepairs();
  kids.push(el('div', { id: 'repairs' }, el('h3', {}, `Repairs · ${repairs.length}`),
    repairs.length ? repairs.map(repairCard) : el('p', { class: 'empty' }, 'No repairs proposed for this revision.')));

  const warn = asList(S.graph.case?.warnings);
  if (warn.length) kids.push(el('div', {}, el('h3', {}, 'Case notes'), list(warn)));
  const hyp = asList(S.graph.case?.hypotheses);
  if (hyp.length) kids.push(el('div', {}, el('h3', {}, 'What this case tests'), list(hyp, h => (typeof h === 'string' ? h : `${h.claim}${h.test ? ` Test: ${h.test}` : ''}`))));
  box.replaceChildren(...kids);
}
function repairCard(r) {
  const edits = asList(r.edits).length ? asList(r.edits) : [...asList(r.add).map(s => ({ type: 'add_member', speciesId: refId(s) })), ...asList(r.remove).map(s => ({ type: 'remove_member', speciesId: refId(s) }))];
  const kv = (k, v) => (asList(v).length ? el('div', { class: 'kv' }, `${k}: `, el('b', {}, asList(v).map(refLabel).join('; '))) : null);
  const cid = `repair:${r.id}`;
  return el('div', { class: 'repair' },
    el('div', {}, el('strong', {}, r.label || r.id), ' ', r.undo ? el('span', { class: 'chip', title: 'Puts back a component from the source team' }, 'undo') : null, r.status ? statusPill(r.status) : null),
    asList(r.goals).length ? el('div', { class: 'kv' }, 'For: ', asList(r.goals).map((g, i) => [i ? ' · ' : '', S.nodes.has(g) ? jump(g) : refLabel(g)])) : null,
    el('div', { class: 'chips' }, edits.map(e => el('span', { class: 'edit-chip' }, describeEdit(e)))),
    kv('Restores', r.restored), kv('Improves', r.improved), kv('Reopens route', asList(r.routeImprovements).map(x => x.label || x.id)), kv('Loses', r.lost), kv('Still unchecked', r.unresolved), kv('Tradeoffs', r.tradeoffs),
    el('div', { class: 'insp-actions' },
      edits.length ? el('button', { class: 'btn small', type: 'button', onclick: () => { if(S.loadingCase)return; S.interventions.push(...edits); changed(); } }, 'Try it') : null,
      el('button', { class: 'btn small', type: 'button', onclick: () => toggleCollect(cid) }, S.collected.has(cid) ? 'Uncollect' : 'Collect')));
}

// ---------- tray + export ----------
function collectedItems() {
  return [...S.collected].map(id => {
    if (id.startsWith('repair:')) {
      const r = asList(S.analysis?.repairs).concat(repairsAll().flatMap(g => g.repairs)).find(x => `repair:${x.id}` === id);
      return { id, kind: 'repair', label: r?.label || id, data: r || null };
    }
    const n = S.nodes.get(id);
    return { id, kind: n?.kind || 'unknown', label: n?.label || speciesName(id), planIds: plansOf(id), routeIds: n?.routeIds || (n?.routeId ? [n.routeId] : []) };
  });
}
function renderTray() {
  const items = collectedItems();
  $('tray').hidden = !items.length;
  $('tray-chips').replaceChildren(...items.map(i => el('span', { class: 'tray-chip', title: i.label }, `${i.kind}: ${i.label}`)));
}

async function buildExport(scope) {
  if (!isFresh()) throw Error('Wait for the current proposal to finish checking.');
  const seq = S.seq, caseId = S.caseId, c = S.graph.case || {}, a = S.analysis;
  const context = await api(`/api/context?case=${encodeURIComponent(caseId)}`);
  if (seq !== S.seq || caseId !== S.caseId || !isFresh()) throw Error('Inputs changed while exporting. Check again.');
  if (context.meta.graphRevision !== a.graph.revision || context.meta.evaluatorRevision !== a.graph.evaluatorRevision) throw Error('Graph changed. Reload and recheck before exporting.');
  // The server latestRun may belong to another agent. Export this browser's exact accepted run separately.
  const planIds = new Set(collectedItems().flatMap(i => i.kind === 'plan' ? [i.id] : i.planIds || []));
  const plans = asList(a.plans).filter(p => scope === 'all' || planIds.has(p.id));
  return {
    tool: 'gimmikghoul-workbench', exportedAt: new Date().toISOString(), scope,
    case: { id: c.id, title: c.title, format: c.format, battleMode: c.battleMode, bringSize: c.bringSize, question: c.question },
    revision: { graph: a.graph, run: a.run, edits: S.interventions.length, team: a.scenario.team, pinned: [...S.pinned], interventions: S.interventions, interventionResults: a.interventionResults, acceptedScenario: a.scenario, effectiveConditions: a.scenario.conditions || {} },
    collected: collectedItems(),
    analysis: { summary: a.summary ?? null, plans, continuations: a.continuations, conditionStates: a.conditionStates, comparison: a.comparison || null, repairs: scope === 'all' ? mergedRepairs() : undefined },
    replyFormat: 'Propose changes as interventions: remove_member{speciesId}, add_member{speciesId}, set_item{setId,itemId}, set_ability{setId,abilityId}, replace_move{setId,from,to}, set_condition{conditionId,truth}. Cite a source or name the check that would confirm each claim.',
    context,
  };
}
function toMarkdown(x) {
  const L = [];
  L.push(`# Gimmikghoul context: ${x.case.title}`, '', `**Question:** ${x.case.question || '(none)'}`, `**Format:** ${x.case.format} · ${x.case.battleMode}${x.case.bringSize ? ` · bring ${x.case.bringSize}` : ''}`, '');
  L.push('## Current revision', `- Team: ${x.revision.team.map(speciesName).join(', ')}`);
  if (x.revision.pinned.length) L.push(`- Pinned: ${x.revision.pinned.map(speciesName).join(', ')}`);
  for (const [i,e] of x.revision.interventions.entries()) { const result=x.revision.interventionResults?.[i]; L.push(`- Proposal (${result?.applied ? 'applied' : 'rejected'}): ${describeEdit(e)}${result?.reason ? ` — ${result.reason}` : ''}`); }
  L.push('', '## Plans');
  for (const p of x.analysis.plans) {
    L.push(`- **${p.label}**: ${p.status || 'not analyzed'}`);
    if (p.blockers.length) L.push(`  - blocked by: ${p.blockers.map(refLabel).join('; ')}`);
    if (p.missing.length) L.push(`  - missing: ${p.missing.map(refLabel).join('; ')}`);
    if (p.unknown.length) L.push(`  - unchecked: ${p.unknown.map(refLabel).join('; ')}`);
  }
  if (x.collected.length) { L.push('', '## Collected by the player'); for (const i of x.collected) L.push(`- ${i.kind}: ${i.label} (\`${i.id}\`)`); }
  if (x.analysis.repairs?.length) {
    L.push('', '## Repairs proposed');
    for (const r of x.analysis.repairs) L.push(`- ${r.undo ? '(undo) ' : ''}${r.label || r.id} [${r.purposes.join(' · ')}]: ${asList(r.edits).map(describeEdit).join('; ')}${asList(r.lost).length ? ` · loses ${asList(r.lost).map(refLabel).join('; ')}` : ''}`);
  }
  L.push('', '## Evaluated routes, accepted state and provenance', '```json', JSON.stringify({revision:x.revision,analysis:x.analysis}, null, 2), '```');
  L.push('', '## Reply format', x.replyFormat);
  if (x.context) L.push('', '## Case context (from /api/context)', '```json', JSON.stringify(x.context, null, 2), '```');
  return L.join('\n');
}
async function openExport(scope) {
  const dlg = $('export-dialog');
  if (scope) dlg.querySelector(`input[name=scope][value=${scope}]`).checked = true;
  if (!dlg.open) dlg.showModal();
  await refreshExport();
}
async function refreshExport() {
  const exportSeq = S.exportSeq = (S.exportSeq || 0) + 1;
  const dlg = $('export-dialog');
  const fmt = dlg.querySelector('input[name=fmt]:checked').value, scope = dlg.querySelector('input[name=scope]:checked').value;
  $('export-status').textContent = 'Building…';
  $('export-text').value = ''; $('export-copy').disabled = true; $('export-download').disabled = true;
  let x; try { x = await buildExport(scope); } catch (err) { if(exportSeq === S.exportSeq) $('export-status').textContent = err.message; return; }
  if(exportSeq !== S.exportSeq)return;
  S.completedExport = {fmt,caseId:x.case.id};
  $('export-copy').disabled = false; $('export-download').disabled = false;
  $('export-text').value = fmt === 'json' ? JSON.stringify(x, null, 2) : toMarkdown(x);
  $('export-status').textContent = `${x.collected.length} collected · revision ${x.revision.edits}`;
}

// ---------- wiring ----------
$('export-open').addEventListener('click', () => openExport());
$('tray-export').addEventListener('click', () => openExport('collected'));
$('tray-clear').addEventListener('click', () => { if(S.loadingCase)return; S.collected.clear(); store.save(); renderMap(); renderTray(); renderInspector(); });
$('export-dialog').addEventListener('change', refreshExport);
$('export-copy').addEventListener('click', async () => {
  const t = $('export-text');
  try { await navigator.clipboard.writeText(t.value); $('export-status').textContent = 'Copied'; }
  catch { t.select(); $('export-status').textContent = 'Selected; press ⌘C'; }
});
$('export-download').addEventListener('click', () => {
  const {fmt,caseId} = S.completedExport;
  const blob = new Blob([$('export-text').value], { type: fmt === 'json' ? 'application/json' : 'text/markdown' });
  const a = el('a', { href: URL.createObjectURL(blob), download: `gimmikghoul-${caseId}.${fmt === 'json' ? 'json' : 'md'}` });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
$('reset-all').addEventListener('click', () => { if(S.loadingCase)return; S.interventions = []; changed(); });
$('show-breaks').addEventListener('change', ev => { S.showBreaks = ev.target.checked; renderMap(); });
document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && S.selected && !$('export-dialog').open) select(S.selected); });
window.addEventListener('resize', () => requestAnimationFrame(drawStrings));
$('map').addEventListener('scroll', () => requestAnimationFrame(drawStrings));
window.addEventListener('hashchange', () => { const id = decodeURIComponent(location.hash.slice(1)); if (id && id !== S.caseId && S.cases.some(c => c.id === id)) openCase(id); });

boot();
