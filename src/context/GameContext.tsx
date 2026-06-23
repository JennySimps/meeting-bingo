import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import type { GameState, ScreenType, Toast } from '../types'
import { generateCard } from '../lib/cardGenerator'
import { checkWin } from '../lib/bingoChecker'
import { CATEGORIES } from '../data/categories'

export const CURRENT_VERSION = 1
const STORAGE_KEY = 'meeting-bingo-state'

export function speechSupported(): boolean {
  const w = window as unknown as Record<string, unknown>
  return !!(w['SpeechRecognition'] ?? w['webkitSpeechRecognition'])
}

function makeInitialState(): GameState {
  return {
    version: CURRENT_VERSION,
    screen: speechSupported() ? { type: 'permission-prompt' } : { type: 'category' },
    category: null,
    grid: [],
    filledWords: [],
    winningLines: [],
    isListening: false,
    toasts: [],
  }
}

export type Action =
  | { type: 'SET_CATEGORY'; category: string }
  | { type: 'FILL_SQUARE'; row: number; col: number }
  | { type: 'AUTO_FILL'; word: string }
  | { type: 'SET_SCREEN'; screen: ScreenType }
  | { type: 'SET_LISTENING'; isListening: boolean }
  | { type: 'ADD_TOAST'; toast: Omit<Toast, 'id'> }
  | { type: 'DISMISS_TOAST'; id: string }
  | { type: 'NEW_GAME' }
  | { type: 'RESTORE_GAME'; state: GameState }

let toastId = 0

function applyWinCheck(state: GameState): GameState {
  const wins = checkWin(state.grid)
  if (wins.length === 0) return state
  const winCoords = new Set(wins.flat().map(sq => `${sq.row},${sq.col}`))
  const grid = state.grid.map(row =>
    row.map(sq =>
      winCoords.has(`${sq.row},${sq.col}`) && sq.state !== 'free-space'
        ? { ...sq, state: 'winning-square' as const }
        : sq
    )
  )
  return { ...state, grid, winningLines: wins }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_CATEGORY': {
      const words = CATEGORIES[action.category] ?? []
      return {
        ...state,
        category: action.category,
        grid: generateCard(words),
        filledWords: [],
        winningLines: [],
        screen: { type: 'game' },
      }
    }

    case 'FILL_SQUARE': {
      const sq = state.grid[action.row]?.[action.col]
      if (!sq || sq.state !== 'default') return state
      const grid = state.grid.map((row, ri) =>
        row.map((cell, ci) =>
          ri === action.row && ci === action.col ? { ...cell, state: 'filled' as const } : cell
        )
      )
      return applyWinCheck({ ...state, grid })
    }

    case 'AUTO_FILL': {
      const grid = state.grid.map(row =>
        row.map(sq =>
          sq.word === action.word && sq.state === 'default'
            ? { ...sq, state: 'auto-filled' as const }
            : sq
        )
      )
      return applyWinCheck({ ...state, grid, filledWords: [...state.filledWords, action.word] })
    }

    case 'SET_SCREEN':
      return { ...state, screen: action.screen }

    case 'SET_LISTENING':
      return { ...state, isListening: action.isListening }

    case 'ADD_TOAST': {
      const toast: Toast = { id: String(++toastId), ...action.toast }
      const toasts = [...state.toasts, toast].slice(-3)
      return { ...state, toasts }
    }

    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) }

    case 'NEW_GAME':
      return { ...makeInitialState(), screen: { type: 'category' } }

    case 'RESTORE_GAME':
      return { ...action.state, isListening: false }

    default:
      return state
  }
}

const GameContext = createContext<{
  state: GameState
  dispatch: Dispatch<Action>
} | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState)
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}

// ── localStorage helpers ────────────────────────────────────────────────────

export function saveToStorage(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, isListening: false }))
  } catch {
    // quota exceeded or private mode — ignore
  }
}

export function loadFromStorage(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null || !('version' in parsed)) return null
    const saved = parsed as GameState
    if (saved.version !== CURRENT_VERSION) return null
    return { ...saved, isListening: false }
  } catch {
    return null
  }
}
