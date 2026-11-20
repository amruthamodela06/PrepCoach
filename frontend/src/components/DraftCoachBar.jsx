import { useState } from 'react'
import { analyzeDraftAnswer } from '../lib/feedback'
import { rewriteAnswer } from '../lib/api'
import { useUi } from '../context/UiContext'

export default function DraftCoachBar({
  role,
  currentQuestion,
  draftText,
  disabled,
  onReplaceDraft,
}) {
  const { toast } = useUi()
  const [polishing, setPolishing] = useState(false)

  const metrics = analyzeDraftAnswer(draftText)
  if (metrics.wordCount === 0) return null

  async function handlePolish() {
    if (polishing || disabled || metrics.wordCount < 6) return
    setPolishing(true)
    try {
      const res = await rewriteAnswer({
        role,
        question: currentQuestion,
        draft: draftText,
      })
      if (res?.rewritten) {
        onReplaceDraft(res.rewritten)
        toast('Draft polished — review and edit before sending')
      }
    } catch {
      toast('Could not polish draft right now')
    } finally {
      setPolishing(false)
    }
  }

  return (
    <div className="draft-coach-bar" aria-live="polite">
      <div className="draft-coach-badges">
        <span className="coach-chip">
          {metrics.wordCount} words (~{metrics.speakingSeconds}s)
        </span>
        <span className={`coach-chip ${metrics.wordCount >= 35 ? 'good' : ''}`}>
          {metrics.depthLabel}
        </span>
        {metrics.hasMetrics && (
          <span className="coach-chip good" title="Includes quantified metrics or numbers">
            +Quantified
          </span>
        )}
        {metrics.hasStructure && (
          <span className="coach-chip good" title="Includes trade-off or structured reasoning cues">
            +Structured
          </span>
        )}
        {metrics.fillerCount > 0 && (
          <span className="coach-chip warn" title="Try removing filler words for a crisper delivery">
            {metrics.fillerCount} filler{metrics.fillerCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {metrics.wordCount >= 8 && (
        <button
          type="button"
          className="coach-polish-btn"
          disabled={disabled || polishing}
          onClick={handlePolish}
          title="Restructure your draft into a sharper answer with AI"
        >
          {polishing ? 'Polishing…' : '✨ Polish draft'}
        </button>
      )}
    </div>
  )
}
