import type { BingoSquare } from '../types'

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

export function generateCard(words: string[]): BingoSquare[][] {
  const shuffled = fisherYatesShuffle(words)
  const picked = shuffled.slice(0, 24)

  const grid: BingoSquare[][] = []
  let wordIdx = 0

  for (let row = 0; row < 5; row++) {
    const gridRow: BingoSquare[] = []
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) {
        gridRow.push({ word: '', state: 'free-space', row, col })
      } else {
        gridRow.push({ word: picked[wordIdx++]!, state: 'default', row, col })
      }
    }
    grid.push(gridRow)
  }

  return grid
}
