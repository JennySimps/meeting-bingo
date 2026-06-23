export type SquareState = 'default' | 'filled' | 'auto-filled' | 'free-space' | 'winning-square'

export interface BingoSquare {
  word: string
  state: SquareState
  row: number
  col: number
}

export type ScreenType =
  | { type: 'permission-prompt' }
  | { type: 'category' }
  | { type: 'game' }

export interface Toast {
  id: string
  kind: 'info' | 'warning' | 'error' | 'success'
  message: string
}

export interface GameState {
  version: number
  screen: ScreenType
  category: string | null
  grid: BingoSquare[][]
  filledWords: string[]
  winningLines: BingoSquare[][]
  isListening: boolean
  toasts: Toast[]
}
