import { useEffect, useState } from 'react'
import type { SceneComponentProps } from '../components/SceneStage'
import MosqueSilhouette from '../components/MosqueSilhouette'

export default function SceneVerse({ active }: SceneComponentProps) {
  const [showArabic, setShowArabic] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)

  useEffect(() => {
    if (!active) {
      setShowArabic(false)
      setShowTranslation(false)
      return
    }

    const t1 = window.setTimeout(() => setShowArabic(true), 240)
    const t2 = window.setTimeout(() => setShowTranslation(true), 1450)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [active])

  return (
    <div className="verseScene">
      <div className="sceneShell versePanel" data-active={active ? 'true' : 'false'}>
        <p className="sceneKicker">Qur’an</p>

        <p className={['verseArabic', showArabic ? 'isVisible' : ''].join(' ')}>
          وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا
          لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ
          إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ
        </p>

        <div
          className={[
            'verseTranslation',
            showTranslation ? 'isVisible' : '',
          ].join(' ')}
        >
          <p className="sceneBody">
            “And of His signs is that He created for you from yourselves mates
            that you may find tranquility in them”
          </p>
          <p className="sceneFine">Surah Ar-Rum 30:21</p>
        </div>
      </div>

      <MosqueSilhouette />
    </div>
  )
}
