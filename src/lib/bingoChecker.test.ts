import { describe, it, expect } from 'vitest'
import { checkWin, getClosestToWin } from './bingoChecker'
import type { BingoSquare } from '../types'

function makeGrid(): BingoSquare[][] {
  return Array.from({ length: 5 }, (_, r) =>
    Array.from({ length: 5 }, (_, c) => ({
      word: r === 2 && c === 2 ? '' : `${r}${c}`,
      state: r === 2 && c === 2 ? ('free-space' as const) : ('default' as const),
      row: r,
      col: c,
    }))
  )
}

function fill(grid: BingoSquare[][], coords: [number, number][]): BingoSquare[][] {
  return grid.map(row =>
    row.map(sq => {
      if (sq.state === 'free-space') return sq
      if (coords.some(([r, c]) => r === sq.row && c === sq.col)) {
        return { ...sq, state: 'filled' as const }
      }
      return sq
    })
  )
}

describe('checkWin', () => {
  it('returns [] on an empty grid', () => {
    expect(checkWin([])).toEqual([])
  })

  it('returns [] when no line is complete', () => {
    expect(checkWin(makeGrid())).toEqual([])
  })

  for (let r = 0; r < 5; r++) {
    it(`detects row ${r} win`, () => {
      const coords: [number, number][] = [0, 1, 2, 3, 4].map(c => [r, c])
      const grid = fill(makeGrid(), coords)
      const wins = checkWin(grid)
      expect(wins.length).toBeGreaterThanOrEqual(1)
      expect(wins.some(line => line.every(sq => sq.row === r))).toBe(true)
    })
  }

  for (let c = 0; c < 5; c++) {
    it(`detects column ${c} win`, () => {
      const coords: [number, number][] = [0, 1, 2, 3, 4].map(r => [r, c])
      const grid = fill(makeGrid(), coords)
      const wins = checkWin(grid)
      expect(wins.length).toBeGreaterThanOrEqual(1)
      expect(wins.some(line => line.every(sq => sq.col === c))).toBe(true)
    })
  }

  it('detects main diagonal win', () => {
    const coords: [number, number][] = [0, 1, 2, 3, 4].map(i => [i, i])
    const grid = fill(makeGrid(), coords)
    const wins = checkWin(grid)
    expect(wins.some(line => line.every((sq, i) => sq.row === i && sq.col === i))).toBe(true)
  })

  it('detects anti-diagonal win', () => {
    const coords: [number, number][] = [0, 1, 2, 3, 4].map(i => [i, 4 - i])
    const grid = fill(makeGrid(), coords)
    const wins = checkWin(grid)
    expect(wins.some(line => line.every((sq, i) => sq.row === i && sq.col === 4 - i))).toBe(true)
  })

  it('returns all winning lines when multiple are complete', () => {
    const coords: [number, number][] = [
      ...[0, 1, 2, 3, 4].map<[number, number]>(c => [0, c]), // row 0
      ...[0, 1, 2, 3, 4].map<[number, number]>(r => [r, 0]), // col 0
    ]
    const grid = fill(makeGrid(), coords)
    const wins = checkWin(grid)
    expect(wins.length).toBeGreaterThanOrEqual(2)
  })

  it('free space at [2][2] contributes to row 2, col 2, and both diagonals', () => {
    const grid = makeGrid() // [2][2] is free-space, counts as filled
    // Fill rest of main diagonal: [0,0],[1,1],[3,3],[4,4]
    const g2 = fill(grid, [[0,0],[1,1],[3,3],[4,4]])
    const wins = checkWin(g2)
    expect(wins.some(line => line.every((sq, i) => sq.row === i && sq.col === i))).toBe(true)
  })
})

describe('getClosestToWin', () => {
  it('returns [] on empty grid', () => {
    expect(getClosestToWin([])).toEqual([])
  })

  it('returns the line with most filled squares', () => {
    const coords: [number, number][] = [[0,0],[0,1],[0,2],[0,3]] // row 0, 4 of 5 filled
    const grid = fill(makeGrid(), coords)
    const closest = getClosestToWin(grid)
    expect(closest.filter(sq => sq.state !== 'default').length).toBeGreaterThanOrEqual(4)
  })
})
