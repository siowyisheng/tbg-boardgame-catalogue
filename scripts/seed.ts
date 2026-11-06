// Loads src/data/games.json into Supabase. Safe to re-run:
//  - inserts games that have never existed
//  - refreshes attributes of existing games, but never overwrites verified data with unverified data
//  - never changes the `removed` flag
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import type { Game } from '../shared/types'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
const supabase = createClient(url, key, { auth: { persistSession: false } })

const games: Game[] = JSON.parse(readFileSync(new URL('../src/data/games.json', import.meta.url), 'utf8'))
const { data: existing, error } = await supabase.from('games').select('slug, verified')
if (error) throw error
const have = new Map((existing ?? []).map((r) => [r.slug as string, r.verified as boolean]))

let inserted = 0, updated = 0, skipped = 0
for (const g of games) {
  const row = {
    slug: g.slug, bgg_id: g.bggId, name: g.name, min_players: g.minPlayers, max_players: g.maxPlayers,
    best_players: g.bestPlayers, playing_time: g.playingTime, weight: g.weight, rating: g.rating,
    types: g.types, categories: g.categories, cover_url: g.coverUrl, verified: g.verified,
  }
  if (!have.has(g.slug)) {
    const { error } = await supabase.from('games').insert({ ...row, removed: false })
    if (error) throw error
    inserted++
  } else if (have.get(g.slug) && !g.verified) {
    skipped++
  } else {
    const { error } = await supabase.from('games').update(row).eq('slug', g.slug)
    if (error) throw error
    updated++
  }
}
console.log(`Seed done: ${inserted} inserted, ${updated} updated, ${skipped} left alone (already verified).`)
