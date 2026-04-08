import { useEffect, useState } from 'react'
import type { SceneComponentProps } from '../components/SceneStage'

export default function SceneGame({ active, spawnHearts }: SceneComponentProps) {
  const [result, setResult] = useState<'idle' | 'wrong' | 'correct'>('idle')

  useEffect(() => {
    if (result !== 'wrong') return
    const t = window.setTimeout(() => setResult('idle'), 720)
    return () => window.clearTimeout(t)
  }, [result])

  return (
    <div className="sceneShell gamePanel" data-active={active ? 'true' : 'false'}>
      <p className="sceneKicker">Fun Love Game</p>
      <h2 className="sceneTitle gameTitle">Who loves you the most?</h2>

      <div
        className={['gameChoices', result === 'wrong' ? 'isShaking' : ''].join(' ')}
      >
        <button
          type="button"
          className={[
            'gameChoice',
            'isCorrect',
            result === 'correct' ? 'isActive' : '',
          ].join(' ')}
          onClick={() => {
            setResult('correct')
            spawnHearts(window.innerWidth / 2, window.innerHeight / 2, 14)
            navigator.vibrate?.(10)
          }}
        >
          You 🤍
        </button>
        <button
          type="button"
          className={['gameChoice', result === 'correct' ? 'isDimmed' : ''].join(' ')}
          onClick={() => setResult('wrong')}
          disabled={result === 'correct'}
        >
          Someone else 😅
        </button>
      </div>

      <p className="sceneFine gameHint" aria-live="polite">
        {result === 'correct'
          ? 'Correct… always 🤍'
          : result === 'wrong'
            ? 'No no 😅 try again.'
            : 'Tap your answer.'}
      </p>
    </div>
  )
}
