import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type SceneDirection = 1 | -1

export interface UseSceneNavigationOptions {
  initialIndex?: number
  locked?: boolean
  transitionMs?: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function useSceneNavigation(
  sceneCount: number,
  options: UseSceneNavigationOptions = {},
) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
  }, [])

  const transitionMs = prefersReducedMotion ? 1 : (options.transitionMs ?? 1100)
  const lockedRef = useRef(options.locked ?? false)
  const lastNavAtRef = useRef(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const [index, setIndex] = useState(() => {
    const initial = options.initialIndex ?? 0
    return clamp(initial, 0, Math.max(0, sceneCount - 1))
  })
  const indexRef = useRef(index)
  const [direction, setDirection] = useState<SceneDirection>(1)

  useEffect(() => {
    lockedRef.current = options.locked ?? false
  }, [options.locked])

  useEffect(() => {
    indexRef.current = index
  }, [index])

  const canNavigateNow = useCallback(() => {
    const now = Date.now()
    if (now - lastNavAtRef.current < transitionMs * 0.85) return false
    lastNavAtRef.current = now
    return true
  }, [transitionMs])

  const goTo = useCallback(
    (nextIndex: number) => {
      if (sceneCount <= 1) return
      if (lockedRef.current) return
      if (!canNavigateNow()) return

      const current = indexRef.current
      const clamped = clamp(nextIndex, 0, sceneCount - 1)
      if (clamped === current) return

      setDirection(clamped > current ? 1 : -1)
      setIndex(clamped)
    },
    [canNavigateNow, sceneCount],
  )

  const next = useCallback(() => goTo(indexRef.current + 1), [goTo])
  const prev = useCallback(() => goTo(indexRef.current - 1), [goTo])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (lockedRef.current) return

      const key = e.key
      if (key === 'ArrowDown' || key === 'PageDown' || key === ' ') {
        e.preventDefault()
        next()
        return
      }
      if (key === 'ArrowUp' || key === 'PageUp') {
        e.preventDefault()
        prev()
        return
      }
      if (key === 'Home') {
        e.preventDefault()
        goTo(0)
        return
      }
      if (key === 'End') {
        e.preventDefault()
        goTo(sceneCount - 1)
      }
    }

    window.addEventListener('keydown', onKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goTo, next, prev, sceneCount])

  useEffect(() => {
    const wheelThreshold = 28
    const onWheel = (e: WheelEvent) => {
      if (lockedRef.current) return
      const dy = e.deltaY
      if (Math.abs(dy) < 4) return

      e.preventDefault()
      if (Math.abs(dy) < wheelThreshold) return

      if (dy > 0) next()
      else prev()
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [next, prev])

  useEffect(() => {
    const swipeThreshold = 56

    const onTouchStart = (e: TouchEvent) => {
      if (lockedRef.current) return
      const touch = e.touches[0]
      if (!touch) return
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (lockedRef.current) return
      if (!touchStartRef.current) return

      const touch = e.touches[0]
      if (!touch) return

      const dx = touch.clientX - touchStartRef.current.x
      const dy = touch.clientY - touchStartRef.current.y

      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
        e.preventDefault()
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (lockedRef.current) return
      const start = touchStartRef.current
      touchStartRef.current = null

      const touch = e.changedTouches[0]
      if (!start || !touch) return

      const dy = touch.clientY - start.y
      if (Math.abs(dy) < swipeThreshold) return

      if (dy < 0) next()
      else prev()
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [next, prev])

  return { index, direction, transitionMs, goTo, next, prev }
}

