// Verifies every game in src/data/games.json against BoardGameGeek and rewrites the file.
//   npm run fetch-bgg              all games
//   npm run fetch-bgg -- slug ...  only these slugs
// Needs BGG_TOKEN in .env. Writes scripts/out/match-report.md so you can check each match.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fetchBggGame, searchBgg } from '../shared/bgg'
import type { Game } from '../shared/types'

const token = process.env.BGG_TOKEN
if (!token) throw new Error('Set BGG_TOKEN in .env first')

const file = new URL('../src/data/games.json', import.meta.url)
const games: Game[] = JSON.parse(readFileSync(file, 'utf8'))
const only = new Set(process.argv.slice(2))
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '')

const report: string[] = ['| Our title | Matched on BGG | Year | BGG id | Status |', '|---|---|---|---|---|']
for (const [i, g] of games.entries()) {
  if (only.size && !only.has(g.slug)) continue
  try {
    let id = g.bggId
    let year: number | null = null
    if (!id) {
      const hits = await searchBgg(g.name, token)
      if (!hits.length) {
        report.push(`| ${g.name} | – | – | – | NO MATCH, left unverified |`)
        continue
      }
      const hit = hits.find((h) => norm(h.name) === norm(g.name)) ?? hits[0]
      id = hit.id
      year = hit.year
      await sleep(1100)
    }
    const fresh = await fetchBggGame(id, token)
    // Keep the slug stable so existing share links keep working.
    games[i] = { ...fresh, slug: g.slug, removed: g.removed }
    const same = norm(fresh.name) === norm(g.name)
    report.push(`| ${g.name} | ${fresh.name} | ${year ?? ''} | [${id}](https://boardgamegeek.com/boardgame/${id}) | ${same ? 'ok' : 'CHECK – name differs'} |`)
    console.log(`${same ? 'ok   ' : 'CHECK'} ${g.name} -> ${fresh.name} (${id})`)
  } catch (e) {
    report.push(`| ${g.name} | – | – | – | ERROR: ${(e as Error).message} |`)
    console.error(`ERROR ${g.name}: ${(e as Error).message}`)
  }
  await sleep(1100)
}

writeFileSync(file, JSON.stringify(games, null, 2) + '\n')
mkdirSync(new URL('./out/', import.meta.url), { recursive: true })
writeFileSync(new URL('./out/match-report.md', import.meta.url), report.join('\n') + '\n')
console.log('Wrote src/data/games.json and scripts/out/match-report.md – review the report, then run `npm run seed`.')
