import { useCallback, useEffect, useState } from 'react'

export const MAX_SHORTLIST = 8
const KEY = 'tbg-shortlist'

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((s) => typeof s === 'string').slice(0, MAX_SHORTLIST) : []
  } catch {
    return []
  }
}

export function useShortlist() {
  const [slugs, setSlugs] = useState<string[]>(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(slugs))
    } catch {
      // storage unavailable: the shortlist just lives for this visit
    }
  }, [slugs])

  const toggle = useCallback((slug: string) => {
    setSlugs((cur) => {
      if (cur.includes(slug)) return cur.filter((s) => s !== slug)
      return cur.length >= MAX_SHORTLIST ? cur : [...cur, slug]
    })
  }, [])

  const clear = useCallback(() => setSlugs([]), [])
  return { slugs, toggle, clear, full: slugs.length >= MAX_SHORTLIST }
}

export function shareUrl(slugs: string[]): string {
  return `${location.origin}/#/s/${slugs.join(',')}`
}

export function parseShareHash(hash: string): string[] | null {
  const m = hash.match(/^#\/s\/(.*)$/)
  if (!m) return null
  return m[1].split(',').map(decodeURIComponent).filter(Boolean).slice(0, MAX_SHORTLIST)
}
