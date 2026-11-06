import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth.js'
import { db, fromRow, toRow, type GameRow } from '../_lib/db.js'
import { parseGame } from '../_lib/validate.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return
  const supabase = db()

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('games').select('*').order('name')
    if (error) return res.status(500).json({ error: error.message })
    return res.json((data as GameRow[]).map(fromRow))
  }

  if (req.method === 'POST') {
    let game
    try {
      game = parseGame(req.body)
    } catch (e) {
      return res.status(400).json({ error: (e as Error).message })
    }
    const { data: existing } = await supabase.from('games').select('slug, removed').eq('slug', game.slug).maybeSingle()
    if (existing) {
      return res.status(409).json({ error: existing.removed ? 'This game was removed earlier – restore it from the list instead.' : 'This game is already in the catalogue.' })
    }
    const { error } = await supabase.from('games').insert(toRow(game))
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(game)
  }

  if (req.method === 'PATCH') {
    const slug = String(req.body?.slug ?? '')
    const removed = req.body?.removed === true
    const { error } = await supabase.from('games').update({ removed }).eq('slug', slug)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
