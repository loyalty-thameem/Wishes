import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HeartsOverlay from './components/HeartsOverlay'
import type { HeartItem } from './components/HeartsOverlay'
import ParticlesBackground from './components/ParticlesBackground'
import SceneStage from './components/SceneStage'
import type { SceneDef } from './components/SceneStage'
import {
  BACKGROUND_AUDIO_SRC,
  BACKGROUND_AUDIO_VOLUME,
} from './audio/backgroundAudio'
import { useBackgroundAudio } from './hooks/useBackgroundAudio'
import { useSceneNavigation } from './hooks/useSceneNavigation'
import { useSfx } from './hooks/useSfx'
import SceneClosing from './scenes/SceneClosing'
import SceneDua from './scenes/SceneDua'
import SceneGame from './scenes/SceneGame'
import SceneHero from './scenes/SceneHero'
import SceneProposal from './scenes/SceneProposal'
import SceneSpecialDay from './scenes/SceneSpecialDay'
import SceneVerse from './scenes/SceneVerse'
import SceneVideos from './scenes/SceneVideos'
import './App.css'

function App() {
  const scenes = useMemo<SceneDef[]>(
    () => [
      { key: 'hero', Component: SceneHero },
      { key: 'dua', Component: SceneDua },
      { key: 'verse', Component: SceneVerse },
      { key: 'special', Component: SceneSpecialDay },
      { key: 'videos', Component: SceneVideos },
      { key: 'game', Component: SceneGame },
      { key: 'proposal', Component: SceneProposal },
      { key: 'closing', Component: SceneClosing },
    ],
    [],
  )

  const [navLocked, setNavLocked] = useState(false)
  const navConsumerRef = useRef<(((direction: 1 | -1) => boolean) | null)>(null)
  const setNavConsumer = useCallback(
    (consumer: ((direction: 1 | -1) => boolean) | null) => {
      navConsumerRef.current = consumer
    },
    [],
  )
  const consumeNav = useCallback((direction: 1 | -1) => {
    return navConsumerRef.current?.(direction) ?? false
  }, [])
  const [sfxOn, setSfxOn] = useState(true)
  const showControls = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('controls') === '1'
    } catch {
      return false
    }
  }, [])
  const { index, direction, transitionMs, goTo } = useSceneNavigation(
    scenes.length,
    { locked: navLocked, consume: consumeNav },
  )
  const { playTypeTick, playNavigate, playTap } = useSfx(sfxOn)

  const {
    audioRef,
    state: bgAudio,
    playFromStart,
    pause: pauseBg,
    resume: resumeBg,
    stop,
  } = useBackgroundAudio({
    src: BACKGROUND_AUDIO_SRC,
    autoplay: true,
    volume: BACKGROUND_AUDIO_VOLUME,
  })

  const userMutedRef = useRef(false)
  const bgWasPlayingRef = useRef(false)
  const bgPausedByFocusRef = useRef(false)
  const audioFocusCountRef = useRef(0)

  useEffect(() => {
    bgWasPlayingRef.current = bgAudio.status === 'playing'
  }, [bgAudio.status])

  const requestAudioFocus = useCallback(
    (focused: boolean) => {
      if (focused) {
        if (audioFocusCountRef.current === 0) {
          bgPausedByFocusRef.current = false
          if (bgWasPlayingRef.current && !userMutedRef.current) {
            bgPausedByFocusRef.current = true
            pauseBg()
          }
        }
        audioFocusCountRef.current += 1
        return
      }

      audioFocusCountRef.current = Math.max(0, audioFocusCountRef.current - 1)
      if (audioFocusCountRef.current !== 0) return
      if (!bgPausedByFocusRef.current) return
      bgPausedByFocusRef.current = false
      if (userMutedRef.current) return
      void resumeBg()
    },
    [pauseBg, resumeBg],
  )

  const backgroundThemes = useMemo(
    () => [
      { bg0: '#070312', bg1: '#120823' },
      { bg0: '#05070c', bg1: '#070b14' },
      { bg0: '#031115', bg1: '#062126' },
      { bg0: '#120308', bg1: '#2a0814' },
      { bg0: '#040f07', bg1: '#0a1c10' },
    ],
    [],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const root = document.documentElement
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')

    const applyTheme = (theme: { bg0: string; bg1: string }) => {
      root.style.setProperty('--bg0', theme.bg0)
      root.style.setProperty('--bg1', theme.bg1)
      if (meta) meta.content = theme.bg0
    }

    applyTheme(backgroundThemes[0] ?? { bg0: '#05070c', bg1: '#070b14' })

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
    if (reduceMotion) return

    let idx = 0
    const timer = window.setInterval(() => {
      idx = (idx + 1) % backgroundThemes.length
      const theme = backgroundThemes[idx]
      if (theme) applyTheme(theme)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [backgroundThemes])

  const requestNavLock = useCallback((locked: boolean) => {
    setNavLocked(locked)
  }, [])

  const [hearts, setHearts] = useState<HeartItem[]>([])
  const cleanupTimersRef = useRef<number[]>([])

  useEffect(() => {
    return () => {
      for (const t of cleanupTimersRef.current) window.clearTimeout(t)
      cleanupTimersRef.current = []
    }
  }, [])

  const spawnHearts = useCallback((x: number, y: number, count = 1) => {
    const pool = ['🤍', '✨', '💫']
    const created: HeartItem[] = []

    for (let i = 0; i < count; i += 1) {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}-${i}`
      const emoji = pool[Math.floor(Math.random() * pool.length)] ?? '🤍'
      const size = 16 + Math.random() * 14
      const delayMs = Math.random() * 160
      const durationMs = 1600 + Math.random() * 900
      const drift = (Math.random() - 0.5) * 90

      created.push({
        id,
        x: x + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 14,
        emoji,
        delayMs,
        durationMs,
        size,
        drift,
      })

      const t = window.setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== id))
      }, delayMs + durationMs + 80)
      cleanupTimersRef.current.push(t)
    }

    setHearts((prev) => [...prev, ...created])
  }, [])

  const lastHapticAtRef = useRef(0)

  const appRef = useRef<HTMLDivElement | null>(null)
  const parallaxRafRef = useRef<number | null>(null)
  const lastParallaxRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    return () => {
      if (parallaxRafRef.current) window.cancelAnimationFrame(parallaxRafRef.current)
    }
  }, [])

  const prevSceneRef = useRef(index)
  useEffect(() => {
    const prev = prevSceneRef.current
    if (prev === index) return
    prevSceneRef.current = index
    playNavigate()
  }, [index, playNavigate])

  const replayedAtEndRef = useRef(false)
  useEffect(() => {
    if (index === 0) replayedAtEndRef.current = false

    const lastIndex = scenes.length - 1
    if (index !== lastIndex) return
    if (replayedAtEndRef.current) return

    replayedAtEndRef.current = true
    void playFromStart()
  }, [index, playFromStart, scenes.length])

  return (
    <div
      ref={appRef}
      className="app"
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return

        const targetEl = e.target as HTMLElement | null
        const inHud = targetEl?.closest?.('.hud')
        if (!inHud) playTap()

        if (e.pointerType === 'touch') {
          const now = performance.now()
          if (now - lastHapticAtRef.current > 240) {
            lastHapticAtRef.current = now
            navigator.vibrate?.(6)
          }
        }
        const count = e.pointerType === 'touch' ? 2 : 1
        spawnHearts(e.clientX, e.clientY, count)
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        lastParallaxRef.current = { x: e.clientX, y: e.clientY }
        if (parallaxRafRef.current) return
        parallaxRafRef.current = window.requestAnimationFrame(() => {
          parallaxRafRef.current = null
          const el = appRef.current
          if (!el) return
          const nx = (lastParallaxRef.current.x / Math.max(1, window.innerWidth)) * 2 - 1
          const ny = (lastParallaxRef.current.y / Math.max(1, window.innerHeight)) * 2 - 1
          el.style.setProperty('--mx', nx.toFixed(3))
          el.style.setProperty('--my', ny.toFixed(3))
        })
      }}
      onPointerLeave={() => {
        const el = appRef.current
        if (!el) return
        el.style.setProperty('--mx', '0')
        el.style.setProperty('--my', '0')
      }}
    >
      <ParticlesBackground />
      <div className="introFx" aria-hidden="true" />
      <HeartsOverlay hearts={hearts} />
      <audio ref={audioRef} src={BACKGROUND_AUDIO_SRC} preload="auto" />

      {showControls ? (
        <div className="controls" role="group" aria-label="Controls">
          <button
            type="button"
            className="ctrlBtn"
            aria-pressed={bgAudio.status === 'playing'}
            aria-label="Toggle background audio"
            onClick={() => {
              if (bgAudio.status === 'playing') stop()
              else void playFromStart()
              userMutedRef.current = bgAudio.status === 'playing'
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M11.5 15V4.7l9-1.9v10.7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M9 19.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z"
                fill="currentColor"
                opacity="0.9"
              />
              <path
                d="M20.5 19.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z"
                fill="currentColor"
                opacity="0.9"
              />
            </svg>
          </button>
          <button
            type="button"
            className="ctrlBtn"
            aria-pressed={sfxOn}
            onClick={() => setSfxOn((v) => !v)}
            aria-label="Toggle typing SFX"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M4 14v-4M7.5 17V7M11 15v-6M14.5 18V6M18 15v-6M21 14v-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
        </div>
      ) : null}
      <SceneStage
        scenes={scenes}
        activeIndex={index}
        direction={direction}
        transitionMs={transitionMs}
        requestNavLock={requestNavLock}
        setNavConsumer={setNavConsumer}
        requestAudioFocus={requestAudioFocus}
        goTo={goTo}
        spawnHearts={spawnHearts}
        playTypeTick={playTypeTick}
      />

      <div className="hud" aria-hidden="false">
        <div className="hudCard" role="navigation" aria-label="Scenes">
          <button
            type="button"
            className="navBtn"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous scene"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M6 14.2 12 8.2l6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
          <button
            type="button"
            className={[
              'audioBtn',
              bgAudio.status === 'playing' ? 'isOn' : 'isOff',
              bgAudio.status === 'blocked' ? 'isPulsing' : '',
            ].join(' ')}
            onClick={() => {
              if (bgAudio.status === 'playing') stop()
              else void playFromStart()
              userMutedRef.current = bgAudio.status === 'playing'
            }}
            aria-label={bgAudio.status === 'playing' ? 'Pause audio' : 'Play audio'}
            aria-pressed={bgAudio.status === 'playing'}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M11 5 7.2 8H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2.2L11 19V5Z"
                fill="currentColor"
                opacity="0.9"
              />
              {bgAudio.status === 'playing' ? (
                <path
                  d="M15.5 8.8c1.1 1.3 1.1 5.1 0 6.4M18 7c2 2.2 2 7.8 0 10"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.85"
                />
              ) : (
                <path
                  d="M15 9 20 15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.85"
                />
              )}
            </svg>
          </button>
          <div className="dots" aria-label="Scene progress">
            {scenes.map((scene, i) => (
              <button
                key={scene.key}
                className="dotBtn"
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to scene ${i + 1}`}
              >
                <span
                  className="dot"
                  aria-current={i === index ? 'true' : 'false'}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="navBtn"
            onClick={() => goTo(index + 1)}
            disabled={index === scenes.length - 1}
            aria-label="Next scene"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M6 9.8 12 15.8l6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
