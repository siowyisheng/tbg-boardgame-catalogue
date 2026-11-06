import { createHash } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from './_lib/db.js'

const MAX_PER_HOUR = 5

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const b = req.body ?? {}
  const kind = b.kind === 'damaged' ? 'damaged' : b.kind === 'missing' ? 'missing' : null
  const component = String(b.component ?? '').trim().slice(0, 120)
  if (!kind || !component || !b.gameSlug) return res.status(400).json({ error: 'Please say which component is missing or damaged.' })
  const email = String(b.email ?? '').trim().slice(0, 120)
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'That email address does not look right.' })

  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'unknown'
  const ipHash = createHash('sha256').update(ip + (process.env.SESSION_SECRET ?? '')).digest('hex')
  const supabase = db()

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabase.from('reports').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since)
  if ((count ?? 0) >= MAX_PER_HOUR) return res.status(429).json({ error: 'Too many reports from your connection – please try again later.' })

  const { data: game } = await supabase.from('games').select('slug').eq('slug', String(b.gameSlug)).eq('removed', false).maybeSingle()
  if (!game) return res.status(404).json({ error: 'That game is not in the catalogue.' })

  const { error } = await supabase.from('reports').insert({
    game_slug: game.slug,
    kind,
    component,
    note: String(b.note ?? '').trim().slice(0, 1000),
    reporter_name: String(b.name ?? '').trim().slice(0, 80) || null,
    reporter_email: email || null,
    ip_hash: ipHash,
  })
  if (error) return res.status(500).json({ error: 'Could not save your report. Please tell a member of staff.' })
  res.status(201).json({ ok: true })
}
