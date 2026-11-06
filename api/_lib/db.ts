import { createClient } from '@supabase/supabase-js'
import type { Game } from '../../shared/types.js'

export function db() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  return createClient(url, key, { auth: { persistSession: false } })
}

export interface GameRow {
  slug: string
  bgg_id: number | null
  name: string
  min_players: number | null
  max_players: number | null
  best_players: number[]
  playing_time: number | null
  weight: number | null
  rating: number | null
  types: string[]
  categories: string[]
  cover_url: string | null
  verified: boolean
  removed: boolean
}

export const toRow = (g: Game): GameRow => ({
  slug: g.slug,
  bgg_id: g.bggId,
  name: g.name,
  min_players: g.minPlayers,
  max_players: g.maxPlayers,
  best_players: g.bestPlayers,
  playing_time: g.playingTime,
  weight: g.weight,
  rating: g.rating,
  types: g.types,
  categories: g.categories,
  cover_url: g.coverUrl,
  verified: g.verified,
  removed: g.removed ?? false,
})

export const fromRow = (r: GameRow): Game => ({
  slug: r.slug,
  bggId: r.bgg_id,
  name: r.name,
  minPlayers: r.min_players,
  maxPlayers: r.max_players,
  bestPlayers: r.best_players ?? [],
  playingTime: r.playing_time,
  weight: r.weight == null ? null : Number(r.weight),
  rating: r.rating == null ? null : Number(r.rating),
  types: r.types ?? [],
  categories: r.categories ?? [],
  coverUrl: r.cover_url,
  verified: r.verified,
  removed: r.removed,
})
