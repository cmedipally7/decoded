# Decoded

Duolingo for learning AI, where today's internet is the textbook.

| Folder | What |
|---|---|
| [`frontend/`](frontend/) | React + Vite + TypeScript app (runs standalone on mock data) — see [frontend/README.md](frontend/README.md) |
| [`docs/`](docs/) | PRD, API contract, frontend/backend specs, integration plan |
| `backend/` | Node/Express API (built to [`docs/1_API_CONTRACT.md`](docs/1_API_CONTRACT.md)) |

## Run the frontend

```bash
cd frontend
npm install && npm run dev   # http://localhost:5173
```

It runs entirely on a stateful mock backend, so it works before the API exists.
