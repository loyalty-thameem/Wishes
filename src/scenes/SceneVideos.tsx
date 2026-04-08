import { useEffect, useMemo, useRef, useState } from 'react'
import type { SceneComponentProps } from '../components/SceneStage'

type VideoItem = {
  title: string
  src: string
}

function withAutoplay(src: string) {
  if (src.includes('autoplay=')) return src
  const sep = src.includes('?') ? '&' : '?'
  return `${src}${sep}autoplay=1`
}

export default function SceneVideos({
  active,
  requestNavLock,
  setNavConsumer,
}: SceneComponentProps) {
  const videos = useMemo<VideoItem[]>(
    () => [
      {
        title: 'Moment 01',
        src: 'https://drive.google.com/file/d/1_vX2vr1VywjFBbb_dVHSmbms7B54-qGV/preview',
      },
      {
        title: 'Moment 02',
        src: 'https://drive.google.com/file/d/1JfNOUpfp2re6j11RmTBN1z0IksK5vrfd/preview',
      },
      {
        title: 'Moment 03',
        src: 'https://drive.google.com/file/d/1kTigslBLit2sE3wjl3Ve-SmU97pMwS95/preview',
      },
    ],
    [],
  )
  const count = videos.length
  const countLabel = `${count} ${count === 1 ? 'video' : 'videos'}`

  const [center, setCenter] = useState(0)
  const centerRef = useRef(center)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    centerRef.current = center
  }, [center])

  useEffect(() => {
    requestNavLock(openIndex !== null)
    return () => requestNavLock(false)
  }, [openIndex, requestNavLock])

  useEffect(() => {
    if (!active) return
    centerRef.current = 0
    setCenter(0)
  }, [active])

  useEffect(() => {
    if (!active) return

    const activatedAt = performance.now()
    let lastStepAt = 0

    setNavConsumer((dir) => {
      const now = performance.now()
      if (now - activatedAt < 360) return true
      if (now - lastStepAt < 520) return true

      if (dir > 0) {
        if (centerRef.current >= videos.length - 1) return false
        lastStepAt = now
        setCenter((c) => {
          const next = Math.min(videos.length - 1, c + 1)
          centerRef.current = next
          return next
        })
        return true
      }

      if (centerRef.current <= 0) return false
      lastStepAt = now
      setCenter((c) => {
        const next = Math.max(0, c - 1)
        centerRef.current = next
        return next
      })
      return true
    })

    return () => setNavConsumer(null)
  }, [active, setNavConsumer, videos.length])

  useEffect(() => {
    if (!active) setOpenIndex(null)
  }, [active])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (openIndex === null) return
      if (e.key !== 'Escape') return
      setOpenIndex(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openIndex])

  return (
    <div className="videosScene" data-active={active ? 'true' : 'false'}>
      <div className="sceneShell videosPanel">
        <h2 className="sceneTitle videosTitle">Moments I want to keep forever 🤍</h2>
        <p className="sceneFine videosFine">
          {countLabel} • Scroll to switch moments. Tap the center card for full-screen.
        </p>

        <div
          className="videoCarousel"
          role="list"
          aria-label={`Video gallery, ${countLabel}`}
        >
          {videos.map((v, i) => {
            const offset = i - center
            const isCenter = offset === 0
            return (
              <button
                key={v.src}
                type="button"
                className={[
                  'videoCard',
                  isCenter ? 'isCenter' : '',
                  offset < 0 ? 'isLeft' : '',
                  offset > 0 ? 'isRight' : '',
                ].join(' ')}
                style={{
                  ['--off' as never]: `${offset}`,
                  ['--abs' as never]: `${Math.abs(offset)}`,
                  zIndex: 10 - Math.abs(offset),
                }}
                onClick={() => {
                  if (isCenter) setOpenIndex(i)
                  else setCenter(i)
                }}
                aria-label={`${v.title}${isCenter ? ', tap to play' : ', tap to focus'}`}
              >
                <div className="videoFrame" aria-hidden="true">
                  {isCenter ? (
                    <iframe
                      key={`${v.src}-center`}
                      src={withAutoplay(v.src)}
                      title={v.title}
                      loading="eager"
                      referrerPolicy="no-referrer"
                      allow="autoplay; fullscreen; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <div className="videoPlaceholder">
                      <span className="videoPlaceholderLabel">{v.title}</span>
                    </div>
                  )}
                </div>
                <div className="videoCardGlow" aria-hidden="true" />
              </button>
            )
          })}
        </div>
      </div>

      {openIndex !== null ? (
        <div
          className="videoModal"
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
          onClick={() => setOpenIndex(null)}
        >
          <div className="videoModalCard" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="videoModalClose"
              onClick={() => setOpenIndex(null)}
              aria-label="Close video"
            >
              Close
            </button>
            <iframe
              src={withAutoplay(videos[openIndex]?.src ?? '')}
              title={videos[openIndex]?.title ?? 'Video'}
              referrerPolicy="no-referrer"
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
