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
  requestAudioFocus,
  setNavConsumer,
}: SceneComponentProps) {
  const baseUrl = import.meta.env.BASE_URL
  const mediaVersion = import.meta.env.VITE_MEDIA_VERSION as string | undefined
  const withVersion = (url: string) => {
    if (!mediaVersion) return url
    const join = url.includes('?') ? '&' : '?'
    return `${url}${join}v=${encodeURIComponent(mediaVersion)}`
  }
  const fileName = (index: number) => `moment-${String(index + 1).padStart(2, '0')}.mp4`

  const ambience = useMemo(
    () => [
      { emoji: '😄', x: 14, y: 74, delay: 0, size: 18, dur: 7200 },
      { emoji: '🤭', x: 78, y: 76, delay: 600, size: 18, dur: 7600 },
      { emoji: '😂', x: 26, y: 86, delay: 1200, size: 20, dur: 8400 },
      { emoji: '😆', x: 68, y: 88, delay: 1600, size: 20, dur: 8800 },
      { emoji: '🤣', x: 50, y: 82, delay: 2200, size: 22, dur: 9400 },
      { emoji: '✨', x: 10, y: 92, delay: 900, size: 18, dur: 9800 },
      { emoji: '🤍', x: 86, y: 92, delay: 1400, size: 18, dur: 10200 },
    ],
    [],
  )
  const videos = useMemo<VideoItem[]>(
    () => [
      {
        title: 'Moment 01',
        src: withVersion(`${baseUrl}videos/moment-01.mp4`),
        poster: withVersion(`${baseUrl}videos/posters/moment-01.jpg`),
      },
      {
        title: 'Moment 02',
        src: withVersion(`${baseUrl}videos/moment-02.mp4`),
        poster: withVersion(`${baseUrl}videos/posters/moment-02.jpg`),
      },
      {
        title: 'Moment 03',
        src: withVersion(`${baseUrl}videos/moment-03.mp4`),
        poster: withVersion(`${baseUrl}videos/posters/moment-03.jpg`),
      },
    ],
    [baseUrl, mediaVersion],
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
    const focused = openIndex !== null
    if (focused) requestAudioFocus(true)
    return () => {
      if (focused) requestAudioFocus(false)
    }
  }, [openIndex, requestAudioFocus])

  useEffect(() => {
    if (!active) return
    centerRef.current = 0
    setCenter(0)
    setFailed({})
  }, [active])

  useEffect(() => {
    if (!active) return
    if (openIndex !== null) return

    const playPreview = () => {
      const el = previewRef.current
      if (!el) return
      el.muted = true
      el.preload = 'auto'
      el.play().catch(() => {})
    }

    playPreview()

    const onGesture = () => {
      if (openIndex !== null) return
      playPreview()
    }

    window.addEventListener('pointerdown', onGesture, { passive: true })
    window.addEventListener('touchstart', onGesture, { passive: true })
    window.addEventListener('wheel', onGesture, { passive: true })
    window.addEventListener('keydown', onGesture)

    return () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('touchstart', onGesture)
      window.removeEventListener('wheel', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
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
      <div className="videosEmojiFloor" aria-hidden="true">
        {ambience.map((item, i) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={`${item.emoji}-${i}`}
            className="videosEmoji"
            style={{
              ['--x' as never]: `${item.x}%`,
              ['--y' as never]: `${item.y}%`,
              ['--delay' as never]: `${item.delay}ms`,
              ['--size' as never]: `${item.size}px`,
              ['--dur' as never]: `${item.dur}ms`,
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>
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
                      preload="auto"
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

        <div className="videoControls" role="navigation" aria-label="Videos">
          <div className="hudCard videoHudCard">
            <button
              type="button"
              className="navBtn"
              onClick={() => {
                if (openIndex !== null) return
                setCenter((c) => {
                  const next = Math.max(0, c - 1)
                  centerRef.current = next
                  return next
                })
              }}
              disabled={openIndex !== null || center <= 0}
              aria-label="Previous video"
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

            <div className="dots" aria-label="Video progress">
              {videos.map((video, i) => (
                <button
                  key={video.src}
                  className="dotBtn"
                  type="button"
                  onClick={() => {
                    if (openIndex !== null) return
                    centerRef.current = i
                    setCenter(i)
                  }}
                  aria-label={`Go to video ${i + 1}`}
                  aria-disabled={openIndex !== null ? 'true' : 'false'}
                >
                  <span
                    className="dot"
                    aria-current={i === center ? 'true' : 'false'}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              className="navBtn"
              onClick={() => {
                if (openIndex !== null) return
                setCenter((c) => {
                  const next = Math.min(videos.length - 1, c + 1)
                  centerRef.current = next
                  return next
                })
              }}
              disabled={openIndex !== null || center >= videos.length - 1}
              aria-label="Next video"
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
