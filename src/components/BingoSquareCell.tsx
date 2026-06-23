import type { BingoSquare } from '../types'
import { useGame } from '../context/GameContext'

const STATE_STYLES: Record<string, string> = {
  default: 'bg-white hover:bg-gray-50 text-gray-800 cursor-pointer active:scale-95',
  filled: 'bg-green-500 text-white cursor-pointer',
  'auto-filled': 'bg-indigo-600 text-white cursor-default',
  'free-space': 'bg-amber-400 text-amber-900 cursor-default',
  'winning-square': 'bg-yellow-300 text-yellow-900 ring-2 ring-yellow-500 cursor-pointer',
}

interface Props {
  square: BingoSquare
}

export function BingoSquareCell({ square }: Props) {
  const { dispatch } = useGame()

  const handleClick = () => {
    if (square.state === 'auto-filled' || square.state === 'free-space') return
    dispatch({ type: 'FILL_SQUARE', row: square.row, col: square.col })
  }

  const style = STATE_STYLES[square.state] ?? STATE_STYLES['default']!

  if (square.state === 'free-space') {
    return (
      <div className={`flex flex-col items-center justify-center rounded-lg border border-amber-300 min-h-[60px] p-1 text-center select-none transition-colors ${style}`}>
        <span className="text-lg leading-none">★</span>
        <span className="text-xs font-bold mt-0.5">FREE</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center rounded-lg border border-gray-200 min-h-[60px] p-1 text-center text-xs font-medium leading-tight select-none transition-all ${style}`}
      aria-pressed={square.state === 'filled' || square.state === 'winning-square'}
      aria-label={square.word}
    >
      {square.word}
    </button>
  )
}
