import { useEffect, useRef, useState } from 'react'
import { streamChat } from '../lib/api'
import { splitAssistantMessage, bulletsFromBlock, stripMarkdownForSpeech } from '../lib/feedback'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { useUi } from '../context/UiContext'
import { ROLE_LABELS } from '../lib/report'

const TOTAL_QUESTIONS = 5

function nextAssistantIndex(messages) {
  return messages.filter((m) => m.role === 'assistant').length + 1
}

function questionNumberFor(assistantIndex) {
  return Math.min(TOTAL_QUESTIONS, Math.ceil(assistantIndex / 2))
}

export default function InterviewView({ role, difficulty, resume, voiceMode, onComplete, onNewInterview }) {
  const { toast, confirm } = useUi()

  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [waitingForFirstToken, setWaitingForFirstToken] = useState(false)
  const [streamingText, setStreamingText] = useState(null)
  const [streamError, setStreamError] = useState(false)

  const transcriptRef = useRef(null)
  const textareaRef = useRef(null)
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  // Text already in the box when the current voice session started, so a new
  // session appends to (rather than replaces) prior voice/typed text.
  const baseTextRef = useRef('')

  const recognition = useSpeechRecognition({
    onResult: (text) => {
      const base = baseTextRef.current
      setInputValue(base ? `${base} ${text}`.trim() : text)
    },
    onError: (err) => {
      if (err === 'not-allowed' || err === 'permission-denied' || err === 'service-not-allowed') {
        toast('Mic blocked — allow microphone access, or type your answer')
      } else if (err === 'audio-capture') {
        toast('No microphone found — type your answer instead')
      } else if (err === 'unstable') {
        toast('Voice recognition keeps dropping — type your answer instead')
      } else {
        toast('Voice input error — type your answer instead')
      }
    },
  })
  const synth = useSpeechSynthesis()

  const streaming = waitingForFirstToken || streamingText !== null
  const inputEnabled = !streaming

  useEffect(() => {
    const t = transcriptRef.current
    if (t) t.scrollTop = t.scrollHeight
  }, [messages, streamingText, waitingForFirstToken, streamError])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
  }, [inputValue])

  async function runAssistantTurn(currentMessages) {
    setStreamError(false)
    setWaitingForFirstToken(true)
    setStreamingText(null)

    let firstToken = true
    try {
      const full = await streamChat({
        role,
        difficulty,
        resume,
        messages: currentMessages,
        onToken: (accumulated) => {
          if (firstToken) {
            setWaitingForFirstToken(false)
            firstToken = false
          }
          setStreamingText(accumulated)
        },
      })

      const updated = [...currentMessages, { role: 'assistant', content: full }]
      setMessages(updated)
      setStreamingText(null)
      setWaitingForFirstToken(false)

      if (voiceMode) synth.speak(stripMarkdownForSpeech(full))

      if (nextAssistantIndex(updated) > TOTAL_QUESTIONS * 2 + 1) {
        synth.stop()
        if (recognition.listening) recognition.stop()
        onComplete(updated)
      }
    } catch {
      setWaitingForFirstToken(false)
      setStreamingText(null)
      setStreamError(true)
    }
  }

  // Kick off the interview once on mount: seed the stateless backend with an
  // opening user turn that is never rendered as a bubble.
  useEffect(() => {
    const kickoff = [{ role: 'user', content: "I'm ready — let's begin the interview." }]
    setMessages(kickoff)
    runAssistantTurn(kickoff)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function submitAnswer(text) {
    if (!text.trim() || streaming) return
    if (recognition.listening) recognition.stop()
    baseTextRef.current = ''
    setInputValue('')
    const updated = [...messagesRef.current, { role: 'user', content: text }]
    setMessages(updated)
    runAssistantTurn(updated)
  }

  function retry() {
    setStreamError(false)
    runAssistantTurn(messagesRef.current)
  }

  async function handleNewInterview() {
    const ok = await confirm('Start a new interview? Your current progress will be lost.')
    if (ok) {
      synth.stop()
      if (recognition.listening) recognition.stop()
      onNewInterview()
    }
  }

  const questionNumber = questionNumberFor(nextAssistantIndex(messages))
  const renderableMessages = messages.slice(1) // skip the hidden kickoff turn

  return (
    <section className="view" id="interview-view">
      <header className="interview-header">
        <div className="header-badges">
          <span className="badge">{ROLE_LABELS[role]}</span>
          <span className="badge badge-outline">{difficulty[0].toUpperCase() + difficulty.slice(1)}</span>
        </div>
        <div className="question-counter">Question {questionNumber} of {TOTAL_QUESTIONS}</div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleNewInterview}>New Interview</button>
      </header>

      <div className="transcript" ref={transcriptRef} aria-live="polite">
        {renderableMessages.map((m, i) =>
          m.role === 'user' ? (
            <div className="msg-row user" key={i}>
              <div className="bubble">{m.content}</div>
            </div>
          ) : (
            <AssistantTurn key={i} text={m.content} />
          )
        )}

        {waitingForFirstToken && (
          <div className="msg-row assistant">
            <div className="typing-indicator"><span /><span /><span /></div>
          </div>
        )}

        {streamingText !== null && (
          <div className="msg-row assistant">
            <div className="bubble">{streamingText}</div>
          </div>
        )}

        {streamError && (
          <div className="msg-row assistant">
            <div>
              <div className="retry-inline">
                connection interrupted
                <button type="button" onClick={retry}>Retry</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        className="input-bar"
        onSubmit={(e) => {
          e.preventDefault()
          submitAnswer(inputValue)
        }}
      >
        <textarea
          ref={textareaRef}
          className="answer-input"
          rows={1}
          placeholder="Type your answer…"
          aria-label="Your answer"
          disabled={!inputEnabled}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submitAnswer(inputValue)
            }
          }}
        />
        {recognition.supported && (
          <button
            type="button"
            className={`icon-btn${recognition.listening ? ' listening' : ''}`}
            aria-pressed={recognition.listening}
            title="Answer by voice"
            disabled={!inputEnabled}
            onClick={() => {
              if (recognition.listening) {
                recognition.stop()
              } else {
                baseTextRef.current = inputValue.trim()
                recognition.start()
              }
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z" /></svg>
          </button>
        )}
        {synth.speaking && (
          <button type="button" className="icon-btn" title="Stop interviewer speaking" onClick={synth.stop}>
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M6 6h12v12H6z" /></svg>
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={!inputEnabled}>Send</button>
      </form>
    </section>
  )
}

function AssistantTurn({ text }) {
  const blocks = splitAssistantMessage(text)
  return (
    <>
      {blocks.map((block, i) =>
        block.type === 'text' ? (
          <div className="msg-row assistant" key={i}>
            <div className="bubble">{block.text}</div>
          </div>
        ) : (
          <div className="feedback-card" key={i}>
            <h4>Strengths</h4>
            <ul>{bulletsFromBlock(block.strengths).map((b, j) => <li key={j}>{b}</li>)}</ul>
            <h4>Gaps</h4>
            <ul>{bulletsFromBlock(block.gaps).map((b, j) => <li key={j}>{b}</li>)}</ul>
            <h4>Stronger answer</h4>
            <p>{block.strongerAnswer}</p>
          </div>
        )
      )}
    </>
  )
}
