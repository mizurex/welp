## Welp – AI Study Planner

Generate a structured study plan for your content, visualize it as a graph, add notes, and open topics in your favorite AI (ChatGPT, Claude, Grok). Plans persist locally.

### Features
- AI-generated study plan 
- Interactive graph with custom nodes 
- Auto-save and restore via indexed db
- Export plan as JSON

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
2) Server validates response, converts to React Flow nodes/edges, lays out with Dagre
3) Client sets `nodes`/`edges` state and persists to `localStorage`


### Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm start` – run production build

### Notes
- No external DB is required.


