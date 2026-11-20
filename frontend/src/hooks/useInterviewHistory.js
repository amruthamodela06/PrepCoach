import { useCallback, useMemo, useState } from 'react'
import { clearHistoryStorage, loadHistory, saveHistoryEntry } from '../lib/storage'

export function useInterviewHistory() {
  const [history, setHistory] = useState(() => loadHistory())

  const recordSession = useCallback((payload) => {
    const updated = saveHistoryEntry(payload)
    setHistory(updated)
    return updated
  }, [])

  const clearHistory = useCallback(() => {
    const empty = clearHistoryStorage()
    setHistory(empty)
  }, [])

  const stats = useMemo(() => {
    if (!history.length) {
      return { totalSessions: 0, averageScore: null, bestScore: null, latestDelta: null }
    }
    const scores = history
      .map((h) => h.overall_score)
      .filter((s) => typeof s === 'number')
    const totalSessions = history.length
    const averageScore = scores.length
      ? Math.round(scores.reduce((acc, s) => acc + s, 0) / scores.length)
      : null
    const bestScore = scores.length ? Math.max(...scores) : null
    const latestDelta =
      scores.length >= 2 ? scores[0] - scores[1] : null
    return { totalSessions, averageScore, bestScore, latestDelta }
  }, [history])

  return { history, stats, recordSession, clearHistory }
}
