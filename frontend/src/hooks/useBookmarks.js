import { useCallback, useState } from 'react'
import { loadBookmarks, toggleBookmarkStorage } from '../lib/storage'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => loadBookmarks())

  const toggleBookmark = useCallback((item) => {
    const updated = toggleBookmarkStorage(item)
    setBookmarks(updated)
    return updated
  }, [])

  const isBookmarked = useCallback(
    (questionText) => {
      if (!questionText) return false
      const key = questionText.trim()
      return bookmarks.some((b) => b.question === key)
    },
    [bookmarks]
  )

  return { bookmarks, toggleBookmark, isBookmarked }
}
