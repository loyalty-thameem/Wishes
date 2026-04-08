import type { SceneComponentProps } from '../components/SceneStage'

export default function SceneSpecialDay({ active }: SceneComponentProps) {
  return (
    <div
      className="sceneShell dayPanel"
      data-active={active ? 'true' : 'false'}
    >
      <div className="dayHalo" aria-hidden="true" />
      <h2 className="dayDate">09 April 2026</h2>

      <div className="dayCopy">
        <p className="sceneBody">This is not just a birthday…</p>
        <p className="sceneBody">This is the day Allah wrote you in my life…</p>
        <p className="sceneBody">
          The day my Roohi was born… for me… in the most beautiful halal way…
        </p>
      </div>
    </div>
  )
}
