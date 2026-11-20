import { useEffect, useState } from 'react'
import { fetchQuestions, rewriteAnswer } from '../lib/api'
import { ROLE_LABELS } from '../lib/report'
import { analyzeDraftAnswer } from '../lib/feedback'
import { useUi } from '../context/UiContext'

const FALLBACK_QUESTIONS = [
  {
    id: 'swe-m1',
    topic: 'System Design',
    difficulty: 'medium',
    question: 'Design a rate limiter for a multi-instance API gateway handling 50,000 requests per second. Which algorithm and backing store would you pick?',
    key_points: ['Token bucket vs sliding window counter', 'Redis atomic Lua scripts and race conditions', 'Fail-open vs fail-closed trade-offs'],
  },
  {
    id: 'swe-m2',
    topic: 'APIs & Databases',
    difficulty: 'medium',
    question: 'An orders table with 100M rows has slow pagination using OFFSET/LIMIT. Why does it degrade and how do you redesign it?',
    key_points: ['Full index scan cost of large OFFSET', 'Cursor/keyset pagination on indexed monotonic columns', 'Handling concurrent inserts'],
  },
]

const ROLE_IDS = ['swe', 'data', 'pm', 'devops', 'security']
const DIFFICULTIES = ['', 'easy', 'medium', 'hard']

export default function PracticeBankView({
  initialRole = 'swe',
  isBookmarked,
  onToggleBookmark,
  onStartInterviewWithTopic,
}) {
  const { toast } = useUi()
  const [role, setRole] = useState(initialRole || 'swe')
  const [difficulty, setDifficulty] = useState('')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeDraftId, setActiveDraftId] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [polishingId, setPolishingId] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchQuestions({ role, difficulty })
      .then((res) => {
        if (!cancelled) {
          setQuestions(Array.isArray(res.questions) ? res.questions : FALLBACK_QUESTIONS)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuestions(FALLBACK_QUESTIONS)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [role, difficulty])

  async function handlePolish(q) {
    const draft = (drafts[q.id] || '').trim()
    if (draft.length < 15) {
      toast('Write at least a few words before polishing')
      return
    }
    setPolishingId(q.id)
    try {
      const res = await rewriteAnswer({ role, question: q.question, draft })
      if (res?.rewritten) {
        setDrafts((prev) => ({ ...prev, [q.id]: res.rewritten }))
        toast('Answer refined with AI Coach')
      }
    } catch {
      toast('Could not refine answer right now')
    } finally {
      setPolishingId(null)
    }
  }

  return (
    <section className="view" id="practice-view">
      <div className="practice-container">
        <header className="practice-header">
          <div>
            <h1>Curated Question Bank</h1>
            <p className="tagline">
              Browse high-signal questions by role, review rubric talking points, and practice structuring your answers.
            </p>
          </div>
        </header>

        <div className="practice-filters">
          <div className="filter-pills" role="group" aria-label="Filter by role">
            {ROLE_IDS.map((r) => (
              <button
                key={r}
                type="button"
                className={`filter-pill${role === r ? ' active' : ''}`}
                onClick={() => setRole(r)}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>

          <div className="filter-pills" role="group" aria-label="Filter by difficulty">
            {DIFFICULTIES.map((d) => (
              <button
                key={d || 'all'}
                type="button"
                className={`filter-pill filter-pill-sm${difficulty === d ? ' active' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                {d ? d[0].toUpperCase() + d.slice(1) : 'All Tiers'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="practice-empty">Loading curated questions…</div>
        ) : (
          <div className="practice-list">
            {questions.map((q) => {
              const saved = isBookmarked?.(q.question)
              const draftText = drafts[q.id] || ''
              const metrics = analyzeDraftAnswer(draftText)
              const isDraftOpen = activeDraftId === q.id

              return (
                <article className="practice-card" key={q.id}>
                  <div className="practice-card-top">
                    <div className="header-badges">
                      <span className="badge">{q.topic}</span>
                      {(q.difficulty || difficulty) && (
                        <span className="badge badge-outline">
                          {(q.difficulty || difficulty).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`bookmark-btn${saved ? ' active' : ''}`}
                      onClick={() => {
                        onToggleBookmark?.({
                          role,
                          topic: q.topic,
                          question: q.question,
                          ideal: Array.isArray(q.key_points) ? q.key_points.join(' • ') : '',
                        })
                        toast(saved ? 'Removed from saved questions' : 'Saved to bookmarks')
                      }}
                      title={saved ? 'Remove bookmark' : 'Save question'}
                    >
                      {saved ? '★ Saved' : '☆ Save'}
                    </button>
                  </div>

                  <h3 className="practice-question">{q.question}</h3>

                  {Array.isArray(q.key_points) && q.key_points.length > 0 && (
                    <details className="practice-keypoints">
                      <summary>Key rubric talking points ({q.key_points.length})</summary>
                      <ul>
                        {q.key_points.map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </details>
                  )}

                  <div className="practice-card-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setActiveDraftId(isDraftOpen ? null : q.id)}
                    >
                      {isDraftOpen ? 'Hide Scratchpad' : 'Practice Draft Answer'}
                    </button>
                    {onStartInterviewWithTopic && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onStartInterviewWithTopic(role, q.topic)}
                      >
                        Mock Interview on {q.topic} &rarr;
                      </button>
                    )}
                  </div>

                  {isDraftOpen && (
                    <div className="practice-scratchpad">
                      <textarea
                        rows={4}
                        placeholder="Draft your response here — aim for clear trade-offs and concrete metrics…"
                        value={draftText}
                        onChange={(e) =>
                          setDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                      />
                      <div className="practice-scratchpad-footer">
                        <div className="draft-coach-badges">
                          <span className="coach-chip">
                            {metrics.wordCount} words (~{metrics.speakingSeconds}s)
                          </span>
                          {metrics.hasMetrics && <span className="coach-chip good">+Quantified</span>}
                          {metrics.hasStructure && <span className="coach-chip good">+Structured</span>}
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={polishingId === q.id || metrics.wordCount < 4}
                          onClick={() => handlePolish(q)}
                        >
                          {polishingId === q.id ? 'Refining…' : '✨ Polish with AI Coach'}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
