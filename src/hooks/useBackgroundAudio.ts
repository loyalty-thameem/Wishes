import { useCallback, useEffect, useRef, useState } from 'react'

export type BackgroundAudioStatus =
  | 'idle'
  | 'playing'
  | 'paused'
  | 'blocked'
  | 'ended'
  | 'error'

export interface UseBackgroundAudioOptions {
  src: string
  enabled?: boolean
  autoplay?: boolean
  volume?: number
}

export interface BackgroundAudioState {
  status: BackgroundAudioStatus
  currentTime: number
  duration: number
  startedAtMs: number | null
  errorMessage: string | null
}

function getErrorName(error: unknown) {
  if (!error) return ''
  if (typeof error === 'object' && 'name' in error) return String(error.name)
  return ''
}

function getErrorMessage(error: unknown) {
  if (!error) return ''
  if (typeof error === 'object' && 'message' in error) return String(error.message)
  return ''
}

function isAutoplayBlocked(error: unknown) {
  const name = getErrorName(error)
  return name === 'NotAllowedError'
}

export function useBackgroundAudio(options: UseBackgroundAudioOptions) {
  const { src, enabled = true, autoplay = true, volume = 0.55 } = options

  const elRef = useRef<HTMLAudioElement | null>(null)
  const inFlightRef = useRef(false)
  const gestureArmedRef = useRef(false)

  const [state, setState] = useState<BackgroundAudioState>(() => ({
    status: 'idle',
    currentTime: 0,
    duration: 0,
    startedAtMs: null,
    errorMessage: null,
  }))

  const syncFromEl = useCallback(() => {
    const el = elRef.current
    if (!el) return
    setState((prev) => ({
      ...prev,
      currentTime: Number.isFinite(el.currentTime) ? el.currentTime : prev.currentTime,
      duration: Number.isFinite(el.duration) ? el.duration : prev.duration,
    }))
  }, [])

  const stop = useCallback(() => {
    const el = elRef.current
    if (el) {
      el.pause()
      try {
        el.currentTime = 0
      } catch {}
    }
    setState((prev) => ({
      ...prev,
      status: 'paused',
      currentTime: 0,
      startedAtMs: null,
      errorMessage: null,
    }))
  }, [])

  const playFromStart = useCallback(async () => {
    if (!enabled) return
    if (inFlightRef.current) return
    const el = elRef.current
    if (!el) return

    inFlightRef.current = true
    try {
      el.loop = false
      el.volume = volume
      el.preload = 'auto'
      try {
        el.currentTime = 0
      } catch {}

      setState((prev) => ({
        ...prev,
        status: 'playing',
        currentTime: 0,
        duration: Number.isFinite(el.duration) ? el.duration : prev.duration,
        startedAtMs: performance.now(),
        errorMessage: null,
      }))

      await el.play()
    } catch (error) {
      if (isAutoplayBlocked(error)) {
        setState((prev) => ({
          ...prev,
          status: 'blocked',
          errorMessage: null,
        }))
        return
      }

      const name = getErrorName(error)
      const message = getErrorMessage(error)
      setState((prev) => ({
        ...prev,
        status: name === 'AbortError' ? 'paused' : 'error',
        errorMessage: message || name || 'Audio error',
      }))
    } finally {
      inFlightRef.current = false
    }
  }, [enabled, volume])

  const setAudioRef = useCallback(
    (el: HTMLAudioElement | null) => {
      elRef.current = el
      if (!el) return
      el.loop = false
      el.volume = volume
    },
    [volume],
  )

  useEffect(() => {
    const el = elRef.current
    if (el) {
      el.pause()
      try {
        el.currentTime = 0
      } catch {}
    }

    setState({
      status: 'idle',
      currentTime: 0,
      duration: 0,
      startedAtMs: null,
      errorMessage: null,
    })
  }, [src])

  useEffect(() => {
    if (enabled) return
    stop()
  }, [enabled, stop])

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const onTime = () => syncFromEl()
    const onLoaded = () => syncFromEl()
    const onPause = () => {
      setState((prev) => (prev.status === 'playing' ? { ...prev, status: 'paused' } : prev))
    }
    const onPlay = () => {
      setState((prev) => ({ ...prev, status: 'playing', errorMessage: null }))
    }
    const onError = () => {
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: prev.errorMessage || 'Audio failed to load',
      }))
    }
    const onEnded = () => {
      syncFromEl()
      setState((prev) => ({ ...prev, status: 'ended' }))
    }

    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onLoaded)
    el.addEventListener('pause', onPause)
    el.addEventListener('play', onPlay)
    el.addEventListener('error', onError)
    el.addEventListener('ended', onEnded)

    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onLoaded)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('error', onError)
      el.removeEventListener('ended', onEnded)
    }
  }, [syncFromEl])

  useEffect(() => {
    if (!autoplay) return
    if (!enabled) return
    void playFromStart()
  }, [autoplay, enabled, playFromStart])

  useEffect(() => {
    if (!enabled) return
    if (state.status !== 'blocked') return
    if (gestureArmedRef.current) return

    gestureArmedRef.current = true

    const onGesture = () => {
      gestureArmedRef.current = false
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('touchstart', onGesture)
      window.removeEventListener('wheel', onGesture)
      window.removeEventListener('keydown', onGesture)
      void playFromStart()
    }

    window.addEventListener('pointerdown', onGesture, { passive: true })
    window.addEventListener('touchstart', onGesture, { passive: true })
    window.addEventListener('wheel', onGesture, { passive: true })
    window.addEventListener('keydown', onGesture)

    return () => {
      gestureArmedRef.current = false
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('touchstart', onGesture)
      window.removeEventListener('wheel', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  }, [enabled, playFromStart, state.status])

  return { audioRef: setAudioRef, state, playFromStart, stop }
}

