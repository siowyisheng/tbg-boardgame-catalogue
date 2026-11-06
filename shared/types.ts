export interface Game {
  slug: string
  bggId: number | null
  name: string
  minPlayers: number | null
  maxPlayers: number | null
  bestPlayers: number[]
  playingTime: number | null
  weight: number | null
  rating: number | null
  types: string[]
  categories: string[]
  coverUrl: string | null
  verified: boolean
  removed?: boolean
}

export interface Report {
  id: string
  gameSlug: string
  gameName?: string
  kind: 'missing' | 'damaged'
  component: string
  note: string
  reporterName: string | null
  reporterEmail: string | null
  resolved: boolean
  createdAt: string
}
