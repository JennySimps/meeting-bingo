import { useEffect } from 'react'
import { useGame } from '../context/GameContext'

const KIND_STYLES: Record<string, string> = {
  info: 'bg-blue-600 text-white',
  warning: 'bg-yellow-500 text-white',
  error: 'bg-red-600 text-white',
  success: 'bg-green-600 text-white',
}

const AUTO_DISMISS_MS = 4000

export function ToastQueue() {
  const { state, dispatch } = useGame()

  useEffect(() => {
    if (state.toasts.length === 0) return
    const id = state.toasts[0]!.id
    const timer = setTimeout(
      () => dispatch({ type: 'DISMISS_TOAST', id }),
      AUTO_DISMISS_MS
    )
    return () => clearTimeout(timer)
  }, [state.toasts, dispatch])

  if (state.toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full">
      {state.toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 shadow-lg text-sm font-medium motion-safe:animate-slide-in ${KIND_STYLES[toast.kind] ?? 'bg-gray-700 text-white'}`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => dispatch({ type: 'DISMISS_TOAST', id: toast.id })}
            className="shrink-0 opacity-80 hover:opacity-100 text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
