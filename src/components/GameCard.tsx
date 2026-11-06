import type { Game } from '../../shared/types'
import { bestLabel, complexityBand, playersLabel, ratingLabel, timeLabel } from '../lib/bands'
import { Cover } from './Cover'

interface Props {
  game: Game
  selected: boolean
  disabled: boolean
  onToggle: () => void
  onOpen: () => void
}

export function GameCard({ game, selected, disabled, onToggle, onOpen }: Props) {
  return (
    <article className={`card ${selected ? 'selected' : ''}`}>
      <button className="card-main" onClick={onOpen} aria-label={`Details for ${game.name}`}>
        <Cover game={game} />
        <div className="card-body">
          <h3>{game.name}</h3>
          <p className="facts">
            <span title="Official player count">👥 {playersLabel(game)}</span>
            <span title="Best player counts">⭐ best {bestLabel(game)}</span>
            <span>⏱ {timeLabel(game)}</span>
          </p>
          <p className="facts">
            <span>{complexityBand(game.weight) ?? '–'}</span>
            <span className="rating">★ {ratingLabel(game)}</span>
          </p>
        </div>
      </button>
      <button
        className={`pick ${selected ? 'on' : ''}`}
        onClick={onToggle}
        disabled={disabled && !selected}
        aria-pressed={selected}
      >
        {selected ? '✓ On shortlist' : disabled ? 'Shortlist full' : '+ Shortlist'}
      </button>
    </article>
  )
}
