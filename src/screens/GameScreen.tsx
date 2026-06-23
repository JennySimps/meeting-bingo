import { useEffect, useCallback } from 'react'
import { useGame } from '../context/GameContext'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { getClosestToWin } from '../lib/bingoChecker'
import { BingoCard } from '../components/BingoCard'
import { WordPills } from '../components/WordPills'
import { WinOverlay } from './WinOverlay'
import { ToastQueue } from '../components/ToastQueue'

export function GameScreen() {
  const { state, dispatch } = useGame()
  const speech = useSpeechRecognition()

  // "One away from BINGO" toast
  useEffect(() => {
    if (state.grid.length === 0 || state.winningLines.length > 0) return
    const closest = getClosestToWin(state.grid)
    const unfilled = closest.filter(
      sq => sq.state === 'default'
    ).length
    if (unfilled === 1) {
      dispatch({ type: 'ADD_TOAST', toast: { kind: 'success', message: 'One away from BINGO!' } })
    }
  }, [state.grid, state.winningLines.length, dispatch])

  const toggleMic = useCallback(() => {
    if (state.isListening) speech.stop()
    else speech.start()
  }, [state.isListening, speech])

  const confirmNewGame = () => {
    if (!window.confirm('Start a new game? Your current progress will be lost.')) return
    dispatch({ type: 'NEW_GAME' })
  }

  const micErrored = speech.error === 'too-many-restarts' || speech.error === 'not-allowed'

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <h1 className="font-bold text-indigo-700 text-lg">Meeting Bingo</h1>
        <div className="flex items-center gap-3">
          {speech.supported && (
            <button
              onClick={toggleMic}
              disabled={micErrored}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                micErrored
                  ? 'bg-red-100 text-red-600 cursor-not-allowed'
                  : state.isListening
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={micErrored ? speech.error ?? '' : undefined}
            >
              <span className={`w-2 h-2 rounded-full ${state.isListening ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
              {micErrored ? 'Mic error' : state.isListening ? 'Listening…' : 'Tap to listen'}
            </button>
          )}
          <button
            onClick={confirmNewGame}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            New game
          </button>
        </div>
      </header>

      {/* Category badge */}
      {state.category && (
        <div className="text-center text-xs text-gray-400 py-1">{state.category}</div>
      )}

      {/* Word pills (speech only) */}
      {speech.supported && (
        <div className="px-4">
          <WordPills filledWords={state.filledWords} />
        </div>
      )}

      {/* Grid */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        <BingoCard />
      </main>

      {/* Privacy badge */}
      <footer className="text-center text-xs text-gray-400 py-3 px-4">
        🔒 Audio processed locally · No data leaves your device
      </footer>

      {/* Win overlay */}
      {state.winningLines.length > 0 && <WinOverlay />}

      {/* Toast queue */}
      <ToastQueue />
    </div>
  )
}
