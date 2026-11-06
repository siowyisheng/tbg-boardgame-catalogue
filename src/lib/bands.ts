import type { Game } from '../../shared/types'

export const TIME_BANDS = ['Quick', 'Short', 'Medium', 'Long'] as const
export const TIME_BAND_HINT: Record<(typeof TIME_BANDS)[number], string> = {
  Quick: '≤ 30 min',
  Short: '31–60 min',
  Medium: '61–120 min',
  Long: '> 120 min',
}
export const COMPLEXITY_BANDS = ['Light', 'Medium', 'Heavy'] as const
export const COMPLEXITY_BAND_HINT: Record<(typeof COMPLEXITY_BANDS)[number], string> = {
  Light: '< 2.0',
  Medium: '2.0–3.5',
  Heavy: '> 3.5',
}

export type TimeBand = (typeof TIME_BANDS)[number]
export type ComplexityBand = (typeof COMPLEXITY_BANDS)[number]

export function timeBand(minutes: number | null): TimeBand | null {
  if (minutes == null) return null
  if (minutes <= 30) return 'Quick'
  if (minutes <= 60) return 'Short'
  if (minutes <= 120) return 'Medium'
  return 'Long'
}

export function complexityBand(weight: number | null): ComplexityBand | null {
  if (weight == null) return null
  if (weight < 2) return 'Light'
  if (weight <= 3.5) return 'Medium'
  return 'Heavy'
}

export function playersLabel(g: Game): string {
  if (g.minPlayers == null || g.maxPlayers == null) return '–'
  return g.minPlayers === g.maxPlayers ? `${g.minPlayers}` : `${g.minPlayers}–${g.maxPlayers}`
}

export function bestLabel(g: Game): string {
  return g.bestPlayers.length ? [...g.bestPlayers].sort((a, b) => a - b).join(', ') : '–'
}

export function ratingLabel(g: Game): string {
  return g.rating == null ? '–' : g.rating.toFixed(1)
}

export function timeLabel(g: Game): string {
  return g.playingTime == null ? '–' : `${g.playingTime} min`
}

export function weightLabel(g: Game): string {
  return g.weight == null ? '–' : `${g.weight.toFixed(1)} / 5`
}
