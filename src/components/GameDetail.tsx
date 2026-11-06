import { useState } from 'react'
import type { Game } from '../../shared/types'
import { bestLabel, complexityBand, playersLabel, ratingLabel, timeLabel, weightLabel } from '../lib/bands'
import { Cover } from './Cover'
import { ReportForm } from './ReportForm'

interface Props {
  game: Game
  selected: boolean
  disabled: boolean
  onToggle: () => void
  onClose: () => void
}

export function GameDetail({ game, selected, disabled, onToggle, onClose }: Props) {
  const [reporting, setReporting] = useState(false)
  const rows: [string, string][] = [
    ['Official player count', playersLabel(game)],
    ['Best player counts', bestLabel(game)],
    ['Playing time', timeLabel(game)],
    ['Complexity', `${complexityBand(game.weight) ?? '–'} (${weightLabel(game)})`],
    ['BGG rating', ratingLabel(game)],
    ['Type', game.types.join(', ') || '–'],
    ['Category', game.categories.join(', ') || '–'],
  ]
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={game.name} onClick={(e) => e.stopPropagation()}>
        {reporting ? (
          <ReportForm game={game} onDone={onClose} />
        ) : (
          <>
            <div className="sheet-head">
              <h2>{game.name}</h2>
              <button className="link" onClick={onClose}>Close</button>
            </div>
            <Cover game={game} className="hero" />
            {!game.verified && <p className="notice">Details are estimates and still to be checked against BoardGameGeek.</p>}
            <dl className="facts-table">
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <button className="primary wide" onClick={onToggle} disabled={disabled && !selected}>
              {selected ? 'Remove from shortlist' : disabled ? 'Shortlist is full (8)' : 'Add to shortlist'}
            </button>
            <button className="link wide" onClick={() => setReporting(true)}>
              Report missing or damaged components
            </button>
          </>
        )}
      </div>
    </div>
  )
}
