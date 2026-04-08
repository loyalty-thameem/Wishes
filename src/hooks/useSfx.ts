import { useCallback, useRef } from 'react'

export interface UseSfxApi {
  playTypeTick: () => void
  playTap: () => void
  playNavigate: () => void
}

export function useSfx(enabled: boolean): UseSfxApi {
  const ctxRef = useRef<AudioContext | null>(null)
  const noiseRef = useRef<AudioBuffer | null>(null)
  const lastTickAtRef = useRef(0)
  const lastTapAtRef = useRef(0)
  const lastNavAtRef = useRef(0)

  const getCtx = useCallback(() => {
    if (!enabled) return null
    if (typeof window === 'undefined') return null

    if (!ctxRef.current) {
      const Ctx =
        window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext
      ctxRef.current = Ctx ? new Ctx() : null
    }

    const ctx = ctxRef.current
    if (!ctx) return null
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    return ctx
  }, [enabled])

  const getNoise = useCallback(
    (ctx: AudioContext) => {
      if (noiseRef.current) return noiseRef.current
      const durationSec = 0.22
      const buffer = ctx.createBuffer(
        1,
        Math.floor(ctx.sampleRate * durationSec),
        ctx.sampleRate,
      )
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
      noiseRef.current = buffer
      return buffer
    },
    [],
  )

  const playTypeTick = useCallback(() => {
    if (!enabled) return
    const nowMs = performance.now()
    if (nowMs - lastTickAtRef.current < 34) return
    lastTickAtRef.current = nowMs

    const ctx = getCtx()
    if (!ctx) return

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
  }, [enabled, getCtx])

  const playTap = useCallback(() => {
    if (!enabled) return
    const nowMs = performance.now()
    if (nowMs - lastTapAtRef.current < 60) return
    lastTapAtRef.current = nowMs

    const ctx = getCtx()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    filter.type = 'lowpass'
    filter.frequency.value = 1800
    osc.type = 'sine'
    osc.frequency.value = 520 + Math.random() * 80

    const t = ctx.currentTime
    gain.gain.setValueAtTime(0.00001, t)
    gain.gain.linearRampToValueAtTime(0.035, t + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.00001, t + 0.075)

    osc.frequency.exponentialRampToValueAtTime(240 + Math.random() * 30, t + 0.06)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(t)
    osc.stop(t + 0.085)
    osc.onended = () => {
      osc.disconnect()
      filter.disconnect()
      gain.disconnect()
    }
  }, [enabled, getCtx])

  const playNavigate = useCallback(() => {
    if (!enabled) return
    const nowMs = performance.now()
    if (nowMs - lastNavAtRef.current < 220) return
    lastNavAtRef.current = nowMs

    const ctx = getCtx()
    if (!ctx) return

    const noise = getNoise(ctx)
    const src = ctx.createBufferSource()
    src.buffer = noise

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 0.7

    const gain = ctx.createGain()

    const t = ctx.currentTime
    filter.frequency.setValueAtTime(320, t)
    filter.frequency.exponentialRampToValueAtTime(1250, t + 0.12)
    filter.frequency.exponentialRampToValueAtTime(520, t + 0.22)

    gain.gain.setValueAtTime(0.00001, t)
    gain.gain.linearRampToValueAtTime(0.055, t + 0.016)
    gain.gain.exponentialRampToValueAtTime(0.00001, t + 0.22)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    src.start(t)
    src.stop(t + 0.23)
    src.onended = () => {
      src.disconnect()
      filter.disconnect()
      gain.disconnect()
    }
  }, [enabled, getCtx, getNoise])

  return { playTypeTick, playTap, playNavigate }
}
