import { useCallback, useEffect, useRef } from 'react'

export interface UseSfxApi {
  playTypeTick: () => void
}

export function useSfx(enabled: boolean): UseSfxApi {
  const ctxRef = useRef<AudioContext | null>(null)
  const lastAtRef = useRef(0)

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return

    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext
      ctxRef.current = Ctx ? new Ctx() : null
    }

    const ctx = ctxRef.current
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  }, [enabled])

  const playTypeTick = useCallback(() => {
    if (!enabled) return
    const nowMs = performance.now()
    if (nowMs - lastAtRef.current < 34) return
    lastAtRef.current = nowMs

    const ctx = ctxRef.current
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    filter.type = 'highpass'
    filter.frequency.value = 680
    osc.type = 'triangle'
    osc.frequency.value = 950 + Math.random() * 260

    const t = ctx.currentTime
    gain.gain.setValueAtTime(0.00001, t)
    gain.gain.linearRampToValueAtTime(0.022, t + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.00001, t + 0.04)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(t)
    osc.stop(t + 0.045)

    osc.onended = () => {
      osc.disconnect()
      filter.disconnect()
      gain.disconnect()
    }
  }, [enabled])

  return { playTypeTick }
}

