import {
  COMPLEXITY_BANDS,
  COMPLEXITY_BAND_HINT,
  TIME_BANDS,
  TIME_BAND_HINT,
} from '../lib/bands'
import { EMPTY_FILTERS, type Filters } from '../lib/filters'

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  types: string[]
  categories: string[]
  onClose: () => void
  resultCount: number
}

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v]
}

function Chips<T extends string>({
  options,
  selected,
  hints,
  onToggle,
}: {
  options: readonly T[]
  selected: T[]
  hints?: Record<string, string>
  onToggle: (v: T) => void
}) {
  return (
    <div className="chips">
      {options.map((o) => (
        <button key={o} className={`chip ${selected.includes(o) ? 'on' : ''}`} onClick={() => onToggle(o)} aria-pressed={selected.includes(o)}>
          {o}
          {hints && <small> {hints[o]}</small>}
        </button>
      ))}
    </div>
  )
}

export function FilterPanel({ filters, onChange, types, categories, onClose, resultCount }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="Filters" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Filters</h2>
          <button className="link" onClick={() => onChange({ ...EMPTY_FILTERS, query: filters.query })}>
            Clear all
          </button>
        </div>

        <fieldset>
          <legend>How many of you are playing?</legend>
          <div className="chips">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button key={n} className={`chip ${filters.players === n ? 'on' : ''}`} onClick={() => set({ players: filters.players === n ? null : n })}>
                {n}
              </button>
            ))}
          </div>
          <label className="check">
            <input type="checkbox" checked={filters.bestOnly} disabled={filters.players == null} onChange={(e) => set({ bestOnly: e.target.checked })} />
            Only games that are best at this number
          </label>
        </fieldset>

        <fieldset>
          <legend>Playing time</legend>
          <Chips options={TIME_BANDS} selected={filters.times} hints={TIME_BAND_HINT} onToggle={(v) => set({ times: toggle(filters.times, v) })} />
        </fieldset>

        <fieldset>
          <legend>Complexity</legend>
          <Chips options={COMPLEXITY_BANDS} selected={filters.complexities} hints={COMPLEXITY_BAND_HINT} onToggle={(v) => set({ complexities: toggle(filters.complexities, v) })} />
        </fieldset>

        <fieldset>
          <legend>Minimum BGG rating: {filters.minRating > 0 ? filters.minRating.toFixed(1) : 'any'}</legend>
          <input type="range" min={0} max={9} step={0.5} value={filters.minRating} onChange={(e) => set({ minRating: Number(e.target.value) })} />
        </fieldset>

        {types.length > 0 && (
          <fieldset>
            <legend>Type</legend>
            <Chips options={types} selected={filters.types} onToggle={(v) => set({ types: toggle(filters.types, v) })} />
          </fieldset>
        )}

        {categories.length > 0 && (
          <fieldset>
            <legend>Category</legend>
            <Chips options={categories} selected={filters.categories} onToggle={(v) => set({ categories: toggle(filters.categories, v) })} />
          </fieldset>
        )}

        <button className="primary wide" onClick={onClose}>
          Show {resultCount} game{resultCount === 1 ? '' : 's'}
        </button>
      </div>
    </div>
  )
}
