# Frontend contract

The frontend is being implemented in `workbench/public/` as static `index.html`, `styles.css`, and `app.js`. Serve these from `/` with the API on the same origin. No build step or dependency is required.

Required baseline:

- `GET /api/cases` → `{cases:[{id,title,format,summary}]}`
- `GET /api/graph?case=ID` → `{case:{id,title,format,summary},nodes:[{id,label,kind,description,status,sourceUrl?,...}],edges:[{id,source,target,type,label?}],team:[nodeIds],meta:{...}}`
- `POST /api/analyze` with `{caseId,team:[nodeIds],conditions:{}}` → `{plans:[{id,label,status,missing:[],blockers:[],...}],repairs:[],summary}`
- `GET /api/context?case=ID` → structured context; frontend wraps it with current selections, conditions, local exploration notes, and analysis for export.

Frontend handles unknown node kinds and status values. Strings and objects are accepted for missing prerequisites, blockers, repair entries and source entries. Node references may use `id`, `nodeId`, or `target`; human-readable object text should use `label`, `title`, `description`, or `reason`. Team members should refer to node IDs. Pokémon candidates are identified by `kind` containing `pokemon`, `species`, or `member`, or by membership in the initial team.

Helpful optional fields:

- Nodes: `sources:[{title,url}]`, `evidence`, `format`, `asOf`, `requirements`, `alternatives`.
- Edges: `description`, `status`, `sources:[{title,url}]`, `sourceUrl`.
- Meta: `asOf` or `snapshot`, `source`, `backend`, `conditions:[{id,label,description,default}]`.
- Repairs: `nodeId` or `add:[nodeIds]` and optional `remove:[nodeIds]` enable an explicit preview/apply action. Free-text repairs remain readable.

All source URLs are restricted to HTTP(S). Notes are stored locally per case in browser storage. The app displays API failures with retry and does not substitute invented case data or efficacy estimates.

Ownership: this collaborator edits only `workbench/public/` plus these frontend handoff documents. Backend, data, packages, canvas, and commits belong to the parent chat.
