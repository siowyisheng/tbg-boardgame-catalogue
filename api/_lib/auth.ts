import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const COOKIE = 'tbg_admin'
const TTL_MS = 12 * 60 * 60 * 1000

const secret = () => {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error('SESSION_SECRET must be set')
  return s
}
const sign = (v: string) => createHmac('sha256', secret()).update(v).digest('hex')
const sha = (v: string) => createHash('sha256').update(v).digest()

export function passwordMatches(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  return timingSafeEqual(sha(candidate), sha(expected))
}

export function startSession(res: VercelResponse) {
  const exp = String(Date.now() + TTL_MS)
  const value = `${exp}.${sign(exp)}`
  res.setHeader('Set-Cookie', `${COOKIE}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${TTL_MS / 1000}`)
}

export function endSession(res: VercelResponse) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`)
}

export function isAdmin(req: VercelRequest): boolean {
  const raw = (req.headers.cookie ?? '').split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))
  if (!raw) return false
  const [exp, mac] = raw.slice(COOKIE.length + 1).split('.')
  if (!exp || !mac || Number(exp) < Date.now()) return false
  const good = Buffer.from(sign(exp))
  const got = Buffer.from(mac)
  return good.length === got.length && timingSafeEqual(good, got)
}

/** Returns true when the request may continue; otherwise it has already answered 401. */
export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  if (isAdmin(req)) return true
  res.status(401).json({ error: 'Not signed in' })
  return false
}
