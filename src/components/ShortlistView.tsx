import { useState } from 'react'
import type { Game } from '../../shared/types'
import { renderShareImage } from '../lib/shareImage'
import { shareUrl } from '../lib/shortlist'
import { ratingLabel } from '../lib/bands'
import { Cover } from './Cover'

export const SHOP_NAME = 'Team Board Game'

interface Props {
  slugs: string[]
  games: Game[]
  /** When set the view is read-only (opened from a shared link). */
  readOnly?: boolean
  onRemove?: (slug: string) => void
  onClear?: () => void
  onClose: () => void
}

export function ShortlistView({ slugs, games, readOnly, onRemove, onClear, onClose }: Props) {
  const bySlug = new Map(games.map((g) => [g.slug, g]))
  const found = slugs.map((s) => bySlug.get(s)).filter((g): g is Game => !!g)
  const missing = slugs.length - found.length
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl(found.map((g) => g.slug)))
      setMsg('Link copied!')
    } catch {
      setMsg(shareUrl(found.map((g) => g.slug)))
    }
  }

  async function shareImage() {
    setBusy(true)
    try {
      const blob = await renderShareImage(found, SHOP_NAME)
      const file = new File([blob], 'shortlist.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${SHOP_NAME} shortlist` })
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'shortlist.png'
        a.click()
        URL.revokeObjectURL(a.href)
      }
      setMsg('')
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) setMsg('Could not make the image – try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="Shortlist" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>{readOnly ? 'Shared shortlist' : 'Your shortlist'}</h2>
          <button className="link" onClick={onClose}>{readOnly ? 'See all games' : 'Close'}</button>
        </div>
        {found.length === 0 && <p className="muted">{readOnly ? 'None of these games are in the catalogue any more.' : 'Add 1–8 games to decide what to play.'}</p>}
        <ul className="short-list">
          {found.map((g) => (
            <li key={g.slug}>
              <Cover game={g} className="thumb" />
              <span className="grow">{g.name}</span>
              <span className="rating">★ {ratingLabel(g)}</span>
              {!readOnly && onRemove && (
                <button className="link" onClick={() => onRemove(g.slug)} aria-label={`Remove ${g.name}`}>✕</button>
              )}
            </li>
          ))}
        </ul>
        {missing > 0 && <p className="notice">{missing} game{missing === 1 ? ' is' : 's are'} no longer in the catalogue.</p>}
        {found.length > 0 && (
          <div className="actions">
            <button className="primary" onClick={copyLink}>Copy link</button>
            <button className="primary" onClick={shareImage} disabled={busy}>{busy ? 'Making image…' : 'Share image'}</button>
          </div>
        )}
        {msg && <p className="muted" role="status">{msg}</p>}
        {!readOnly && found.length > 0 && onClear && (
          <button className="link wide" onClick={onClear}>Clear shortlist</button>
        )}
      </div>
    </div>
  )
}
