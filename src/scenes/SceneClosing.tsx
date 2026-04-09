import { useEffect, useRef, useState } from 'react'
import type { SceneComponentProps } from '../components/SceneStage'

export default function SceneClosing({
  active,
  goTo,
  spawnHearts,
}: SceneComponentProps) {
  const [status, setStatus] = useState('')
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!active) setStatus('')
  }, [active])

  const flashStatus = (text: string, timeoutMs = 1400) => {
    setStatus(text)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setStatus(''), timeoutMs)
  }

  return (
    <div className="closingScene" data-active={active ? 'true' : 'false'}>
      <div className="closingLight" aria-hidden="true" />
      <div className="sceneShell closingPanel">
        <p className="sceneKicker">Closing Dua</p>
        <p className="closingDua">
          May Allah keep us together in خير and guide us always… Aameen 🤍...
        </p>

        <div className="closingActions">
          <button
            type="button"
            className="closingBtn closingBtnPrimary"
            onClick={() => {
              navigator.vibrate?.(10)
              spawnHearts(window.innerWidth / 2, window.innerHeight / 2, 10)
              goTo(0)
            }}
            aria-label="Replay from the beginning"
          >
            Replay
          </button>
          <button
            type="button"
            className="closingBtn"
            onClick={async () => {
              const url = window.location.href
              const title = 'MY ROOHI'
              const text = 'A digital dua — turned into a cinematic love story.'

              try {
                if (navigator.share) {
                  await navigator.share({ title, text, url })
                  navigator.vibrate?.(10)
                  spawnHearts(window.innerWidth / 2, window.innerHeight / 2, 12)
                  flashStatus('Shared 🤍')
                  return
                }

                if (navigator.clipboard?.writeText) {
                  await navigator.clipboard.writeText(url)
                  navigator.vibrate?.(8)
                  flashStatus('Link copied')
                  return
                }

                window.prompt('Copy this link:', url)
                flashStatus('Link ready')
              } catch (error) {
                const errorName =
                  typeof error === 'object' && error && 'name' in error
                    ? String((error as { name?: unknown }).name)
                    : ''
                if (errorName === 'AbortError') {
                  flashStatus('')
                  return
                }
                if (navigator.clipboard?.writeText) {
                  try {
                    await navigator.clipboard.writeText(url)
                    navigator.vibrate?.(8)
                    flashStatus('Link copied')
                    return
                  } catch {}
                }
                window.prompt('Copy this link:', url)
                flashStatus('Could not share')
              }
            }}
            aria-label="Share or copy link"
          >
            Share
          </button>
        </div>

        <p className="sceneFine closingStatus" aria-live="polite">
          {status.length ? status : <span aria-hidden="true">&nbsp;</span>}
        </p>
      </div>
    </div>
  )
}
