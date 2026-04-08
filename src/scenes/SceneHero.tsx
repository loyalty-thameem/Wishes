import { useEffect, useMemo, useState } from 'react'
import EmojiRiseBurst from '../components/EmojiRiseBurst'
import HeroParticleText from '../components/HeroParticleText'
import type { SceneComponentProps } from '../components/SceneStage'

export default function SceneHero({ active }: SceneComponentProps) {
  const [started, setStarted] = useState(false)
  const [formed, setFormed] = useState(false)
  const [burstId, setBurstId] = useState(0)

  useEffect(() => {
    if (!active) return
    setStarted(true)
  }, [active])

  const wordmark = useMemo(() => 'MY ROOHI 🤍', [])

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
