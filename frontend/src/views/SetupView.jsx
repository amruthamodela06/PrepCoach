const RESUME_LIMIT = 4000

const ROLES = [
  {
    id: 'swe',
    name: 'Software Engineer',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m9 18-6-6 6-6m6 12 6-6-6-6" />
      </svg>
    ),
  },
  {
    id: 'data',
    name: 'Data Science',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 20V10m7 10V4m7 16v-7" />
      </svg>
    ),
  },
  {
    id: 'pm',
    name: 'Product Manager',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
        <path fill="currentColor" d="m14.5 9.5-6 2.5 6 2.5 2.5-6-2.5 1Z" />
      </svg>
    ),
  },
]

const DIFFICULTIES = ['easy', 'medium', 'hard']

export default function SetupView({
  role,
  difficulty,
  resume,
  voiceMode,
  voiceSupported,
  onSelectRole,
  onSelectDifficulty,
  onResumeChange,
  onVoiceToggle,
  onStart,
}) {
  const resumeLen = resume.length
  const resumeTooLong = resumeLen >= RESUME_LIMIT
  const startDisabled = !role || resumeTooLong

  return (
    <section className="view" id="setup-view">
      <div className="setup-card">
        <h1>Set up your interview</h1>
        <p className="tagline">Choose a role and difficulty. Everything else is optional.</p>

        <div className="field-group">
          <label className="field-label">Role</label>
          <div className="role-cards" id="role-cards">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                data-role={r.id}
                className={`role-card${role === r.id ? ' active' : ''}`}
                aria-pressed={role === r.id}
                onClick={() => onSelectRole(r.id)}
              >
                <span className="role-icon" aria-hidden="true">{r.icon}</span>
                <span className="role-name">{r.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="field-group">
          <label className="field-label" id="difficulty-label">Difficulty</label>
          <div className="segmented" role="radiogroup" aria-labelledby="difficulty-label">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                data-difficulty={d}
                className={`segment${difficulty === d ? ' active' : ''}`}
                aria-pressed={difficulty === d}
                onClick={() => onSelectDifficulty(d)}
              >
                {d[0].toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <details className="field-group resume-details">
          <summary>Personalize with your resume <span className="optional-tag">optional</span></summary>
          <textarea
            id="resume-input"
            placeholder="Paste your resume text here — the interviewer will ask about your actual projects and experience. Completely optional; leave blank for a generic interview."
            maxLength={RESUME_LIMIT}
            value={resume}
            onChange={(e) => onResumeChange(e.target.value)}
          />
          <div className="resume-meta">
            <span className="resume-count">{resumeLen} / {RESUME_LIMIT}</span>
            <span className={`field-error${resumeTooLong ? '' : ' hidden'}`}>
              That's too long — trim your resume to 4000 characters to continue.
            </span>
          </div>
        </details>

        {voiceSupported && (
          <div className="field-group voice-toggle-group">
            <label className="switch-row">
              <span className="switch">
                <input
                  type="checkbox"
                  checked={voiceMode}
                  onChange={(e) => onVoiceToggle(e.target.checked)}
                />
                <span className="switch-slider" />
              </span>
              <span>Enable voice mode</span>
            </label>
            {voiceMode && (
              <p className="voice-note">
                The interviewer will speak questions aloud, and you can answer by voice.
              </p>
            )}
          </div>
        )}

        <button type="button" className="btn btn-primary btn-large" disabled={startDisabled} onClick={onStart}>
          Start Interview
        </button>
      </div>
    </section>
  )
}
