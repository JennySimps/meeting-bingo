import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { useGame } from '../context/GameContext'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function WinOverlay() {
  const { state, dispatch } = useGame()
  const reducedMotion = useReducedMotion()
  const lineCount = state.winningLines.length

  useEffect(() => {
    if (reducedMotion) return
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
  }, [reducedMotion])

  const share = async () => {
    if (!navigator.share) return
    try {
      await navigator.share({
        title: 'Meeting Bingo!',
        text: `I got BINGO in a meeting! ${lineCount} line${lineCount !== 1 ? 's' : ''} complete. 🎉`,
      })
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
    }
  }

  const newGame = () => dispatch({ type: 'NEW_GAME' })

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className={`bg-white rounded-t-3xl px-8 py-10 w-full max-w-sm text-center shadow-2xl ${reducedMotion ? '' : 'animate-slide-up'}`}>
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-3xl font-bold text-indigo-700 mb-1">BINGO!</h2>
        <p className="text-gray-500 mb-8">
          {lineCount} winning line{lineCount !== 1 ? 's' : ''} complete
        </p>

        <div className="flex flex-col gap-3">
          {'share' in navigator && (
            <button
              onClick={share}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3 px-6 transition-colors"
            >
              Share result
            </button>
          )}
          <button
            onClick={newGame}
            className="border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 font-semibold rounded-xl py-3 px-6 transition-colors"
          >
            New game
          </button>
        </div>
      </div>
    </div>
  )
}
