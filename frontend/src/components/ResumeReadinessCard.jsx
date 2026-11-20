import { useState } from 'react'
import { analyzeResume } from '../lib/api'
import { useUi } from '../context/UiContext'

export default function ResumeReadinessCard({ role, resume }) {
  const { toast } = useUi()
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  const canAnalyze = (resume || '').trim().length >= 40 && !!role

  async function handleAnalyze() {
    if (!canAnalyze || loading) return
    setLoading(true)
    try {
      const data = await analyzeResume({ role, resume })
      setAnalysis(data)
    } catch {
      toast('Could not analyze resume right now — you can still start your interview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="resume-analyzer-wrap">
      <div className="resume-analyzer-bar">
        <span className="resume-analyzer-hint">
          Want to preview what the interviewer will probe on your resume?
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={!canAnalyze || loading}
          onClick={handleAnalyze}
        >
          {loading ? 'Analyzing…' : 'Analyze Resume Fit'}
        </button>
      </div>

      {analysis && (
        <div className="resume-analysis-card">
          <div className="resume-analysis-header">
            <strong>Resume Readiness</strong>
            {typeof analysis.readiness_score === 'number' && (
              <span className="badge">{analysis.readiness_score}/100</span>
            )}
          </div>

          {Array.isArray(analysis.strong_signals) && analysis.strong_signals.length > 0 && (
            <div className="resume-analysis-block">
              <h5>Strong Signals</h5>
              <ul>
                {analysis.strong_signals.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(analysis.probe_areas) && analysis.probe_areas.length > 0 && (
            <div className="resume-analysis-block">
              <h5>Likely Probe Areas</h5>
              <ul>
                {analysis.probe_areas.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(analysis.predicted_questions) && analysis.predicted_questions.length > 0 && (
            <div className="resume-analysis-block">
              <h5>Predicted Interview Questions</h5>
              <ul>
                {analysis.predicted_questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
