# Decoded: Integration Plan (both of you)

## Setup decision: two Replits, one contract
- **Frontend Replit** (Chaitanya) and **Backend Replit** (teammate). No shared repo means no merge conflicts.
- They connect through one env var: frontend `VITE_API_BASE_URL` = the backend's published URL.
- For the demo, you show the frontend URL and it calls the backend URL. That's fine.

## Kickoff (first 10 min, together)
1. Both read `1_API_CONTRACT.md`. Change anything now, not later.
2. Agree on the 3 **demo decode links**: 1 X post (live path), 1 LinkedIn post (shows the paste fallback), 1 Substack post.
3. Agree on the seed post list, so the mock posts and real posts are about the same topics and the demo story doesn't change at integration.
4. Shared chat channel for contract changes.

## Sync checkpoints

| When | Backend delivers | Frontend does |
|---|---|---|
| **+45 min** | Published URL, `/api/health` | Sets `VITE_API_BASE_URL`; still all mocks |
| **+1h30** | `/me`, `/feed`, `/terms/:id`, `/authors`, `/path` from seed | Adds `getMe getFeed getTerm getAuthors getPath` to the `LIVE` set → Pulse runs on real data |
| **+2h30** | `/decode`, `/lesson/today`, `/answer`, `/complete`, `/terms/:id/queue`, dev routes | Moves those to `LIVE`; tests the full loop |
| **+3h15** | `/chat`, `/placement`, `/feed/refresh` | All live; `VITE_USE_MOCKS=false` |
| **Last 30 min** | **Code freeze.** `/dev/reset` verified | Rehearse 3× on the real stack; record a backup video |

## Integration checklist
- [ ] CORS works from the frontend domain (check the browser console)
- [ ] Every response passes TypeScript on the frontend. Watch for `tldr` keys, `terms[].term` exact text, and `answerIndex`
- [ ] Term highlighting finds the backend's `terms[].term` strings in the TL;DR text
- [ ] Queue a term in Pulse → `/dev/next-day` → the lesson shows it with `fromFeed: true`
- [ ] Completing a lesson raises the streak and the fluency number, and the header updates
- [ ] Decode: X link works live, LinkedIn shows the paste fallback, pasted text works, the demo links decode in under 8s
- [ ] Unplug test: turn off `LLM_API_KEY` and confirm the lesson template fallback and the decode demo cache still work
- [ ] `/dev/reset` puts everything back to the demo starting state

## If integration breaks at 2:45
Set `VITE_USE_MOCKS=true` and demo on mocks. The UI is identical. Then show **only Decode** live (move just `decode` and `chat` to `LIVE`). That keeps the "working product" score with minimal risk.
