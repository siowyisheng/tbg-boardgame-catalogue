import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db, fromRow, type GameRow } from './_lib/db.js'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const { data, error } = await db().from('games').select('*').eq('removed', false).order('name')
  if (error) return res.status(500).json({ error: error.message })
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=300')
  res.json((data as GameRow[]).map(fromRow))
}
