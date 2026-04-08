import { useEffect, useMemo, useRef, useState } from 'react'
import EmojiRiseBurst from '../components/EmojiRiseBurst'
import HeroParticleText from '../components/HeroParticleText'
import type { SceneComponentProps } from '../components/SceneStage'

export default function SceneHero({ active }: SceneComponentProps) {
  const [started, setStarted] = useState(false)
  const [formed, setFormed] = useState(false)
  const [burstId, setBurstId] = useState(0)

  const timeoutsRef = useRef<number[]>([])
  const sequenceStartedRef = useRef(false)
  const midScheduledRef = useRef(false)
  const endScheduledRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const clearTimers = () => {
    for (const t of timeoutsRef.current) window.clearTimeout(t)
    timeoutsRef.current = []
  }

  const stopVoice = () => {
    clearTimers()
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    audioRef.current = null
    window.speechSynthesis?.cancel()
  }

  const playAudio = async (src: string) => {
    try {
      const audio = new Audio(src)
      audioRef.current = audio
      audio.volume = 0.72
      audio.playbackRate = 0.92
      audio.preload = 'auto'
      audio.onended = () => {
        if (audioRef.current === audio) audioRef.current = null
      }
      await audio.play()
      return true
    } catch {
      audioRef.current = null
      return false
    }
  }

  const speak = (text: string) => {
    if (typeof window === 'undefined') return false
    const synth = window.speechSynthesis
    if (!synth) return false
    synth.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 0.72
    utter.pitch = 1.02
    utter.volume = 0.72
    synth.speak(utter)
    return true
  }

  const voiceSrc = useMemo(() => {
    const base = import.meta.env.BASE_URL
    return {
      intro: `${base}voice/roohi-intro.mp3`,
      mid: `${base}voice/roohi-mid.mp3`,
      end: `${base}voice/roohi-end.mp3`,
    }
  }, [])

  const playVoice = async (
    kind: keyof typeof voiceSrc,
    fallbackText: string,
  ) => {
    window.speechSynthesis?.cancel()
    const ok = await playAudio(voiceSrc[kind])
    if (!ok) speak(fallbackText)
  }

  useEffect(() => {
    if (!active) return
    setStarted(true)
  }, [active])

  const wordmark = useMemo(() => 'MY ROOHI 🤍', [])

  useEffect(() => {
    if (!active) {
      stopVoice()
      return
    }

    if (sequenceStartedRef.current) return

    const begin = () => {
      if (sequenceStartedRef.current) return
      sequenceStartedRef.current = true

      timeoutsRef.current.push(
        window.setTimeout(() => {
          void playVoice('intro', 'My Roo…hi…')
        }, 900),
      )
    }

    const onInteract = () => {
      window.removeEventListener('pointerdown', onInteract)
      window.removeEventListener('touchstart', onInteract)
      window.removeEventListener('wheel', onInteract)
      window.removeEventListener('keydown', onInteract)
      begin()
    }

    window.addEventListener('pointerdown', onInteract, { passive: true })
    window.addEventListener('touchstart', onInteract, { passive: true })
    window.addEventListener('wheel', onInteract, { passive: true })
    window.addEventListener('keydown', onInteract)
    return () => {
      window.removeEventListener('pointerdown', onInteract)
      window.removeEventListener('touchstart', onInteract)
      window.removeEventListener('wheel', onInteract)
      window.removeEventListener('keydown', onInteract)
      stopVoice()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  useEffect(() => {
    if (!active) return
    if (!sequenceStartedRef.current) return
    if (!formed) return

    if (!midScheduledRef.current) {
      midScheduledRef.current = true
      timeoutsRef.current.push(
        window.setTimeout(() => {
          void playVoice('mid', 'As…wi…ya Nus…rath…')
        }, 520),
      )
    }

    if (!endScheduledRef.current) {
      endScheduledRef.current = true
      timeoutsRef.current.push(
        window.setTimeout(() => {
          void playVoice('end', 'My Roohi… Aswiya Nusrath…')
        }, 2400),
      )
    }
  }, [active, formed])

  return (
    <div className="heroScene">
      <HeroParticleText
        text={wordmark}
        start={started}
        active={active}
        onFormed={() => {
          setFormed(true)
          setBurstId(Date.now())
        }}
      />

      <div
        className={[
          'heroTop',
          started ? 'isStarted' : '',
          formed ? 'isFormed' : '',
        ].join(' ')}
      >
        <h1 className="heroWordmark" aria-label="My Roohi">
          MY ROOHI <span className="heroHeart">🤍</span>
        </h1>
        <p className="heroName" aria-label="Aswiya Nusrath">
          Aswiya Nusrath
        </p>
      </div>

      <div className={['heroBottom', formed ? 'isFormed' : ''].join(' ')}>
        <p className="heroSubtitle">A special dua written by Allah...</p>
      </div>

      {formed ? <EmojiRiseBurst burstId={burstId} /> : null}
    </div>
  )
}
