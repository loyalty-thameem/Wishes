import type { SceneComponentProps } from '../components/SceneStage'

export default function SceneClosing({ active }: SceneComponentProps) {
  return (
    <div className="closingScene" data-active={active ? 'true' : 'false'}>
      <div className="closingLight" aria-hidden="true" />
      <div className="sceneShell closingPanel">
        <p className="sceneKicker">Closing Dua</p>
        <p className="closingDua">
          May Allah keep us together in خير and guide us always… Aameen 🤍...
        </p>
      </div>
    </div>
  )
}
