import type { VercelRequest, VercelResponse } from '@vercel/node'
import { endSession, passwordMatches, startSession } from '../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'DELETE') {
    endSession(res)
    return res.json({ ok: true })
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (passwordMatches(String(req.body?.password ?? ''))) {
    startSession(res)
    return res.json({ ok: true })
  }
  await new Promise((r) => setTimeout(r, 800)) // slow down guessing
  res.status(401).json({ error: 'Wrong password' })
}
