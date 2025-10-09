## Welp – AI Study Planner

Generate a structured study plan from your content, visualize it as a graph, add notes, and open topics in your favorite AI (ChatGPT, Claude, Grok). Plans persist locally (no database).

### Features
- AI-generated study plan (days → topics → subtopics)
- Interactive graph with custom nodes (expand details, add note nodes)
- One-click “Open in ▾” (ChatGPT / Claude / Grok)
- Auto-save and restore via localStorage
- Export plan as JSON
- Mobile restriction page for a desktop-first UX

### Tech Stack
- Next.js (App Router), React, TypeScript
- React Flow (@xyflow/react) for graph UI
- Dagre for hierarchical layout
- Zod for server-side schema validation

### Quick Start
```bash
npm install
npm run dev
# open http://localhost:3000
```

### How It Works (Flow)
1) Paste content and click Generate → POST `/api/chat`
2) Server validates response (Zod), converts to React Flow nodes/edges, lays out with Dagre
3) Client sets `nodes`/`edges` state and persists to `localStorage`
4) On refresh, state is hydrated from `localStorage` and rendered immediately

### Key Files
- `src/app/api/chat/route.ts` – AI prompt, Zod schemas, Dagre layout, response
- `src/components/StudyFlow.tsx` – orchestrates input → generation → graph → persistence
- `src/components/CustomNode.tsx` – node UI (details, notes, “Open in ▾”)
- `src/components/input/InputCard.tsx` – empty-state input panel
- `src/components/menu/TopPanel.tsx` – top-left menu (clear/new/export)
- `src/components/loading-card.tsx` – loading spinner + tips
- `src/lib/storage.ts` – localStorage helpers (save/load/clear, safe serialization)

### Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm start` – run production build

### Notes
- Plans are saved under the key `welp.studyPlan.v1` in localStorage.
- No external DB is required.

### License
MIT
