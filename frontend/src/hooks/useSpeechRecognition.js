import { useEffect, useRef, useState } from 'react'

const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition

// Wraps the Web Speech API's SpeechRecognition. onResult receives the full
// transcript for the current listening session (accumulated final results plus
// the live interim), so the caller can populate an editable field — recognized
// speech never auto-sends. The mic stays on through short pauses (continuous
// mode + auto-restart on end) until stop() is called.
export function useSpeechRecognition({ onResult, onError }) {
  const supported = !!RecognitionCtor
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)
  onResultRef.current = onResult
  onErrorRef.current = onError

  // Final transcript accumulated across the current session — survives the
  // auto-restarts we do to keep the mic alive through pauses.
  const finalRef = useRef('')
  // Whether the user still intends to be listening (drives auto-restart).
  const wantRef = useRef(false)

  useEffect(() => {
    if (!supported) return
    const recognition = new RecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.addEventListener('result', (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript
        if (e.results[i].isFinal) finalRef.current += transcript
        else interim += transcript
      }
      onResultRef.current?.((finalRef.current + interim).trim())
    })

    recognition.addEventListener('error', (e) => {
      // A brief silence or an auto-restart abort is transient — let the 'end'
      // handler restart, and don't surface it to the user as an error.
      if (e.error === 'no-speech' || e.error === 'aborted') return
      wantRef.current = false
      setListening(false)
      onErrorRef.current?.(e.error)
    })

    recognition.addEventListener('end', () => {
      // The API ends the session on longer pauses even in continuous mode;
      // restart while the user still wants to listen so the mic doesn't die
      // mid-answer. finalRef is NOT reset here, so text accumulates across it.
      if (wantRef.current) {
        try {
          recognition.start()
        } catch {
          wantRef.current = false
          setListening(false)
        }
      } else {
        setListening(false)
      }
    })

    recognitionRef.current = recognition
    return () => {
      wantRef.current = false
      recognition.abort?.()
      recognitionRef.current = null
    }
  }, [supported])

  const start = () => {
    if (!recognitionRef.current) return
    finalRef.current = '' // fresh session
    wantRef.current = true
    try {
      recognitionRef.current.start()
      setListening(true)
    } catch {
      wantRef.current = false
      onErrorRef.current?.('start-failed')
    }
  }

  const stop = () => {
    wantRef.current = false
    if (recognitionRef.current) recognitionRef.current.stop()
    setListening(false)
  }

  return { supported, listening, start, stop }
}
