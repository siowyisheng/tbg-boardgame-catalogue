import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { Report } from '../../shared/types.js'
import { requireAdmin } from '../_lib/auth.js'
import { db } from '../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return
  const supabase = db()

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('reports')
      .select('id, game_slug, kind, component, note, reporter_name, reporter_email, resolved, created_at, games(name)')
      .order('resolved')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) return res.status(500).json({ error: error.message })
    const reports: Report[] = (data as any[]).map((r) => ({
      id: r.id,
      gameSlug: r.game_slug,
      gameName: r.games?.name,
      kind: r.kind,
      component: r.component,
      note: r.note,
      reporterName: r.reporter_name,
      reporterEmail: r.reporter_email,
      resolved: r.resolved,
      createdAt: r.created_at,
    }))
    return res.json(reports)
  }

  if (req.method === 'PATCH') {
    const { error } = await supabase.from('reports').update({ resolved: req.body?.resolved === true }).eq('id', String(req.body?.id ?? ''))
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
