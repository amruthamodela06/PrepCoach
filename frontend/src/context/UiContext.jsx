import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const UiContext = createContext(null)

let toastIdCounter = 0

export function UiProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null) // { message, confirmLabel }
  const resolveRef = useRef(null)

  const toast = useCallback((message, ms = 3200) => {
    const id = ++toastIdCounter
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, ms)
  }, [])

  const confirm = useCallback((message, confirmLabel = 'Confirm') => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setConfirmState({ message, confirmLabel })
    })
  }, [])

  const handleConfirm = useCallback((result) => {
    setConfirmState(null)
    resolveRef.current?.(result)
    resolveRef.current = null
  }, [])

  useEffect(() => {
    if (!confirmState) return
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        handleConfirm(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [confirmState, handleConfirm])

  return (
    <UiContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>{t.message}</div>
        ))}
      </div>

      <div
        className={`overlay${confirmState ? '' : ' hidden'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Confirmation dialog"
      >
        <div className="confirm-box">
          <p>{confirmState?.message ?? 'Are you sure?'}</p>
          <div className="confirm-actions">
            <button type="button" className="btn btn-ghost" onClick={() => handleConfirm(false)}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={() => handleConfirm(true)}>
              {confirmState?.confirmLabel || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </UiContext.Provider>
  )
}

export function useUi() {
  const ctx = useContext(UiContext)
  if (!ctx) throw new Error('useUi must be used within UiProvider')
  return ctx
}
