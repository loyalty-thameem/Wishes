import { useEffect, useMemo, useRef, useState } from 'react'

export interface TypingLinesProps {
  lines: string[]
  start: boolean
  speedMsPerChar?: number
  linePauseMs?: number
  className?: string
  onType?: () => void
  onDone?: () => void
}

export default function TypingLines({
  lines,
  start,
  speedMsPerChar = 22,
  linePauseMs = 520,
  className,
  onType,
  onDone,
}: TypingLinesProps) {
  const [rendered, setRendered] = useState(() => lines.map(() => ''))
  const doneRef = useRef(false)
  const startedRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  const stableLines = useMemo(() => lines, [lines])

  useEffect(() => {
    if (!start) return
    if (startedRef.current) return
    startedRef.current = true

    let lineIndex = 0
    let charIndex = 0
    const next = stableLines.map(() => '')

    const clear = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const step = () => {
      if (doneRef.current) return
      const line = stableLines[lineIndex]
      if (line === undefined) {
        doneRef.current = true
        setRendered([...next])
        onDone?.()
        return
      }

      if (line.length === 0) {
        next[lineIndex] = ''
        setRendered([...next])
        lineIndex += 1
        charIndex = 0
        timerRef.current = window.setTimeout(step, Math.max(180, linePauseMs * 0.8))
        return
      }

      next[lineIndex] = line.slice(0, Math.min(charIndex, line.length))
      setRendered([...next])

      if (charIndex > 0 && charIndex <= line.length && charIndex % 2 === 0) {
        const typedChar = line[charIndex - 1]
        if (typedChar && typedChar.trim().length) onType?.()
      }

      if (charIndex < line.length) {
        charIndex += 1
        timerRef.current = window.setTimeout(step, speedMsPerChar)
        return
      }

      if (charIndex === line.length) {
        charIndex += 1
        timerRef.current = window.setTimeout(step, linePauseMs)
        return
      }

      lineIndex += 1
      charIndex = 0
      timerRef.current = window.setTimeout(step, linePauseMs)
    }

    step()

    return () => clear()
  }, [linePauseMs, onDone, speedMsPerChar, stableLines, start])

  return (
    <div className={className}>
      {rendered.map((line, idx) => (
        <p key={idx} className="typingLine">
          {line.length ? line : <span className="typingSpacer" />}
        </p>
      ))}
    </div>
  )
}
