# Setup

You only do this once. It takes about 15 minutes.

## 1. Supabase (database)

1. Create a free project at <https://supabase.com>.
2. Open **SQL editor**, paste the contents of `supabase/schema.sql`, and run it.
3. Open **Project settings → API** and copy:
   - the **Project URL** → `SUPABASE_URL`
   - the **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep it secret: it bypasses all access rules)

## 2. Vercel (hosting)

1. Go to <https://vercel.com/new>, import the `tbg-boardgame-catalogue` GitHub repo. Vercel detects Vite on its own.
2. Before the first deploy, add these **Environment variables**:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | from step 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from step 1 |
   | `ADMIN_PASSWORD` | the shared password for the admin area |
   | `SESSION_SECRET` | a long random string, e.g. the output of `openssl rand -hex 32` |
   | `BGG_TOKEN` | leave out until BoardGameGeek approves your application |

3. Deploy. The site is live at the `.vercel.app` address Vercel shows you.

## 3. Load the games into the database

On your own computer:

```bash
git clone https://github.com/siowyisheng/tbg-boardgame-catalogue.git
cd tbg-boardgame-catalogue
npm install
cp .env.example .env     # fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm run seed
```

Re-running the seed is safe. It never brings back a game an admin removed, and it never overwrites verified data with estimates.

## 4. Check the real BoardGameGeek data (once your token arrives)

The data in `games.json` starts as **estimates, marked unverified**. When BGG approves your application:

1. Put the token in `.env` as `BGG_TOKEN` (and add it to Vercel as well, so the admin "Look up on BGG" button works).
2. Run `npm run fetch-bgg`. It searches BGG for each game, rewrites `src/data/games.json`, and writes `scripts/out/match-report.md`.
3. Open the report and look for rows marked **CHECK** (BGG's name differs from ours, so it may be the wrong game) or **NO MATCH**. Fix those by putting the right BGG id in `games.json` (`"bggId": 12345`) and re-running `npm run fetch-bgg -- <slug>`.
4. Run `npm run seed` again to push the verified data, then commit `games.json`.

## Using it

- Public site: your Vercel address.
- Admin: `<your address>/admin`, with the shared password. Add, remove and restore games, and work through reports.
- Until the BGG token exists, add a game by typing its details in by hand. It shows as unverified until a refresh from BGG confirms it.
