import type { BingoSquare } from '../types'

const FILLED_STATES = new Set(['filled', 'auto-filled', 'free-space', 'winning-square'])

function isFilled(sq: BingoSquare): boolean {
  return FILLED_STATES.has(sq.state)
}

function getLines(grid: BingoSquare[][]): BingoSquare[][] {
  const lines: BingoSquare[][] = []
  // 5 rows
  for (let r = 0; r < 5; r++) lines.push(grid[r]!)
  // 5 columns
  for (let c = 0; c < 5; c++) lines.push(grid.map(row => row[c]!))
  // main diagonal
  lines.push([0, 1, 2, 3, 4].map(i => grid[i]![i]!))
  // anti-diagonal
  lines.push([0, 1, 2, 3, 4].map(i => grid[i]![4 - i]!))
  return lines
}

export function checkWin(grid: BingoSquare[][]): BingoSquare[][] {
  if (grid.length === 0) return []
  return getLines(grid).filter(line => line.every(isFilled))
}

export function getClosestToWin(grid: BingoSquare[][]): BingoSquare[] {
  if (grid.length === 0) return []
  const lines = getLines(grid)
  return lines.reduce((best, line) =>
    line.filter(isFilled).length > best.filter(isFilled).length ? line : best
  , lines[0]!)
}
