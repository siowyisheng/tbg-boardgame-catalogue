import { useCallback, useEffect, useState } from 'react'
import type { Game, Report } from '../../shared/types'

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body.error ?? `Error ${res.status}`), { status: res.status })
  }
  return res.json() as Promise<T>
}

const blank = {
  name: '', bggId: '', minPlayers: '', maxPlayers: '', bestPlayers: '', playingTime: '',
  weight: '', rating: '', types: '', categories: '', coverUrl: '',
}
type Draft = typeof blank

const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
const numOrNull = (s: string) => (s.trim() === '' ? null : Number(s))

function toPayload(d: Draft, verified: boolean) {
  return {
    name: d.name.trim(),
    bggId: numOrNull(d.bggId),
    minPlayers: numOrNull(d.minPlayers),
    maxPlayers: numOrNull(d.maxPlayers),
    bestPlayers: list(d.bestPlayers).map(Number).filter((n) => Number.isInteger(n)),
    playingTime: numOrNull(d.playingTime),
    weight: numOrNull(d.weight),
    rating: numOrNull(d.rating) == null ? null : Math.round(Number(d.rating) * 10) / 10,
    types: list(d.types),
    categories: list(d.categories),
    coverUrl: d.coverUrl.trim() || null,
    verified,
  }
}

export function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [games, setGames] = useState<Game[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [tab, setTab] = useState<'games' | 'reports'>('games')
  const [draft, setDraft] = useState<Draft>(blank)
  const [info, setInfo] = useState('')

  const refresh = useCallback(async () => {
    try {
      const [g, r] = await Promise.all([api<Game[]>('/api/admin/games'), api<Report[]>('/api/admin/reports')])
      setGames(g)
      setReports(r)
      setAuthed(true)
    } catch (e) {
      if ((e as { status?: number }).status === 401) setAuthed(false)
      else {
        setError((e as Error).message)
        setAuthed(false)
      }
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) })
      setPassword('')
      await refresh()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function logout() {
    await api('/api/admin/login', { method: 'DELETE' }).catch(() => {})
    setAuthed(false)
  }

  async function setRemoved(slug: string, removed: boolean) {
    await api('/api/admin/games', { method: 'PATCH', body: JSON.stringify({ slug, removed }) })
    await refresh()
  }

  async function resolve(id: string, resolved: boolean) {
    await api('/api/admin/reports', { method: 'PATCH', body: JSON.stringify({ id, resolved }) })
    await refresh()
  }

  async function lookup() {
    setInfo('')
    try {
      const g = await api<Game>(`/api/admin/bgg?id=${encodeURIComponent(draft.bggId)}`)
      setDraft({
        name: g.name, bggId: String(g.bggId ?? ''), minPlayers: String(g.minPlayers ?? ''),
        maxPlayers: String(g.maxPlayers ?? ''), bestPlayers: g.bestPlayers.join(', '),
        playingTime: String(g.playingTime ?? ''), weight: String(g.weight ?? ''), rating: String(g.rating ?? ''),
        types: g.types.join(', '), categories: g.categories.join(', '), coverUrl: g.coverUrl ?? '',
      })
      setInfo('Filled from BoardGameGeek. Check and save.')
    } catch (e) {
      setInfo((e as Error).message)
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setInfo('')
    try {
      // A game filled in from BGG (has a BGG id and a cover) is verified; a hand-typed one is not.
      const verified = info.startsWith('Filled from BoardGameGeek')
      await api('/api/admin/games', { method: 'POST', body: JSON.stringify(toPayload(draft, verified)) })
      setDraft(blank)
      setInfo('Game added.')
      await refresh()
    } catch (err) {
      setInfo((err as Error).message)
    }
  }

  if (authed === null) return <main className="admin"><p>Loading…</p></main>

  if (!authed) {
    return (
      <main className="admin">
        <h1>Admin</h1>
        <form className="form" onSubmit={login}>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          </label>
          {error && <p className="notice err">{error}</p>}
          <button className="primary wide">Sign in</button>
        </form>
      </main>
    )
  }

  const field = (key: keyof Draft, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label>
      {label}
      <input value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} {...props} />
    </label>
  )
  const open = reports.filter((r) => !r.resolved)

  return (
    <main className="admin">
      <div className="sheet-head">
        <h1>Admin</h1>
        <button className="link" onClick={logout}>Sign out</button>
      </div>
      <div className="chips">
        <button className={`chip ${tab === 'games' ? 'on' : ''}`} onClick={() => setTab('games')}>Games ({games.filter((g) => !g.removed).length})</button>
        <button className={`chip ${tab === 'reports' ? 'on' : ''}`} onClick={() => setTab('reports')}>Reports ({open.length} open)</button>
      </div>

      {tab === 'games' && (
        <>
          <form className="form" onSubmit={add}>
            <h2>Add a game</h2>
            <div className="row">
              {field('bggId', 'BGG id (optional)', { inputMode: 'numeric' })}
              <button type="button" className="chip" onClick={lookup} disabled={!draft.bggId}>Look up on BGG</button>
            </div>
            {field('name', 'Name', { required: true })}
            <div className="row">
              {field('minPlayers', 'Min players', { inputMode: 'numeric' })}
              {field('maxPlayers', 'Max players', { inputMode: 'numeric' })}
            </div>
            {field('bestPlayers', 'Best player counts (comma separated)', { placeholder: '3, 4' })}
            <div className="row">
              {field('playingTime', 'Playing time (min)', { inputMode: 'numeric' })}
              {field('weight', 'Complexity (1–5)', { inputMode: 'decimal' })}
              {field('rating', 'Rating', { inputMode: 'decimal' })}
            </div>
            {field('types', 'Types (comma separated)', { placeholder: 'Strategy, Thematic' })}
            {field('categories', 'Categories (comma separated)', { placeholder: 'Fantasy, Economic' })}
            {field('coverUrl', 'Cover image URL (optional)')}
            {info && <p className="notice">{info}</p>}
            <button className="primary wide">Add game</button>
          </form>

          <ul className="admin-list">
            {games.map((g) => (
              <li key={g.slug} className={g.removed ? 'removed' : ''}>
                <span className="grow">
                  {g.name}
                  {!g.verified && <small> · unverified</small>}
                  {g.removed && <small> · removed</small>}
                </span>
                <button className="link" onClick={() => setRemoved(g.slug, !g.removed)}>{g.removed ? 'Restore' : 'Remove'}</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === 'reports' && (
        <ul className="admin-list reports">
          {reports.length === 0 && <li className="muted">No reports yet.</li>}
          {reports.map((r) => (
            <li key={r.id} className={r.resolved ? 'removed' : ''}>
              <div className="grow">
                <strong>{r.gameName ?? r.gameSlug}</strong> – {r.kind}: {r.component}
                {r.note && <p>{r.note}</p>}
                <small>
                  {new Date(r.createdAt).toLocaleString()}
                  {r.reporterName && ` · ${r.reporterName}`}
                  {r.reporterEmail && <> · <a href={`mailto:${r.reporterEmail}`}>{r.reporterEmail}</a></>}
                </small>
              </div>
              <button className="link" onClick={() => resolve(r.id, !r.resolved)}>{r.resolved ? 'Reopen' : 'Resolve'}</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
