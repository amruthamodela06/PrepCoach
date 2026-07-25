import { useState } from 'react'
import { UiProvider } from './context/UiContext'
import { useTheme } from './hooks/useTheme'
import ThemeToggle from './components/ThemeToggle'
import BrandMark from './components/BrandMark'
import LandingView from './views/LandingView'
import SetupView from './views/SetupView'
import InterviewView from './views/InterviewView'
import ScoringView from './views/ScoringView'
import ScorecardView from './views/ScorecardView'

const voiceSupported =
  !!(window.SpeechRecognition || window.webkitSpeechRecognition) && 'speechSynthesis' in window

function AppShell() {
  const { toggleTheme } = useTheme()

  const [view, setView] = useState('landing')
  const [role, setRole] = useState(null)
  const [difficulty, setDifficulty] = useState('medium')
  const [resume, setResume] = useState('')
  const [voiceMode, setVoiceMode] = useState(false)
  const [messages, setMessages] = useState([])
  const [scorecard, setScorecard] = useState(null)
  const [prevScorecard, setPrevScorecard] = useState(null)
  const [interviewKey, setInterviewKey] = useState(0)

  function goToSetup() {
    setInterviewKey((k) => k + 1)
    setView('setup')
  }

  return (
    <main id="app">
      <BrandMark />
      <ThemeToggle onToggle={toggleTheme} />

      {view === 'landing' && <LandingView onStart={() => setView('setup')} />}

      {view === 'setup' && (
        <SetupView
          role={role}
          difficulty={difficulty}
          resume={resume}
          voiceMode={voiceMode}
          voiceSupported={voiceSupported}
          onSelectRole={setRole}
          onSelectDifficulty={setDifficulty}
          onResumeChange={setResume}
          onVoiceToggle={setVoiceMode}
          onStart={() => setView('interview')}
        />
      )}

      {view === 'interview' && (
        <InterviewView
          key={interviewKey}
          role={role}
          difficulty={difficulty}
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
