# Decoded: context for Claude Code

Hackathon project (demo at 3:00 PM ET, Oct 24 2026). "Duolingo for learning AI, where today's internet is the textbook."
Judged on: unique insight, problem worth solving, working product, demo (25% each).

## What this repo is
Monorepo. `frontend/` is the React app; `docs/` holds the shared specs; the backend lands in `backend/`.
Frontend: React 18 + Vite 5 + TypeScript + Tailwind 3, framer-motion, react-router (HashRouter), lucide-react, canvas-confetti.
Runs fully on a stateful mock backend (`frontend/src/mocks.ts` + `frontend/src/mockData.ts`), so it works before the real backend exists.
Backend is built separately by a teammate (Node/Express) in `backend/` to the API contract in `docs/1_API_CONTRACT.md` (the shapes are mirrored in `frontend/src/types.ts`).

## Commands
- `cd frontend && npm install && npm run dev`: dev server on :5173
- `cd frontend && npm run build`: type-check + build (must pass before committing)
- `cd frontend && npx vite build -c vite.single.config.ts`: single-file build in `frontend/dist-single/` (used for the hosted backup demo)

## Architecture rules
- **All data access goes through `frontend/src/api.ts`.** Never call fetch or mocks from components.
- Each api function is live or mock per endpoint: add its name to the `LIVE` set once the backend ships it. Live failures fall back to mocks.
- Env: `VITE_API_BASE_URL`, `VITE_USE_MOCKS` (see `frontend/.env.example`).
- Don't rename fields in `frontend/src/types.ts` without updating the contract and telling the backend owner.
- Global UI state is in `frontend/src/context.tsx`: user, viewLevel (beginner/amateur/pro), toast, term sheet, decode sheet, post cache.

## Key files
- `frontend/src/pages/`: Learn (home + skill path), Lesson (5 card types: concept, mcq, match, real_post, fill_blank), LessonDone, Pulse (feed + level toggle + filters), Chat (deep dive), People, Me (dev controls: tap avatar 3×), Onboarding (Welcome / Placement / Result)
- `frontend/src/components/PostCard.tsx`: post card + `highlight()` term underlining
- `frontend/src/components/Sheets.tsx`: TermSheet (add term to tomorrow's lesson) + DecodeSheet (URL/text → decoded card, with "paste text instead" fallback). `SAMPLE_LINKS` = rehearsed demo links.
- `frontend/src/components/Layout.tsx`: PhoneFrame (420px), StreakHeader, TabLayout + Decode floating button

## The core demo loop (must never break)
Pulse → tap underlined term → "Add to tomorrow's lesson" → Learn shows "✨ words from your feed" → finish lesson → confetti + "You can now read 60% → 72% of today's feed".
Plus: level toggle rewrites the TL;DR; Decode a LinkedIn link → paste-text fallback → decoded card → Dive deeper chat.

## Style
Nunito; brand violet #7C3AED (`brand-*`), success `ok-*`, error `bad-*`, streak `flame-*`. Duolingo-style 3D buttons (`.btn-primary`, `.btn-ok`, `.btn-ghost` in `frontend/src/index.css`). Mobile-first; nothing may overflow the 420px frame.

## Open TODOs
- Replace the fictional sample authors/posts in `mockData.ts` with the real seed data from the backend.
- Swap `SAMPLE_LINKS` for the 3 rehearsed demo links.
- Connect endpoints as the backend ships them (`LIVE` set in `api.ts`).
