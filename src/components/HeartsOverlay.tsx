import type { CSSProperties } from 'react'

export type HeartItem = {
  id: string
  x: number
  y: number
  emoji: string
  delayMs: number
  durationMs: number
  size: number
  drift: number
}

export interface HeartsOverlayProps {
  hearts: HeartItem[]
}

export default function HeartsOverlay({ hearts }: HeartsOverlayProps) {
  return (
    <div className="heartsOverlay" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heartFloat"
          style={
            {
              ['--x' as never]: `${h.x}px`,
              ['--y' as never]: `${h.y}px`,
              ['--delay' as never]: `${h.delayMs}ms`,
              ['--dur' as never]: `${h.durationMs}ms`,
              ['--size' as never]: `${h.size}px`,
              ['--drift' as never]: `${h.drift}px`,
            } as CSSProperties
          }
        >
          {h.emoji}
        </span>
      ))}
    </div>
  )
}

