import { useEffect, useState } from 'react'
import { useUi } from '../context/UiContext'
import { buildReportText, downloadTextFile } from '../lib/report'
import { exportMarkdown } from '../lib/api'
import RadarChart from '../components/RadarChart'

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

export default function ScorecardView({
  scorecard,
  prevScorecard,
  role,
  difficulty,
  messages = [],
  isBookmarked,
  onToggleBookmark,
  onRetake,
}) {
  const { toast } = useUi()
  const [animate, setAnimate] = useState(false)
  const [exporting, setExporting] = useState(false)

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
  const metrics = data.transcript_metrics || null

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

  async function handleDownloadMarkdown() {
    if (exporting) return
    setExporting(true)
    try {
      const res = await exportMarkdown({ role, difficulty, scorecard: data, messages })
      const md = res?.markdown || buildReportText(data, role, difficulty)
      downloadTextFile(`prepcoach-${role || 'interview'}-scorecard.md`, md, 'text/markdown;charset=utf-8')
      toast('Study guide downloaded (.md)')
    } catch {
      const fallback = buildReportText(data, role, difficulty)
      downloadTextFile(`prepcoach-${role || 'interview'}-scorecard.txt`, fallback)
      toast('Report downloaded (.txt)')
    } finally {
      setExporting(false)
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

          {(data.strongest_dimension || data.weakest_dimension) && (
            <div className="scorecard-extremes">
              {data.strongest_dimension && (
                <span className="extreme-pill extreme-strong">
                  ★ Top: {data.strongest_dimension}
                </span>
              )}
              {data.weakest_dimension && (
                <span className="extreme-pill extreme-weak">
                  🎯 Focus: {data.weakest_dimension}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="scorecard-section">
          <h2>Breakdown</h2>
          <div className="breakdown-layout">
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
            {dims.length >= 3 && (
              <RadarChart
                dimensions={dims}
                prevDimensions={prevScorecard?.dimensions}
              />
            )}
          </div>
        </div>

        {metrics && metrics.answer_count > 0 && (
          <div className="scorecard-section">
            <h2>Communication Analytics</h2>
            <div className="comm-metrics-grid">
              <div className="comm-metric-box">
                <span className="comm-metric-val">{metrics.avg_words_per_answer}</span>
                <span className="comm-metric-lbl">Avg Words / Answer</span>
              </div>
              <div className="comm-metric-box">
                <span className="comm-metric-val">
                  {metrics.quantified_answers}/{metrics.answer_count}
                </span>
                <span className="comm-metric-lbl">Quantified Answers</span>
              </div>
              <div className="comm-metric-box">
                <span className="comm-metric-val">
                  {metrics.structured_answers}/{metrics.answer_count}
                </span>
                <span className="comm-metric-lbl">Structured Trade-offs</span>
              </div>
              <div className="comm-metric-box">
                <span className="comm-metric-val">{metrics.filler_count}</span>
                <span className="comm-metric-lbl">Filler Words</span>
              </div>
            </div>
          </div>
        )}

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
            {idealAnswers.map((qa, i) => {
              const saved = isBookmarked?.(qa.question)
              return (
                <details className="ideal-answer-item" key={i}>
                  <summary>
                    <span className="ideal-summary-text">Q{i + 1}: {qa.question || ''}</span>
                    {onToggleBookmark && (
                      <button
                        type="button"
                        className={`bookmark-btn bookmark-btn-inline${saved ? ' active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onToggleBookmark({
                            role,
                            topic: 'Interview Question',
                            question: qa.question,
                            ideal: qa.ideal,
                          })
                          toast(saved ? 'Removed from bookmarks' : 'Saved question & ideal answer')
                        }}
                      >
                        {saved ? '★ Saved' : '☆ Save'}
                      </button>
                    )}
                  </summary>
                  <div className="ideal-body">{qa.ideal || ''}</div>
                </details>
              )
            })}
          </div>
        </div>

        <div className="scorecard-actions">
          <button type="button" className="btn btn-secondary" onClick={handleCopyReport}>
            Copy report
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={exporting}
            onClick={handleDownloadMarkdown}
          >
            {exporting ? 'Exporting…' : 'Download Study Guide (.md)'}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onRetake(data)}>
            Retake interview
          </button>
        </div>
      </div>
    </section>
  )
}
