const FEATURES = [
  {
    step: '01',
    title: 'Role, Resume & JD Tailoring',
    desc: 'Choose SWE, Data Science, PM, DevOps/SRE, or Security — optionally paste your resume and target job context.',
  },
  {
    step: '02',
    title: 'Real Probing Follow-Ups',
    desc: 'No generic praise. The interviewer drills into your trade-offs, edge cases, and personal ownership.',
  },
  {
    step: '03',
    title: 'Calibrated 4-Axis Scorecard',
    desc: 'Get anti-inflated dimension scores, communication analytics, model answers, and a downloadable study guide.',
  },
]

export default function LandingView({ onStart, onOpenPractice, onOpenHistory, stats }) {
  return (
    <section className="view" id="landing-view">
      <div className="landing-hero-wrap">
        <div className="landing-hero">
          <span className="landing-badge">
            <span className="landing-badge-dot" aria-hidden="true" />
            AI-POWERED INTERVIEW PREP
          </span>

          <h1 className="landing-headline">
            Stop rehearsing.<br />
            <span className="landing-headline-accent">Start performing.</span>
          </h1>

          <p className="landing-tagline">
            Run a mock interview, get live feedback on every answer, and finish with a scored report and improvement plan.
          </p>

          <div className="landing-actions">
            <button type="button" className="landing-btn-primary" onClick={onStart}>
              Begin your session <span aria-hidden="true">&rarr;</span>
            </button>
            {onOpenPractice && (
              <button type="button" className="btn btn-ghost landing-btn-secondary" onClick={onOpenPractice}>
                Browse Question Bank
              </button>
            )}
          </div>

          {stats?.totalSessions > 0 && (
            <div className="landing-progress-pill" onClick={onOpenHistory} role="button" tabIndex={0}>
              <span>
                <strong>{stats.totalSessions}</strong> session{stats.totalSessions > 1 ? 's' : ''} completed
              </span>
              <span>•</span>
              <span>Avg: <strong>{stats.averageScore}/100</strong></span>
              <span>•</span>
              <span>Best: <strong>{stats.bestScore}/100</strong></span>
              <span className="landing-progress-link">View history &rarr;</span>
            </div>
          )}

          <div className="landing-features-grid">
            {FEATURES.map((f) => (
              <div className="landing-feature-card" key={f.step}>
                <span className="landing-feature-step">{f.step}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
