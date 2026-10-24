# Decoded: Frontend

Duolingo for learning AI, where today's internet is the textbook. React + Vite + TypeScript + Tailwind.

## Run on Replit (5 min)
1. In Replit, create a new app from the **"Vite + React"** (or blank Node.js) template.
2. Delete the template's files, then **drag the contents of this folder** into the Files pane (or upload `decoded-frontend.zip` and run `unzip decoded-frontend.zip -d . && rm decoded-frontend.zip` in the Shell).
3. In the Shell: `npm install && npm run dev`, or just press **Run** (the `.replit` file is included).
4. Open the webview. The app runs entirely on built-in mock data, so it works before the backend exists.

**Deploy (for a stable demo URL):** Deploy → Autoscale / Static → build `npm run build`, output dir `dist` (or keep the `.replit` deployment config).

## Connect the backend
All data goes through `src/api.ts`. Nothing else needs to change.
1. Replit **Secrets**: `VITE_API_BASE_URL` = backend's published URL (no trailing slash), `VITE_USE_MOCKS=true`. **Restart** the app, because Vite reads env vars only at startup.
2. In `src/api.ts`, add endpoint names to the `LIVE` set as your teammate ships them (e.g. `"getMe", "getFeed", "getTerm"`).
3. When everything is live, set `VITE_USE_MOCKS=false`.
4. If any live call fails, it logs the error and **falls back to the mock**, so the demo never shows a broken screen.

Types in `src/types.ts` match `1_API_CONTRACT.md` exactly.

## Demo controls
Go to **Me**, then **tap the avatar 3×**: Simulate next day · Show onboarding · Reset demo.

## Demo path (≈90 seconds)
1. **Pulse** → tap an underlined word (e.g. *inference costs*) → **Add to tomorrow's lesson**
2. Switch 🌱 Beginner → 🌳 **Pro**: the same post rewrites itself
3. **+ Decode** → "LinkedIn post" sample → shows the *paste text instead* fallback → paste text → decoded card
4. **Dive deeper** → "Explain like I'm new" / "How would I mention this in a meeting?"
5. **Learn** → today's lesson now has "✨ From your feed" → finish → confetti + **"You can now read 60% → 72% of today's feed"**

Edit the sample decode links in `src/components/Sheets.tsx` → `SAMPLE_LINKS`.

## Where things live
| File | What |
|---|---|
| `src/api.ts` | Every backend call + mock switch |
| `src/mocks.ts` / `src/mockData.ts` | Stateful mock backend + seed content (fictional sample authors) |
| `src/pages/*` | Learn, Lesson, LessonDone, Pulse, Chat, People, Me, Onboarding |
| `src/components/PostCard.tsx` | Post card + term highlighter |
| `src/components/Sheets.tsx` | Term sheet + Decode sheet |
