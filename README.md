# Decoded

Duolingo for learning AI, where today's internet is the textbook.

| Folder | What |
|---|---|
| [`frontend/`](frontend/) | React + Vite + TypeScript app (runs standalone on mock data) — see [frontend/README.md](frontend/README.md) |
| [`docs/`](docs/) | PRD, API contract, frontend/backend specs, integration plan |
| [`backend/`](backend/) | Node API. One command, no native addons. News seed is `backend/seed/news.json`. |

## Run the frontend

```bash
cd frontend
npm install && npm run dev   # http://localhost:5173
```

It runs entirely on a stateful mock backend, so it works before the API exists.

## Run the API

```bash
cd backend && npm install && npm test && npm start
```

Replit runs the same API on port 5173 and serves the built frontend. Docker: `docker build -t decoded-api backend && docker run -p 3000:3000 decoded-api`. Drop a new scraper file at `backend/seed/news.json` and call `POST /api/feed/refresh`.
