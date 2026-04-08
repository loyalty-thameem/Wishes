import type { SceneComponentProps } from '../components/SceneStage'
import ProposalSilhouette from '../components/ProposalSilhouette'

export default function SceneProposal({ active }: SceneComponentProps) {
  return (
    <div
      className="sceneShell proposalPanel"
      data-active={active ? 'true' : 'false'}
    >
      <p className="sceneKicker">Halal Proposal</p>
      <h2 className="sceneTitle proposalTitle">In a halal way… with pure intention…</h2>
      <p className="sceneBody">I want to walk with you towards Jannah…</p>
      <p className="sceneBody">
        InshaAllah we are engaged… and soon we will complete our deen together…
      </p>

      <ProposalSilhouette />
    </div>
  )
}
