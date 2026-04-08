import { useEffect, useMemo, useRef, useState } from 'react'
import type { SceneComponentProps } from '../components/SceneStage'

type VideoItem = {
  title: string
  src: string
  poster?: string
}

export default function SceneVideos({
  active,
  requestNavLock,
  setNavConsumer,
}: SceneComponentProps) {
  const baseUrl = import.meta.env.BASE_URL
  const fileName = (index: number) => `moment-${String(index + 1).padStart(2, '0')}.mp4`
  const videos = useMemo<VideoItem[]>(
    () => [
      {
        title: 'Moment 01',
        src: `${baseUrl}videos/moment-01.mp4`,
        poster: `${baseUrl}videos/posters/moment-01.jpg`,
      },
      {
        title: 'Moment 02',
        src: `${baseUrl}videos/moment-02.mp4`,
        poster: `${baseUrl}videos/posters/moment-02.jpg`,
      },
      {
        title: 'Moment 03',
        src: `${baseUrl}videos/moment-03.mp4`,
        poster: `${baseUrl}videos/posters/moment-03.jpg`,
      },
    ],
    [baseUrl],
  )
  const count = videos.length
  const countLabel = `${count} ${count === 1 ? 'video' : 'videos'}`

  const [center, setCenter] = useState(0)
  const centerRef = useRef(center)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const previewRef = useRef<HTMLVideoElement | null>(null)
  const [failed, setFailed] = useState<Record<number, boolean>>({})

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
    if (openIndex !== null) return
    const el = previewRef.current
    if (!el) return
    el.muted = true
    el.play().catch(() => {})
  }, [active, center, openIndex])

  useEffect(() => {
    if (openIndex === null) return
    previewRef.current?.pause()
  }, [openIndex])

  useEffect(() => {
    if (!active) return

    const activatedAt = performance.now()
    let lastStepAt = 0

    setNavConsumer((dir) => {
      const now = performance.now()
      if (now - activatedAt < 200) return true
      if (now - lastStepAt < 460) return true

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
                  {isCenter && !failed[i] ? (
                    <video
                      key={`${v.src}-center`}
                      ref={previewRef}
                      src={v.src}
                      poster={v.poster}
                      muted
                      playsInline
                      loop
                      preload="metadata"
                      autoPlay
                      onError={() => {
                        setFailed((prev) => ({ ...prev, [i]: true }))
                      }}
                    />
                  ) : (
                    <div className="videoPlaceholder">
                      <span className="videoPlaceholderLabel">
                        {v.title}
                        <span className="videoPlaceholderSub">
                          Add{' '}
                          <code className="videoPlaceholderCode">
                            {`public/videos/${fileName(i)}`}
                          </code>
                        </span>
                      </span>
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
            <video
              src={videos[openIndex]?.src ?? ''}
              poster={videos[openIndex]?.poster}
              controls
              autoPlay
              playsInline
              preload="auto"
              controlsList="nodownload"
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
