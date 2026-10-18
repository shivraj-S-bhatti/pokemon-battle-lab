# UI progress

Owner: Claude. Scope: `workbench/public/`, `UI_CONTRACT.md`, this file.

## State

- [x] Read hypotheses, PokeSynergy notes, logic contract, case data and the previous frontend.
- [x] Wrote `UI_CONTRACT.md`.
- [x] Shell: case tabs, case banner, three-column workbench.
- [x] Plan map: members → plans → needs / breaks-if, click to trace, shift-click to collect.
- [x] Interventions: include/remove member, pin, item / ability / move edits, condition toggles, revision log with undo.
- [x] Analysis: plan status, what changed, unknown assumptions, repairs grouped by purpose, alternatives bench.
- [x] Agent context export (JSON and Markdown).
- [x] Browser check against the scratch dev server (1440×900 and 375×812): case switching, member removal, condition toggles, selection tracing, collect + Markdown export. No console errors.
- [x] Dev server now calls the real `workbench/logic` (`analyzeCase`, `buildCaseModel`) for graph and analysis. Checked: an assumption made before an edit is invalidated by that edit (true → unknown); structural needs show computed ✓/✗; repairs merge across goals; undo repairs are labeled and listed last; routes are shown separately.
- [ ] Check against the real backend and `workbench/logic` output once `/api/*` exists. The dev stub's repairs are placeholders, so repair cards are only checked for layout.

## Notes

- The previous frontend (Codex) was a generic graph adapter. Replaced with a layout built for plans and prerequisites.
- No backend existed at start. Verified locally against a throwaway dev server in the session scratchpad that serves `public/` and adapts `data/workbench-cases.json`; it is not part of the repo.

## Layout

- Top: case tabs and "Export for agent". Banner: case title, question, format, usage snapshot and evidence status chips.
- Left: team cards (include checkbox, pin, set editor for item / ability / move), bench of case alternatives with "Try", and the edit log with undo.
- Middle: plan map. Members on the left, one row per plan: plan card (status, "was X" badge after edits, participants), Needs (AND list with ✓ ? ✗ assumption toggles) and Breaks if. Red strings connect members to plans; click traces, shift-click collects.
- Right: inspector for the selected node, then analysis: summary, what changed vs the source team, plan statuses, unchecked assumptions with the case's checks to run, repairs grouped by purpose (Try it / Collect), case notes and the hypothesis the case tests.
- Export dialog: Markdown or JSON, whole case or collected nodes, copy or download. It includes the reply format (intervention types) so an agent can answer in edits.
- Per-case state (edits, assumptions, pins, collected) persists in localStorage.

## Changes after the logic review (2026-10-18)

- Assumptions are `set_condition` edits in chronological order, not a `conditions` map. Older saved state is migrated.
- Plan inspector shows each route (an AND) separately, with its unmet leaves; the plan needs any one route.
- Toggles only on assumable needs; computed needs show their truth.
- No tests added, per Shivraj.
