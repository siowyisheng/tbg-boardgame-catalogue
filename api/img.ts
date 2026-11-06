import type { VercelRequest, VercelResponse } from '@vercel/node'

// Proxies BoardGameGeek cover images so the browser may draw them onto the share-image canvas.
const ALLOWED_HOSTS = new Set(['cf.geekdo-images.com', 'cf.geekdo-static.com'])
const MAX_BYTES = 5 * 1024 * 1024

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let url: URL
  try {
    url = new URL(String(req.query.u ?? ''))
  } catch {
    return res.status(400).end()
  }
  if (url.protocol !== 'https:' || !ALLOWED_HOSTS.has(url.hostname)) return res.status(400).end()
  const upstream = await fetch(url, { redirect: 'error' }).catch(() => null)
  const type = upstream?.headers.get('content-type') ?? ''
  if (!upstream?.ok || !type.startsWith('image/')) return res.status(502).end()
  const buf = Buffer.from(await upstream.arrayBuffer())
  if (buf.length > MAX_BYTES) return res.status(502).end()
  res.setHeader('Content-Type', type)
  res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=86400, immutable')
  res.send(buf)
}
