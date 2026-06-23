const ALIASES: Record<string, string[]> = {
  'CI/CD': ['ci cd', 'continuous integration', 'continuous delivery'],
  'MVP': ['minimum viable product'],
  'ROI': ['return on investment'],
  'API': ['application programming interface'],
  'DevOps': ['dev ops'],
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function matchesInTranscript(cardWord: string, lowerTranscript: string): boolean {
  const candidates = [cardWord.toLowerCase(), ...(ALIASES[cardWord] ?? [])]
  for (const candidate of candidates) {
    if (candidate.includes(' ')) {
      if (lowerTranscript.includes(candidate)) return true
    } else {
      if (new RegExp(`\\b${escapeRegex(candidate)}\\b`, 'i').test(lowerTranscript)) return true
    }
  }
  return false
}

export function detectWords(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const lower = transcript.toLowerCase()
  return cardWords.filter(w => !alreadyFilled.has(w) && matchesInTranscript(w, lower))
}
