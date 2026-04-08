import { useMemo } from 'react'

export interface EmojiRiseBurstProps {
  burstId: number
  count?: number
  emojis?: string[]
}

type EmojiItem = {
  id: string
  emoji: string
  x: number
  y: number
  delayMs: number
  durationMs: number
  size: number
  drift: number
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]!
}

export default function EmojiRiseBurst({
  burstId,
  count = 14,
  emojis = ['🤍', '❤️', '✨', '🌙', '💫'],
}: EmojiRiseBurstProps) {
  const items = useMemo<EmojiItem[]>(() => {
    const created: EmojiItem[] = []
    for (let i = 0; i < count; i += 1) {
      created.push({
        id: `${burstId}-${i}-${Math.random().toString(16).slice(2)}`,
        emoji: pick(emojis),
        x: 50 + (Math.random() - 0.5) * 38,
        y: 52 + (Math.random() - 0.5) * 18,
        delayMs: 120 + i * 90 + Math.random() * 220,
        durationMs: 2000 + Math.random() * 1100,
        size: 16 + Math.random() * 16,
        drift: (Math.random() - 0.5) * 36,
      })
    }
    return created
  }, [burstId, count, emojis])

  return (
    <div className="emojiBurst" aria-hidden="true">
      {items.map((it) => (
        <span
          key={it.id}
          className="emojiBurstItem"
          style={{
            ['--x' as never]: `${it.x}%`,
            ['--y' as never]: `${it.y}%`,
            ['--delay' as never]: `${it.delayMs}ms`,
            ['--dur' as never]: `${it.durationMs}ms`,
            ['--size' as never]: `${it.size}px`,
            ['--drift' as never]: `${it.drift}px`,
          }}
        >
          {it.emoji}
        </span>
      ))}
    </div>
  )
}

