import type { Game } from '../../shared/types'
import { complexityBand, timeBand, type ComplexityBand, type TimeBand } from './bands'

export interface Filters {
  query: string
  players: number | null
  bestOnly: boolean
  times: TimeBand[]
  complexities: ComplexityBand[]
  minRating: number
  types: string[]
  categories: string[]
}

export const EMPTY_FILTERS: Filters = {
  query: '',
  players: null,
  bestOnly: false,
  times: [],
  complexities: [],
  minRating: 0,
  types: [],
  categories: [],
}

export function activeFilterCount(f: Filters): number {
  return (
    (f.players != null ? 1 : 0) +
    f.times.length +
    f.complexities.length +
    (f.minRating > 0 ? 1 : 0) +
    f.types.length +
    f.categories.length
  )
}

/** Different filters combine with AND; several values inside one filter combine with OR. */
export function applyFilters(games: Game[], f: Filters): Game[] {
  const q = f.query.trim().toLowerCase()
  return games.filter((g) => {
    if (q && !g.name.toLowerCase().includes(q)) return false
    if (f.players != null) {
      if (f.bestOnly) {
        if (!g.bestPlayers.includes(f.players)) return false
      } else if (g.minPlayers == null || g.maxPlayers == null || f.players < g.minPlayers || f.players > g.maxPlayers) {
        return false
      }
    }
    if (f.times.length) {
      const b = timeBand(g.playingTime)
      if (!b || !f.times.includes(b)) return false
    }
    if (f.complexities.length) {
      const b = complexityBand(g.weight)
      if (!b || !f.complexities.includes(b)) return false
    }
    if (f.minRating > 0 && (g.rating == null || g.rating < f.minRating)) return false
    if (f.types.length && !g.types.some((t) => f.types.includes(t))) return false
    if (f.categories.length && !g.categories.some((c) => f.categories.includes(c))) return false
    return true
  })
}

export function distinct(games: Game[], pick: (g: Game) => string[]): string[] {
  return [...new Set(games.flatMap(pick))].sort((a, b) => a.localeCompare(b))
}
