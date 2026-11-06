import type { Game } from '../../shared/types'
import { initials, tint, coverSrc } from './tint'

const W = 1080
const PAD = 40
const COLS = 2
const CELL_W = (W - PAD * 3) / COLS
const CELL_H = 200
const HEADER = 150

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    lines.length = maxLines
    lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,2}$/, '…')
  }
  return lines
}

export async function renderShareImage(games: Game[], shopName: string): Promise<Blob> {
  const rows = Math.ceil(games.length / COLS)
  const H = HEADER + rows * (CELL_H + PAD) + PAD
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#f6f1e7'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#1f2a37'
  ctx.font = '700 52px system-ui, sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(shopName, PAD, 78)
  ctx.font = '400 28px system-ui, sans-serif'
  ctx.fillStyle = '#5b6573'
  ctx.fillText('Our shortlist – what shall we play?', PAD, 122)

  const covers = await Promise.all(games.map((g) => (coverSrc(g.coverUrl) ? loadImage(coverSrc(g.coverUrl)!) : Promise.resolve(null))))

  games.forEach((g, i) => {
    const x = PAD + (i % COLS) * (CELL_W + PAD)
    const y = HEADER + Math.floor(i / COLS) * (CELL_H + PAD)
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(x, y, CELL_W, CELL_H, 20)
    ctx.fill()

    const size = CELL_H - 32
    const cx = x + 16
    const cy = y + 16
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(cx, cy, size, size, 14)
    ctx.clip()
    const img = covers[i]
    if (img) {
      const s = Math.max(size / img.width, size / img.height)
      ctx.drawImage(img, cx + (size - img.width * s) / 2, cy + (size - img.height * s) / 2, img.width * s, img.height * s)
    } else {
      ctx.fillStyle = tint(g.name)
      ctx.fillRect(cx, cy, size, size)
      ctx.fillStyle = '#ffffffd9'
      ctx.font = '700 56px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(initials(g.name).toUpperCase(), cx + size / 2, cy + size / 2)
      ctx.textAlign = 'left'
    }
    ctx.restore()

    const tx = cx + size + 20
    const tw = CELL_W - size - 52
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#1f2a37'
    ctx.font = '700 28px system-ui, sans-serif'
    wrap(ctx, g.name, tw, 3).forEach((l, li) => ctx.fillText(l, tx, y + 56 + li * 34))
    ctx.fillStyle = '#b45309'
    ctx.font = '600 30px system-ui, sans-serif'
    ctx.fillText(g.rating == null ? 'BGG –' : `★ ${g.rating.toFixed(1)} BGG`, tx, y + CELL_H - 28)
  })

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not render image'))), 'image/png'),
  )
}
