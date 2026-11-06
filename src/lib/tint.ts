export function initials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, '').split(' ').filter((w) => !/^(the|of|a)$/i.test(w))
  return (words[0]?.[0] ?? '?') + (words[1]?.[0] ?? '')
}

export function tint(name: string): string {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360
  return `hsl(${h} 45% 42%)`
}

export function coverSrc(url: string | null): string | null {
  return url ? `/api/img?u=${encodeURIComponent(url)}` : null
}
