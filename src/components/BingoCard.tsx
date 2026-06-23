import { useGame } from '../context/GameContext'
import { BingoSquareCell } from './BingoSquareCell'

const HEADERS = ['B', 'I', 'N', 'G', 'O']

export function BingoCard() {
  const { state } = useGame()
  const { grid } = state

  if (grid.length === 0) return null

  const filledCount = grid.flat().filter(
    sq => sq.state === 'filled' || sq.state === 'auto-filled' || sq.state === 'winning-square'
  ).length

  return (
    <div className="w-full max-w-sm mx-auto">
      <p className="text-center text-sm text-gray-500 mb-2 font-medium">{filledCount} / 24</p>
      <div className="grid grid-cols-5 gap-1 mb-1">
        {HEADERS.map(h => (
          <div key={h} className="text-center font-bold text-indigo-700 text-base">{h}</div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1">
        {grid.flat().map(sq => (
          <BingoSquareCell key={`${sq.row}-${sq.col}`} square={sq} />
        ))}
      </div>
    </div>
  )
}
