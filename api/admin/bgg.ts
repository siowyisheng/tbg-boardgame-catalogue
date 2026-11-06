import type { VercelRequest, VercelResponse } from '@vercel/node'
import { fetchBggGame, toGame } from '../../shared/bgg.js'
import { requireAdmin } from '../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return
  const token = process.env.BGG_TOKEN
  if (!token) return res.status(501).json({ error: 'BGG lookup is not switched on yet (no BGG token). Type the details in by hand.' })
  const id = Number(req.query.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Enter a numeric BGG id.' })
  try {
    res.json(toGame(await fetchBggGame(id, token)))
  } catch (e) {
    res.status(502).json({ error: (e as Error).message })
  }
}
