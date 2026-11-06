import { useState } from 'react'
import type { Game } from '../../shared/types'

export function ReportForm({ game, onDone }: { game: Game; onDone: () => void }) {
  const [kind, setKind] = useState<'missing' | 'damaged'>('missing')
  const [component, setComponent] = useState('')
  const [note, setNote] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameSlug: game.slug, kind, component, note, name, email }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `Error ${res.status}`)
      setState('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div className="notice ok">
        <p>Thanks – we've got your report for {game.name} and will look into it.</p>
        <button className="primary" onClick={onDone}>Close</button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={submit}>
      <h3>Report a problem with {game.name}</h3>
      <div className="chips">
        {(['missing', 'damaged'] as const).map((k) => (
          <button type="button" key={k} className={`chip ${kind === k ? 'on' : ''}`} onClick={() => setKind(k)}>
            {k === 'missing' ? 'Missing component' : 'Damaged component'}
          </button>
        ))}
      </div>
      <label>
        Which component?
        <input required maxLength={120} value={component} onChange={(e) => setComponent(e.target.value)} placeholder="e.g. red meeples, rulebook, 2 cards" />
      </label>
      <label>
        Anything else we should know? (optional)
        <textarea maxLength={1000} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <label>
        Your name (optional)
        <input maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </label>
      <label>
        Your email (optional – so we can get back to you)
        <input type="email" maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </label>
      {state === 'error' && <p className="notice err">{error}</p>}
      <button className="primary wide" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send report'}
      </button>
    </form>
  )
}
