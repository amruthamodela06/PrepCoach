export default function TopNavActions({
  currentView,
  historyCount = 0,
  bookmarkCount = 0,
  onOpenPractice,
  onOpenHistory,
  onGoSetup,
}) {
  if (currentView === 'interview' || currentView === 'scoring') return null

  return (
    <nav className="top-nav-actions" aria-label="Quick navigation">
      <button
        type="button"
        className={`top-nav-pill${currentView === 'practice' ? ' active' : ''}`}
        onClick={onOpenPractice}
      >
        Question Bank
      </button>
      <button
        type="button"
        className={`top-nav-pill${currentView === 'history' ? ' active' : ''}`}
        onClick={onOpenHistory}
      >
        History &amp; Saved
        {(historyCount > 0 || bookmarkCount > 0) && (
          <span className="top-nav-count">{historyCount + bookmarkCount}</span>
        )}
      </button>
      {currentView !== 'setup' && (
        <button
          type="button"
          className="top-nav-pill top-nav-cta"
          onClick={onGoSetup}
        >
          Mock Interview
        </button>
      )}
    </nav>
  )
}
