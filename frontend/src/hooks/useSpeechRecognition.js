import { useEffect, useRef, useState } from 'react'

const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition

// Wraps the Web Speech API's SpeechRecognition. onResult receives the live
// (interim-or-final) transcript so the caller can populate an editable text
// field, matching the "review before sending" requirement — recognized
// speech never auto-sends.
export function useSpeechRecognition({ onResult, onError }) {
  const supported = !!RecognitionCtor
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)
  onResultRef.current = onResult
  onErrorRef.current = onError

  useEffect(() => {
    if (!supported) return
    const recognition = new RecognitionCtor()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.addEventListener('result', (e) => {
      let finalText = ''
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += transcript
        else interim += transcript
      }
      onResultRef.current?.(finalText || interim)
    })

    recognition.addEventListener('error', (e) => {
      setListening(false)
      onErrorRef.current?.(e.error)
    })

    recognition.addEventListener('end', () => setListening(false))

    recognitionRef.current = recognition
    return () => {
      recognition.abort?.()
      recognitionRef.current = null
    }
  }, [supported])

  const start = () => {
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.start()
      setListening(true)
    } catch {
      onErrorRef.current?.('start-failed')
    }
  }

  const stop = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop()
      setListening(false)
    }
  }

  return { supported, listening, start, stop }
}
