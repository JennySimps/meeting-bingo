import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { CATEGORY_NAMES } from '../data/categories'

export function CategoryScreen() {
  const { dispatch } = useGame()
  const [selected, setSelected] = useState<string | null>(null)

  const startGame = () => {
    if (!selected) return
    dispatch({ type: 'SET_CATEGORY', category: selected })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <h1 className="text-3xl font-bold text-indigo-700 mb-2">Meeting Bingo</h1>
      <p className="text-gray-500 mb-8 text-lg">Choose your category</p>

      <div className="grid gap-3 w-full max-w-sm mb-8">
        {CATEGORY_NAMES.map(name => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className={`rounded-xl border-2 py-4 px-5 text-left font-semibold transition-all ${
              selected === name
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-gray-200 bg-white text-gray-800 hover:border-indigo-300'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <button
        onClick={startGame}
        disabled={!selected}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl py-3 px-10 transition-colors"
      >
        Start game
      </button>
    </div>
  )
}
