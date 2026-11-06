import { useState } from 'react'
import type { Game } from '../../shared/types'
import { coverSrc, initials, tint } from '../lib/tint'

export function Cover({ game, className = '' }: { game: Game; className?: string }) {
  const [failed, setFailed] = useState(false)
  const src = coverSrc(game.coverUrl)
  if (src && !failed) {
    return <img className={`cover ${className}`} src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
  }
  return (
    <div className={`cover placeholder ${className}`} style={{ background: tint(game.name) }} aria-hidden>
      {initials(game.name).toUpperCase()}
    </div>
  )
}
