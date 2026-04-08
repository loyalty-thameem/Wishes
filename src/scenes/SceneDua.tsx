import { useEffect, useMemo, useState } from 'react'
import TypingLines from '../components/TypingLines'
import type { SceneComponentProps } from '../components/SceneStage'

export default function SceneDua({ active, playTypeTick }: SceneComponentProps) {
  const [startTyping, setStartTyping] = useState(false)
  const lines = useMemo(
    () => [
      'My Roohi…',
      'You are not just an expectation,',
      "you are my dua beautifully accepted by Allah.",
      '',
      'May Allah bless you with good health,',
      'strong imaan, and always protect and guide you,',
      'filling your life with barakah and success',
      'in this dunya and akhirah...',
      'Aameen 🤍...',
    ],
    [],
  )

  useEffect(() => {
    if (!active) return
    const t = window.setTimeout(() => setStartTyping(true), 260)
    return () => window.clearTimeout(t)
  }, [active])

  return (
    <div className="sceneShell duaPanel" data-active={active ? 'true' : 'false'}>
      <p className="sceneKicker">Dua Message</p>

      <TypingLines
        start={startTyping}
        className="duaTyping"
        speedMsPerChar={22}
        linePauseMs={580}
        onType={playTypeTick}
        lines={lines}
      />
    </div>
  )
}
