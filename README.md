# Vokabattle EN ⚔️ ES

A two-player vocab duel for learning English and Spanish. One player opens a room, the other joins with a 4-letter code or invite link. Players take turns: the quizmaster picks a word card, the guesser has 20 seconds to translate it while the quizmaster watches them type live.

- Each player chooses their own learning direction (EN → ES, ES → EN or mixed)
- UI in German, English and Spanish
- Typed answers or multiple choice, hints, streak bonus, trash talk and emoji reactions

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. To try it alone, use a second (incognito) window as player two.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/lib/game.ts` | Game logic, in-memory room store, per-player views |
| `src/lib/vocab.ts` | Word list (add words here) |
| `src/lib/i18n.tsx` | UI translations and language switcher |
| `src/app/api/rooms/` | API routes (create, join, actions, polling) |
| `src/components/` | Room shell and game screens |

## Limitations

Rooms are stored in server memory. They're lost on restart and need a single long-running Node process (`npm run build && npm start`). Serverless hosting such as Vercel would need a shared store like Redis. Clients poll the server about once per second.
