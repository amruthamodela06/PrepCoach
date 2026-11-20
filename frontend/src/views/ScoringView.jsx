import { useEffect, useState } from 'react'
import { fetchScore } from '../lib/api'

const STAGES = [
  'Analyzing your transcript and technical depth…',
  'Scoring answers across all 4 role dimensions…',
  'Computing communication & quantification metrics…',
  'Drafting actionable improvements and model answers…',
]

export default function ScoringView({ role, messages, onScored }) {
  const [error, setError] = useState(false)
  const [stageIdx, setStageIdx] = useState(0)

  async function attempt() {
    setError(false)
    setStageIdx(0)
    try {
      const data = await fetchScore({ role, messages })
      onScored(data)
    } catch {
      setError(true)
    }
  }

  useEffect(() => {
    attempt()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (error) return
    const id = setInterval(() => {
      setStageIdx((i) => (i + 1) % STAGES.length)
    }, 2200)
    return () => clearInterval(id)
  }, [error])

  return (
    <section className="view" id="scoring-view">
      {!error && (
        <div className="scoring-loader">
          <div className="spinner" aria-hidden="true" />
          <p className="scoring-title">Evaluating your interview&hellip;</p>
          <p className="scoring-hint">{STAGES[stageIdx]}</p>
        </div>
      )}
      {error && (
        <div className="scoring-error">
          <p className="scoring-title">Couldn't generate the scorecard.</p>
          <p className="scoring-hint">Your transcript is safe — you can try again.</p>
          <button type="button" className="btn btn-primary" onClick={attempt}>Retry</button>
        </div>
      )}
    </section>
  )
}
