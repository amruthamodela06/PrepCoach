import { useState } from 'react'

const supported = 'speechSynthesis' in window

// Speaks on turn completion, not per-token, to avoid choppy audio. Never
// blocks text rendering — this is purely additive.
export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false)

  const speak = (text) => {
    if (!supported || !text) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 1
    utter.onstart = () => setSpeaking(true)
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utter)
  }

  const stop = () => {
    if (supported) window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  return { supported, speaking, speak, stop }
}
