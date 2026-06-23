import { useEffect, useRef } from 'react'
import type { GameState } from '../types'
import { useGame } from '../context/GameContext'
import { saveToStorage, loadFromStorage } from '../context/GameContext'

export function useLocalStorage(onResumePrompt: (saved: GameState) => void) {
  const { state, dispatch } = useGame()
  const prompted = useRef(false)

  // On mount: check for saved state and prompt to resume
  useEffect(() => {
    if (prompted.current) return
    prompted.current = true
    const saved = loadFromStorage()
    if (saved && saved.grid.length > 0) {
      onResumePrompt(saved)
    }
  }, [onResumePrompt])

  // On every state change: persist (strip isListening)
  useEffect(() => {
    saveToStorage(state)
  }, [state])

  const restoreGame = (saved: GameState) => dispatch({ type: 'RESTORE_GAME', state: saved })
  const discardSaved = () => {
    try { localStorage.removeItem('meeting-bingo-state') } catch { /* ignore */ }
  }

  return { restoreGame, discardSaved }
}
