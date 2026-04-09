import type { ComponentType } from 'react'
import { useEffect, useRef, useState } from 'react'

export interface SceneSharedProps {
  requestNavLock: (locked: boolean) => void
  setNavConsumer: (
    consumer: ((direction: 1 | -1) => boolean) | null,
  ) => void
  goTo: (index: number) => void
  spawnHearts: (x: number, y: number, count?: number) => void
  playTypeTick: () => void
}

export interface SceneComponentProps extends SceneSharedProps {
  active: boolean
}

export interface SceneDef {
  key: string
  Component: ComponentType<SceneComponentProps>
}

export interface SceneStageProps extends SceneSharedProps {
  scenes: SceneDef[]
  activeIndex: number
  direction: 1 | -1
  transitionMs: number
}

export default function SceneStage({
  scenes,
  activeIndex,
  direction,
  transitionMs,
  requestNavLock,
  setNavConsumer,
  goTo,
  spawnHearts,
  playTypeTick,
}: SceneStageProps) {
  const prevIndexRef = useRef(activeIndex)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)

  useEffect(() => {
    const prev = prevIndexRef.current
    if (prev === activeIndex) return

    prevIndexRef.current = activeIndex
    setPrevIndex(prev)

    const t = window.setTimeout(() => setPrevIndex(null), transitionMs)
    return () => window.clearTimeout(t)
  }, [activeIndex, transitionMs])

  const Current = scenes[activeIndex]?.Component
  const Prev = prevIndex === null ? null : scenes[prevIndex]?.Component

  return (
    <div
      className="stage"
      style={{ ['--t' as never]: `${transitionMs}ms` }}
      aria-live="polite"
    >
      {Prev ? (
        <div
          className={[
            'scene',
            'scene--exit',
            direction > 0 ? 'scene--dir-down' : 'scene--dir-up',
          ].join(' ')}
        >
          <Prev
            active={false}
            requestNavLock={requestNavLock}
            setNavConsumer={setNavConsumer}
            goTo={goTo}
            spawnHearts={spawnHearts}
            playTypeTick={playTypeTick}
          />
        </div>
      ) : null}

      {Current ? (
        <div
          className={[
            'scene',
            'scene--enter',
            direction > 0 ? 'scene--dir-down' : 'scene--dir-up',
          ].join(' ')}
        >
          <Current
            active={true}
            requestNavLock={requestNavLock}
            setNavConsumer={setNavConsumer}
            goTo={goTo}
            spawnHearts={spawnHearts}
            playTypeTick={playTypeTick}
          />
        </div>
      ) : null}
    </div>
  )
}
