import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  const [reduced, setReduced] = useState(query.matches)
  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [query])
  return reduced
}
