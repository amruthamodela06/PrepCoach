import { useState } from 'react'
import { ROLE_LABELS, STYLE_LABELS } from '../lib/report'
import { useUi } from '../context/UiContext'

const BAND_CLASS = {
  'Needs Work': 'band-needs-work',
  'Fair': 'band-fair',
  'Strong': 'band-strong',
  'Excellent': 'band-excellent',
}

export default function HistoryView({
  history = [],
  stats = {},
  bookmarks = [],
  onSelectSession,
  onClearHistory,
  onToggleBookmark,
  onStartNew,
}) {
  const { confirm, toast } = useUi()
  const [tab, setTab] = useState('sessions')

  async function handleClear() {
    const ok = await confirm('Clear all saved interview history from this browser?')
    if (ok) {
      onClearHistory?.()
      toast('Interview history cleared')
    }
  }

  return (
    <section className="view" id="history-view">
      <div className="practice-container">
        <header className="practice-header">
          <div>
            <h1>Progress &amp; Saved Items</h1>
            <p className="tagline">
              Track your score trajectory across mock sessions and review your bookmarked questions.
            </p>
          </div>
        </header>

        <div className="history-kpi-grid">
          <div className="history-kpi-card">
            <span className="kpi-label">Completed Sessions</span>
            <span className="kpi-value">{stats.totalSessions || 0}</span>
          </div>
          <div className="history-kpi-card">
            <span className="kpi-label">Average Score</span>
            <span className="kpi-value">{stats.averageScore ?? '—'}</span>
          </div>
          <div className="history-kpi-card">
            <span className="kpi-label">Personal Best</span>
            <span className="kpi-value">{stats.bestScore ?? '—'}</span>
          </div>
          <div className="history-kpi-card">
            <span className="kpi-label">Latest Delta</span>
            <span
              className={`kpi-value ${
                typeof stats.latestDelta === 'number'
                  ? stats.latestDelta > 0
                    ? 'kpi-up'
                    : stats.latestDelta < 0
                    ? 'kpi-down'
                    : ''
                  : ''
              }`}
            >
              {typeof stats.latestDelta === 'number'
                ? `${stats.latestDelta > 0 ? '+' : ''}${stats.latestDelta}`
                : '—'}
            </span>
          </div>
        </div>

        <div className="history-tabs">
          <button
            type="button"
            className={`filter-pill${tab === 'sessions' ? ' active' : ''}`}
            onClick={() => setTab('sessions')}
          >
            Past Scorecards ({history.length})
          </button>
          <button
            type="button"
            className={`filter-pill${tab === 'bookmarks' ? ' active' : ''}`}
            onClick={() => setTab('bookmarks')}
          >
            Saved Questions ({bookmarks.length})
          </button>
        </div>

        {tab === 'sessions' && (
          <div className="history-section">
            {history.length === 0 ? (
              <div className="practice-empty">
                <p>No completed interviews saved yet.</p>
                <button type="button" className="btn btn-primary" onClick={onStartNew}>
                  Start Your First Mock Interview
                </button>
              </div>
            ) : (
              <>
                <div className="history-list">
                  {history.map((item) => {
                    const dateStr = item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''
                    return (
                      <div className="history-item-card" key={item.id}>
                        <div className="history-item-main">
                          <div className="header-badges">
                            <span className="badge">{ROLE_LABELS[item.role] || item.role}</span>
                            <span className="badge badge-outline">
                              {(item.difficulty || 'medium').toUpperCase()}
                            </span>
                            {item.style && item.style !== 'standard' && (
                              <span className="badge badge-outline">
                                {STYLE_LABELS[item.style] || item.style}
                              </span>
                            )}
                          </div>
                          <span className="history-date">{dateStr}</span>
                        </div>

                        <div className="history-item-score-row">
                          <div className="history-score-big">
                            <strong>{item.overall_score}</strong>
                            <span>/100</span>
                            {item.band && (
                              <span className={`band-label band-label-sm ${BAND_CLASS[item.band] || ''}`}>
                                {item.band}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onSelectSession?.(item)}
                          >
                            View Scorecard &rarr;
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="history-footer-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleClear}>
                    Clear History
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'bookmarks' && (
          <div className="history-section">
            {bookmarks.length === 0 ? (
              <div className="practice-empty">
                <p>No questions or ideal answers bookmarked yet.</p>
                <p className="scoring-hint">
                  Star questions in the Question Bank or on your Scorecard to build your personal review deck.
                </p>
              </div>
            ) : (
              <div className="practice-list">
                {bookmarks.map((b, i) => (
                  <article className="practice-card" key={i}>
                    <div className="practice-card-top">
                      <div className="header-badges">
                        {b.role && <span className="badge">{ROLE_LABELS[b.role] || b.role}</span>}
                        {b.topic && <span className="badge badge-outline">{b.topic}</span>}
                      </div>
                      <button
                        type="button"
                        className="bookmark-btn active"
                        onClick={() => {
                          onToggleBookmark?.(b)
                          toast('Removed bookmark')
                        }}
                      >
                        ★ Remove
                      </button>
                    </div>
                    <h3 className="practice-question">{b.question}</h3>
                    {b.ideal && <p className="bookmark-ideal">{b.ideal}</p>}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
