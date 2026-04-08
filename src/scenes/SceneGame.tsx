import { useEffect, useMemo, useState } from 'react'
import type { SceneComponentProps } from '../components/SceneStage'

export default function SceneGame({ active, spawnHearts }: SceneComponentProps) {
  const [result, setResult] = useState<'idle' | 'wrong' | 'correct'>('idle')

  const choices = useMemo(
    () => [
      { key: 'parents', label: 'Your Mom & Dad ❤️', correct: false },
      { key: 'siblings', label: 'Your Sister & Brother 💖', correct: false },
      { key: 'husband', label: 'Husband Thameem Ansari🤍🤍', correct: true },
      { key: 'else', label: 'Someone else 😄', correct: false },
    ],
    [],
  )

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
        {choices.map((choice) => {
          const isCorrect = choice.correct
          const disabled = result === 'correct' && !isCorrect
          return (
            <button
              key={choice.key}
              type="button"
              className={[
                'gameChoice',
                isCorrect ? 'isCorrect' : '',
                result === 'correct' && isCorrect ? 'isActive' : '',
                result === 'correct' && !isCorrect ? 'isDimmed' : '',
              ].join(' ')}
              disabled={disabled}
              onClick={() => {
                if (result === 'correct') return
                if (isCorrect) {
                  setResult('correct')
                  spawnHearts(window.innerWidth / 2, window.innerHeight / 2, 16)
                  navigator.vibrate?.(12)
                  return
                }
                setResult('wrong')
                navigator.vibrate?.(8)
              }}
            >
              {choice.label}
            </button>
          )
        })}
      </div>

      <p className="sceneFine gameHint" aria-live="polite">
        {result === 'correct' ? (
          <>
            <span className="gameHintLine">Correct… Always 🤍</span>
            <span className="gameHintLine">
              Inshallah, he will love you deeply and care for you forever... 🤍
            </span>
          </>
        ) : result === 'wrong' ? (
          'No no 😄 try again.'
        ) : (
          'Tap your answer.'
        )}
      </p>
    </div>
  )
}
