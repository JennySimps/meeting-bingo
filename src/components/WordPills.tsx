import { useEffect, useState } from 'react'

interface Pill {
  word: string
  id: number
  expiresAt: number
}

const PILL_TTL_MS = 30_000
const MAX_PILLS = 10
let pillId = 0

interface Props {
  filledWords: string[]
}

export function WordPills({ filledWords }: Props) {
  const [pills, setPills] = useState<Pill[]>([])

  useEffect(() => {
    if (filledWords.length === 0) return
    const latest = filledWords[filledWords.length - 1]!
    const now = Date.now()
    setPills(prev => {
      const next = [{ word: latest, id: ++pillId, expiresAt: now + PILL_TTL_MS }, ...prev].slice(
        0,
        MAX_PILLS
      )
      return next
    })
  }, [filledWords])

  // Tick expiry
  useEffect(() => {
    if (pills.length === 0) return
    const earliest = Math.min(...pills.map(p => p.expiresAt))
    const delay = earliest - Date.now()
    const timer = setTimeout(() => {
      const now = Date.now()
      setPills(prev => prev.filter(p => p.expiresAt > now))
    }, Math.max(delay, 0))
    return () => clearTimeout(timer)
  }, [pills])

  if (pills.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-hide" aria-live="polite">
      {pills.map(p => (
        <span
          key={p.id}
          className="shrink-0 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 motion-safe:animate-fade-in"
        >
          {p.word}
        </span>
      ))}
    </div>
  )
}
