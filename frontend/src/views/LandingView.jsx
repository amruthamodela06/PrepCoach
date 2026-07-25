export default function LandingView({ onStart }) {
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
          </div>
        </div>
      </div>
    </section>
  )
}
