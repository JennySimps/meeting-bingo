import { describe, it, expect } from 'vitest'
import { generateCard } from './cardGenerator'

const WORDS = Array.from({ length: 40 }, (_, i) => `word${i}`)

describe('generateCard', () => {
  it('returns a 5x5 grid', () => {
    const grid = generateCard(WORDS)
    expect(grid).toHaveLength(5)
    grid.forEach(row => expect(row).toHaveLength(5))
  })

  it('places free space at [2][2]', () => {
    const grid = generateCard(WORDS)
    expect(grid[2]![2]!.state).toBe('free-space')
    expect(grid[2]![2]!.word).toBe('')
  })

  it('has 24 unique non-free words all drawn from the word list', () => {
    const grid = generateCard(WORDS)
    const nonFree = grid.flat().filter(sq => sq.state !== 'free-space')
    expect(nonFree).toHaveLength(24)
    const unique = new Set(nonFree.map(sq => sq.word))
    expect(unique.size).toBe(24)
    nonFree.forEach(sq => expect(WORDS).toContain(sq.word))
  })

  it('does not mutate the source word list', () => {
    const words = [...WORDS]
    const copy = [...words]
    generateCard(words)
    expect(words).toEqual(copy)
  })

  it('produces different orderings on consecutive calls', () => {
    const a = generateCard(WORDS).flat().map(sq => sq.word).join(',')
    const b = generateCard(WORDS).flat().map(sq => sq.word).join(',')
    expect(a).not.toBe(b)
  })
})
