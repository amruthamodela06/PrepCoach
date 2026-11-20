const HISTORY_KEY = 'prepcoach-history'
const BOOKMARKS_KEY = 'prepcoach-bookmarks'
const PREFS_KEY = 'prepcoach-prefs'
const MAX_HISTORY = 25

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota or private browsing storage restrictions
  }
}

export function loadHistory() {
  const list = safeRead(HISTORY_KEY, [])
  return Array.isArray(list) ? list : []
}

export function saveHistoryEntry({ role, difficulty, style = 'standard', scorecard }) {
  if (!scorecard || typeof scorecard.overall_score !== 'number') return loadHistory()
  const current = loadHistory()
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    role,
    difficulty,
    style,
    overall_score: scorecard.overall_score,
    band: scorecard.band,
    strongest_dimension: scorecard.strongest_dimension || null,
    weakest_dimension: scorecard.weakest_dimension || null,
    dimensions: Array.isArray(scorecard.dimensions) ? scorecard.dimensions : [],
    improvements: Array.isArray(scorecard.improvements) ? scorecard.improvements : [],
    ideal_answers: Array.isArray(scorecard.ideal_answers) ? scorecard.ideal_answers : [],
    transcript_metrics: scorecard.transcript_metrics || null,
  }
  const updated = [entry, ...current].slice(0, MAX_HISTORY)
  safeWrite(HISTORY_KEY, updated)
  return updated
}

export function clearHistoryStorage() {
  safeWrite(HISTORY_KEY, [])
  return []
}

export function loadBookmarks() {
  const list = safeRead(BOOKMARKS_KEY, [])
  return Array.isArray(list) ? list : []
}

export function toggleBookmarkStorage(item) {
  const current = loadBookmarks()
  const key = item.question?.trim()
  if (!key) return current
  const exists = current.some((b) => b.question === key)
  const updated = exists
    ? current.filter((b) => b.question !== key)
    : [{ ...item, savedAt: new Date().toISOString() }, ...current]
  safeWrite(BOOKMARKS_KEY, updated)
  return updated
}

export function loadPrefs() {
  return safeRead(PREFS_KEY, {})
}

export function savePrefs(partial) {
  const current = loadPrefs()
  const updated = { ...current, ...partial }
  safeWrite(PREFS_KEY, updated)
  return updated
}
