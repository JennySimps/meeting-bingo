import { describe, it, expect } from 'vitest'
import { detectWords } from './wordDetector'

const filled = new Set<string>()

describe('detectWords', () => {
  it('matches an exact single word', () => {
    expect(detectWords('we need an API endpoint', ['API'], filled)).toEqual(['API'])
  })

  it('does NOT match API inside RAPID (false-positive guard)', () => {
    expect(detectWords('RAPID development', ['API'], filled)).toEqual([])
  })

  it('alias: CI/CD matches "CI CD"', () => {
    expect(detectWords('our CI CD pipeline', ['CI/CD'], filled)).toEqual(['CI/CD'])
  })

  it('alias: CI/CD matches "continuous integration"', () => {
    expect(detectWords('continuous integration is important', ['CI/CD'], filled)).toEqual(['CI/CD'])
  })

  it('alias: CI/CD matches "continuous delivery"', () => {
    expect(detectWords('we use continuous delivery', ['CI/CD'], filled)).toEqual(['CI/CD'])
  })

  it('alias: MVP matches "minimum viable product"', () => {
    expect(detectWords('ship a minimum viable product', ['MVP'], filled)).toEqual(['MVP'])
  })

  it('alias: ROI matches "return on investment"', () => {
    expect(detectWords('what is the return on investment', ['ROI'], filled)).toEqual(['ROI'])
  })

  it('alias: DevOps matches "dev ops"', () => {
    expect(detectWords('the dev ops team', ['DevOps'], filled)).toEqual(['DevOps'])
  })

  it('alias: API matches "application programming interface"', () => {
    expect(detectWords('use the application programming interface', ['API'], filled)).toEqual(['API'])
  })

  it('is case-insensitive', () => {
    expect(detectWords('SYNERGY is key', ['synergy'], filled)).toEqual(['synergy'])
  })

  it('returns [] when no card words match', () => {
    expect(detectWords('hello world', ['synergy', 'pivot'], filled)).toEqual([])
  })

  it('skips already-filled words', () => {
    const af = new Set(['API'])
    expect(detectWords('we need an API endpoint', ['API'], af)).toEqual([])
  })

  it('matches multiple words in one transcript', () => {
    const result = detectWords('synergy and ROI are key', ['synergy', 'ROI', 'pivot'], filled)
    expect(result).toContain('synergy')
    expect(result).toContain('ROI')
    expect(result).not.toContain('pivot')
  })

  it('phrase: multi-word card phrase uses substring match', () => {
    expect(detectWords('we need to think outside the box today', ['think outside the box'], filled)).toEqual(['think outside the box'])
  })
})
