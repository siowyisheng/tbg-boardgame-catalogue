import { XMLParser } from 'fast-xml-parser'
import type { Game } from './types.js'
import { slugify } from './slug.js'

const BASE = 'https://boardgamegeek.com/xmlapi2'
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

const arr = <T>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v])

async function bggGet(path: string, token: string): Promise<any> {
  const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } })
  if (res.status === 202) {
    await new Promise((r) => setTimeout(r, 2000))
    return bggGet(path, token)
  }
  if (!res.ok) throw new Error(`BGG ${res.status} for ${path}`)
  return parser.parse(await res.text())
}

export interface SearchHit {
  id: number
  name: string
  year: number | null
}

export async function searchBgg(query: string, token: string): Promise<SearchHit[]> {
  const q = encodeURIComponent(query)
  let data = await bggGet(`/search?query=${q}&type=boardgame&exact=1`, token)
  let items = arr<any>(data.items?.item)
  if (!items.length) {
    data = await bggGet(`/search?query=${q}&type=boardgame`, token)
    items = arr<any>(data.items?.item)
  }
  return items.map((it) => {
    const n = arr<any>(it.name).find((x) => x['@_type'] === 'primary') ?? arr<any>(it.name)[0]
    return {
      id: Number(it['@_id']),
      name: String(n?.['@_value'] ?? ''),
      year: it.yearpublished ? Number(it.yearpublished['@_value']) : null,
    }
  })
}

/** Counts the community rates "Best": Best votes are the largest of the three options. */
function bestCounts(poll: any): number[] {
  const out: number[] = []
  for (const r of arr<any>(poll?.results)) {
    const n = String(r['@_numplayers'])
    if (!/^\d+$/.test(n)) continue
    const votes: Record<string, number> = {}
    for (const x of arr<any>(r.result)) votes[x['@_value']] = Number(x['@_numvotes'])
    const best = votes['Best'] ?? 0
    if (best > 0 && best >= (votes['Recommended'] ?? 0) && best >= (votes['Not Recommended'] ?? 0)) {
      out.push(Number(n))
    }
  }
  return out
}

export async function fetchBggGame(id: number, token: string): Promise<Omit<Game, 'slug'>> {
  const data = await bggGet(`/thing?id=${id}&stats=1`, token)
  const item = arr<any>(data.items?.item)[0]
  if (!item) throw new Error(`BGG id ${id} not found`)
  const primary = arr<any>(item.name).find((x) => x['@_type'] === 'primary') ?? arr<any>(item.name)[0]
  const links = arr<any>(item.link)
  const ranks = arr<any>(item.statistics?.ratings?.ranks?.rank)
  const types = ranks
    .filter((r) => r['@_type'] === 'family' && r['@_value'] !== 'Not Ranked')
    .map((r) => String(r['@_friendlyname']).replace(/ Game Rank$/, '').replace(/ Rank$/, ''))
  const rating = Number(item.statistics?.ratings?.average?.['@_value'])
  const weight = Number(item.statistics?.ratings?.averageweight?.['@_value'])
  const num = (k: string) => (item[k] ? Number(item[k]['@_value']) : null)
  return {
    bggId: id,
    name: String(primary?.['@_value'] ?? ''),
    minPlayers: num('minplayers'),
    maxPlayers: num('maxplayers'),
    bestPlayers: bestCounts(arr<any>(item.poll).find((p) => p['@_name'] === 'suggested_numplayers')),
    playingTime: num('playingtime'),
    weight: weight > 0 ? Math.round(weight * 100) / 100 : null,
    rating: rating > 0 ? Math.round(rating * 10) / 10 : null,
    types,
    categories: links.filter((l) => l['@_type'] === 'boardgamecategory').map((l) => String(l['@_value'])),
    coverUrl: item.image ? String(item.image) : null,
    verified: true,
  }
}

export function toGame(data: Omit<Game, 'slug'>): Game {
  return { slug: slugify(data.name), ...data }
}
