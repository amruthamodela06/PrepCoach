import { useCallback, useEffect, useState } from 'react'

export function formatDuration(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function useTimer(active = true) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [turnSeconds, setTurnSeconds] = useState(0)

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1)
      setTurnSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [active])

  const resetTurn = useCallback(() => {
    setTurnSeconds(0)
  }, [])

  const resetAll = useCallback(() => {
    setElapsedSeconds(0)
    setTurnSeconds(0)
  }, [])

  return {
    elapsedSeconds,
    turnSeconds,
    formattedElapsed: formatDuration(elapsedSeconds),
    formattedTurn: formatDuration(turnSeconds),
    resetTurn,
    resetAll,
  }
}
