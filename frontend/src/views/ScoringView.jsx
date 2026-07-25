import { useEffect, useState } from 'react'
import { fetchScore } from '../lib/api'

export default function ScoringView({ role, messages, onScored }) {
  const [error, setError] = useState(false)

  async function attempt() {
    setError(false)
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

  return (
    <section className="view" id="scoring-view">
      {!error && (
        <div className="scoring-loader">
          <div className="spinner" aria-hidden="true" />
          <p className="scoring-title">Evaluating your interview&hellip;</p>
          <p className="scoring-hint">Scoring your answers across every dimension — this takes a few seconds.</p>
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
