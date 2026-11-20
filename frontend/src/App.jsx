import { useEffect, useState } from 'react'
import { UiProvider } from './context/UiContext'
import { useTheme } from './hooks/useTheme'
import { useInterviewHistory } from './hooks/useInterviewHistory'
import { useBookmarks } from './hooks/useBookmarks'
import { fetchHealth } from './lib/api'
import { loadPrefs, savePrefs } from './lib/storage'
import ThemeToggle from './components/ThemeToggle'
import BrandMark from './components/BrandMark'
import TopNavActions from './components/TopNavActions'
import LandingView from './views/LandingView'
import SetupView from './views/SetupView'
import InterviewView from './views/InterviewView'
import ScoringView from './views/ScoringView'
import ScorecardView from './views/ScorecardView'
import PracticeBankView from './views/PracticeBankView'
import HistoryView from './views/HistoryView'

const voiceSupported =
  !!(window.SpeechRecognition || window.webkitSpeechRecognition) && 'speechSynthesis' in window

function AppShell() {
  const { toggleTheme } = useTheme()
  const { history, stats, recordSession, clearHistory } = useInterviewHistory()
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks()

  const [view, setView] = useState('landing')
  const [role, setRole] = useState(() => loadPrefs().role || null)
  const [difficulty, setDifficulty] = useState(() => loadPrefs().difficulty || 'medium')
  const [style, setStyle] = useState(() => loadPrefs().style || 'standard')
  const [focusTopics, setFocusTopics] = useState([])
  const [companyContext, setCompanyContext] = useState('')
  const [resume, setResume] = useState('')
  const [voiceMode, setVoiceMode] = useState(() => !!loadPrefs().voiceMode)
  const [messages, setMessages] = useState([])
  const [scorecard, setScorecard] = useState(null)
  const [prevScorecard, setPrevScorecard] = useState(null)
  const [interviewKey, setInterviewKey] = useState(0)
  const [providerInfo, setProviderInfo] = useState(null)

  useEffect(() => {
    fetchHealth()
      .then((info) => setProviderInfo(info))
      .catch(() => {})
  }, [])

  useEffect(() => {
    savePrefs({ role, difficulty, style, voiceMode })
  }, [role, difficulty, style, voiceMode])

  function handleSelectRole(nextRole) {
    setRole(nextRole)
    setFocusTopics([])
  }

  function handleToggleFocusTopic(topic) {
    setFocusTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  function goToSetup() {
    setInterviewKey((k) => k + 1)
    setView('setup')
  }

  return (
    <main id="app">
      <BrandMark
        onHome={view !== 'interview' && view !== 'scoring' ? () => setView('landing') : undefined}
        providerInfo={providerInfo}
      />
      <TopNavActions
        currentView={view}
        historyCount={history.length}
        bookmarkCount={bookmarks.length}
        onOpenPractice={() => setView('practice')}
        onOpenHistory={() => setView('history')}
        onGoSetup={goToSetup}
      />
      <ThemeToggle onToggle={toggleTheme} />

      {view === 'landing' && (
        <LandingView
          onStart={() => setView('setup')}
          onOpenPractice={() => setView('practice')}
          onOpenHistory={() => setView('history')}
          stats={stats}
        />
      )}

      {view === 'setup' && (
        <SetupView
          role={role}
          difficulty={difficulty}
          style={style}
          focusTopics={focusTopics}
          companyContext={companyContext}
          resume={resume}
          voiceMode={voiceMode}
          voiceSupported={voiceSupported}
          onSelectRole={handleSelectRole}
          onSelectDifficulty={setDifficulty}
          onSelectStyle={setStyle}
          onToggleFocusTopic={handleToggleFocusTopic}
          onCompanyContextChange={setCompanyContext}
          onResumeChange={setResume}
          onVoiceToggle={setVoiceMode}
          onStart={() => setView('interview')}
        />
      )}

      {view === 'practice' && (
        <PracticeBankView
          initialRole={role || 'swe'}
          isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark}
          onStartInterviewWithTopic={(selectedRole, topic) => {
            setRole(selectedRole)
            setFocusTopics([topic])
            goToSetup()
          }}
        />
      )}

      {view === 'history' && (
        <HistoryView
          history={history}
          stats={stats}
          bookmarks={bookmarks}
          onSelectSession={(sessionItem) => {
            setRole(sessionItem.role)
            setDifficulty(sessionItem.difficulty || 'medium')
            setScorecard(sessionItem)
            setView('scorecard')
          }}
          onClearHistory={clearHistory}
          onToggleBookmark={toggleBookmark}
          onStartNew={goToSetup}
        />
      )}

      {view === 'interview' && (
        <InterviewView
          key={interviewKey}
          role={role}
          difficulty={difficulty}
          style={style}
          focusTopics={focusTopics}
          companyContext={companyContext}
          resume={resume}
          voiceMode={voiceMode}
          onComplete={(finalMessages) => {
            setMessages(finalMessages)
            setView('scoring')
          }}
          onNewInterview={goToSetup}
        />
      )}

      {view === 'scoring' && (
        <ScoringView
          role={role}
          messages={messages}
          onScored={(data) => {
            setScorecard(data)
            recordSession({ role, difficulty, style, scorecard: data })
            setView('scorecard')
          }}
        />
      )}

      {view === 'scorecard' && (
        <ScorecardView
          scorecard={scorecard}
          prevScorecard={prevScorecard}
          role={role}
          difficulty={difficulty}
          messages={messages}
          isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark}
          onRetake={(data) => {
            setPrevScorecard(data)
            goToSetup()
          }}
        />
      )}
    </main>
  )
}

export default function App() {
  return (
    <UiProvider>
      <AppShell />
    </UiProvider>
  )
}
