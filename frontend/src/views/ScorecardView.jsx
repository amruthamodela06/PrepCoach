import { useEffect, useState } from 'react'
import { useUi } from '../context/UiContext'
import { buildReportText } from '../lib/report'

const BAND_CLASS = {
  'Needs Work': 'band-needs-work',
  'Fair': 'band-fair',
  'Strong': 'band-strong',
  'Excellent': 'band-excellent',
}

const CIRCUMFERENCE = 2 * Math.PI * 60

function clampScore(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return null
  return Math.max(0, Math.min(100, Math.round(n)))
}

export default function ScorecardView({ scorecard, prevScorecard, role, difficulty, onRetake }) {
  const { toast } = useUi()
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const data = scorecard || {}
  const score = clampScore(data.overall_score)
  const band = data.band || null
  const dims = Array.isArray(data.dimensions) ? data.dimensions : []
  const improvements = Array.isArray(data.improvements) ? data.improvements : []
  const idealAnswers = Array.isArray(data.ideal_answers) ? data.ideal_answers : []

  const offset = animate
    ? (score === null ? CIRCUMFERENCE : CIRCUMFERENCE * (1 - score / 100))
    : CIRCUMFERENCE

  let deltaText = null
  let deltaCls = ''
  if (prevScorecard && typeof prevScorecard.overall_score === 'number' && score !== null) {
    const diff = score - prevScorecard.overall_score
    if (diff === 0) {
      deltaText = `Same as last attempt (${prevScorecard.overall_score})`
    } else {
      deltaCls = diff > 0 ? 'up' : 'down'
      deltaText = `${prevScorecard.overall_score} → ${score} (${diff > 0 ? '+' : ''}${diff} from last attempt)`
    }
  }

  async function handleCopyReport() {
    const text = buildReportText(data, role, difficulty)
    try {
      await navigator.clipboard.writeText(text)
      toast('Report copied to clipboard')
    } catch {
      toast('Could not copy — select and copy manually')
    }
  }

  return (
    <section className="view" id="scorecard-view">
      <div className="scorecard">
        <div className="scorecard-hero">
          <div className="gauge-wrap">
            <svg viewBox="0 0 140 140" className="gauge">
              <circle cx="70" cy="70" r="60" className="gauge-track" />
              <circle
                cx="70" cy="70" r="60" className="gauge-fill"
                style={{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: offset }}
              />
            </svg>
            <div className="gauge-center">
              <span className="overall-score">{score === null ? '—' : score}</span>
              <span className="overall-score-max">/100</span>
            </div>
          </div>
          {band && <div className={`band-label ${BAND_CLASS[band] || ''}`}>{band}</div>}
          {deltaText && <div className={`score-delta ${deltaCls}`}>{deltaText}</div>}
        </div>

        <div className="scorecard-section">
          <h2>Breakdown</h2>
          <div className="dimensions-list">
            {dims.length === 0 && <p className="empty-note">No dimension breakdown available.</p>}
            {dims.map((d, i) => {
              const dscore = clampScore(d.score)
              const prevDim = prevScorecard && Array.isArray(prevScorecard.dimensions)
                ? prevScorecard.dimensions.find((p) => p.name === d.name)
                : null
              let ddelta = null
              let dcls = ''
              if (prevDim && typeof prevDim.score === 'number' && dscore !== null) {
                const diff = dscore - prevDim.score
                if (diff !== 0) {
                  dcls = diff > 0 ? 'up' : 'down'
                  ddelta = `${diff > 0 ? '+' : ''}${diff}`
                }
              }
              return (
                <div className="dimension-row" key={i}>
                  <div className="dimension-top">
                    <span>{d.name || 'Dimension'}</span>
                    <span>
                      {dscore === null ? '—' : dscore}
                      {ddelta && <span className={`dimension-delta ${dcls}`}>{ddelta}</span>}
                    </span>
                  </div>
                  <div className="dimension-bar-track">
                    <div className="dimension-bar-fill" style={{ width: animate ? `${dscore || 0}%` : '0%' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="scorecard-section">
          <h2>What to improve</h2>
          <div className="improvements-list">
            {improvements.length === 0 && <p className="empty-note">No specific improvements returned.</p>}
            {improvements.map((imp, i) => (
              <div className="improvement-card" key={i}>
                <div className="label">What</div>
                <div className="what">{imp.what || ''}</div>
                <div className="label">Where</div>
                <div className="where">{imp.where || ''}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="scorecard-section">
          <h2>Ideal answers</h2>
          <div className="ideal-answers-list">
            {idealAnswers.length === 0 && <p className="empty-note">No ideal answers returned.</p>}
            {idealAnswers.map((qa, i) => (
              <details className="ideal-answer-item" key={i}>
                <summary>Q{i + 1}: {qa.question || ''}</summary>
                <div className="ideal-body">{qa.ideal || ''}</div>
              </details>
            ))}
          </div>
        </div>

        <div className="scorecard-actions">
          <button type="button" className="btn btn-secondary" onClick={handleCopyReport}>Copy report</button>
          <button type="button" className="btn btn-primary" onClick={() => onRetake(data)}>Retake interview</button>
        </div>
      </div>
    </section>
  )
}
