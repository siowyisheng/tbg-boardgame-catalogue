# Team Board Game – catalogue

A mobile-first catalogue of the board games at Team Board Game. Customers can search and filter the games, shortlist 1–8 of them and share the shortlist as a link or an image, and report missing or damaged components. An admin adds and removes games and handles reports at `/admin`.

- **Frontend:** Vite + React + TypeScript (`src/`)
- **API:** Vercel serverless functions (`api/`)
- **Database:** Supabase Postgres (`supabase/schema.sql`)
- **Data:** `src/data/games.json`, filled in from BoardGameGeek by `npm run fetch-bgg`

Domain vocabulary is in [`CONTEXT.md`](./CONTEXT.md). To deploy it, follow [`SETUP.md`](./SETUP.md).

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
```

Without the API running, the app uses the bundled `src/data/games.json`, so browsing, filters and the shortlist all work. Reports and the admin area need the deployed API.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Typecheck and production build |
| `npm run typecheck` | Typecheck the app and the server code |
| `npm run fetch-bgg` | Verify games against BoardGameGeek and rewrite `games.json` (needs `BGG_TOKEN`) |
| `npm run seed` | Load `games.json` into Supabase (needs the Supabase keys) |

Copy `.env.example` to `.env` and fill it in. `.env` is git-ignored.
