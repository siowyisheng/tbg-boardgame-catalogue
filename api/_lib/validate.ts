import type { Game } from '../../shared/types.js'
import { slugify } from '../../shared/slug.js'

const num = (v: unknown, min: number, max: number): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < min || n > max) throw new Error('A number is out of range')
  return n
}
const strs = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean).slice(0, 30) : []

/** Validates an admin-submitted game; throws an Error with a user-facing message. */
export function parseGame(body: any): Game {
  const name = String(body?.name ?? '').trim()
  if (!name || name.length > 200) throw new Error('Name is required')
  const best = Array.isArray(body.bestPlayers) ? body.bestPlayers.map(Number).filter((n: number) => Number.isInteger(n) && n > 0 && n < 100) : []
  const rating = num(body.rating, 0, 10)
  return {
    slug: slugify(name),
    bggId: num(body.bggId, 1, 1e8),
    name,
    minPlayers: num(body.minPlayers, 1, 99),
    maxPlayers: num(body.maxPlayers, 1, 99),
    bestPlayers: best,
    playingTime: num(body.playingTime, 1, 10000),
    weight: num(body.weight, 1, 5),
    rating: rating == null ? null : Math.round(rating * 10) / 10,
    types: strs(body.types),
    categories: strs(body.categories),
    coverUrl: body.coverUrl ? String(body.coverUrl).slice(0, 500) : null,
    verified: body.verified === true,
    removed: false,
  }
}
