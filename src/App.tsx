import { useEffect, useMemo, useState } from 'react'
import type { Game } from '../shared/types'
import { Admin } from './components/Admin'
import { FilterPanel } from './components/FilterPanel'
import { GameCard } from './components/GameCard'
import { GameDetail } from './components/GameDetail'
import { SHOP_NAME, ShortlistView } from './components/ShortlistView'
import { loadCatalogue, type Catalogue } from './lib/data'
import { EMPTY_FILTERS, activeFilterCount, applyFilters, distinct, type Filters } from './lib/filters'
import { MAX_SHORTLIST, parseShareHash, useShortlist } from './lib/shortlist'

function useHash(): string {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => setHash(location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

export default function App() {
  if (location.pathname.replace(/\/$/, '') === '/admin') return <Admin />
  return <Public />
}

function Public() {
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [showShortlist, setShowShortlist] = useState(false)
  const [open, setOpen] = useState<Game | null>(null)
  const shortlist = useShortlist()
  const hash = useHash()
  const shared = parseShareHash(hash)
  const [sharedClosed, setSharedClosed] = useState(false)

  useEffect(() => {
    void loadCatalogue().then(setCatalogue)
  }, [])
  useEffect(() => setSharedClosed(false), [hash])

  const games = useMemo(() => catalogue?.games ?? [], [catalogue])
  const types = useMemo(() => distinct(games, (g) => g.types), [games])
  const categories = useMemo(() => distinct(games, (g) => g.categories), [games])
  const shown = useMemo(() => applyFilters(games, filters), [games, filters])
  const count = activeFilterCount(filters)
  const anyUnverified = games.some((g) => !g.verified)

  return (
    <>
      <header className="top">
        <h1>{SHOP_NAME}</h1>
        <input
          type="search"
          placeholder="Search games"
          aria-label="Search games"
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
        />
        <button className="chip" onClick={() => setShowFilters(true)}>
          Filters{count > 0 ? ` (${count})` : ''}
        </button>
      </header>

      <main className="grid-wrap">
        {anyUnverified && <p className="notice">Some game details are still estimates and are being checked against BoardGameGeek.</p>}
        {!catalogue && <p className="muted">Loading games…</p>}
        {catalogue && shown.length === 0 && (
          <p className="muted">
            No games match. <button className="link" onClick={() => setFilters(EMPTY_FILTERS)}>Clear search and filters</button>
          </p>
        )}
        <div className="grid">
          {shown.map((g) => (
            <GameCard
              key={g.slug}
              game={g}
              selected={shortlist.slugs.includes(g.slug)}
              disabled={shortlist.full}
              onToggle={() => shortlist.toggle(g.slug)}
              onOpen={() => setOpen(g)}
            />
          ))}
        </div>
      </main>

      <footer className="bar">
        <button className="primary" onClick={() => setShowShortlist(true)} disabled={shortlist.slugs.length === 0}>
          Shortlist{shortlist.slugs.length > 0 ? ` · ${shortlist.slugs.length}` : ''}
        </button>
        {shortlist.full && <small>Max {MAX_SHORTLIST} games</small>}
      </footer>

      {showFilters && (
        <FilterPanel filters={filters} onChange={setFilters} types={types} categories={categories} resultCount={shown.length} onClose={() => setShowFilters(false)} />
      )}
      {open && (
        <GameDetail
          game={open}
          selected={shortlist.slugs.includes(open.slug)}
          disabled={shortlist.full}
          onToggle={() => shortlist.toggle(open.slug)}
          onClose={() => setOpen(null)}
        />
      )}
      {showShortlist && (
        <ShortlistView slugs={shortlist.slugs} games={games} onRemove={shortlist.toggle} onClear={shortlist.clear} onClose={() => setShowShortlist(false)} />
      )}
      {shared && !sharedClosed && catalogue && (
        <ShortlistView
          slugs={shared}
          games={games}
          readOnly
          onClose={() => {
            setSharedClosed(true)
            history.replaceState(null, '', location.pathname)
          }}
        />
      )}
    </>
  )
}
