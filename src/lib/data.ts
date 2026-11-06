import type { Game } from '../../shared/types'
import bundled from '../data/games.json'

export interface Catalogue {
  games: Game[]
  /** "live" when loaded from the database, "bundled" when using the games.json shipped with the app. */
  source: 'live' | 'bundled'
}

export async function loadCatalogue(): Promise<Catalogue> {
  try {
    const res = await fetch('/api/games')
    if (res.ok) {
      const games = (await res.json()) as Game[]
      if (Array.isArray(games)) return { games, source: 'live' }
    }
  } catch {
    // fall through to bundled data (local development without the API)
  }
  return { games: (bundled as Game[]).filter((g) => !g.removed), source: 'bundled' }
}
