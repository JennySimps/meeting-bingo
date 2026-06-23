import { useCallback, useEffect, useRef, useState } from 'react'
import { useGame } from '../context/GameContext'
import { detectWords } from '../lib/wordDetector'

type SpeechError = 'too-many-restarts' | 'not-allowed' | 'unknown'

interface UseSpeechRecognitionResult {
  supported: boolean
  isListening: boolean
  error: SpeechError | null
  start: () => void
  stop: () => void
}

type SR = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

function getSRConstructor(): (new () => SR) | null {
  const w = window as unknown as Record<string, unknown>
  const Ctor = w['SpeechRecognition'] ?? w['webkitSpeechRecognition']
  return Ctor ? (Ctor as new () => SR) : null
}

const RESTART_WINDOW_MS = 2000
const MAX_RESTARTS = 3

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const Ctor = getSRConstructor()
  const supported = Ctor !== null

  const { state, dispatch } = useGame()
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<SpeechError | null>(null)

  const srRef = useRef<SR | null>(null)
  const restartTimestamps = useRef<number[]>([])
  const backoffMs = useRef(1000)
  const intentionalStop = useRef(false)
  const restartTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep a ref to current card words so the onresult closure is never stale
  const cardWordsRef = useRef<string[]>([])
  const filledWordsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    cardWordsRef.current = state.grid.flat().map(sq => sq.word).filter(Boolean)
  }, [state.grid])

  useEffect(() => {
    filledWordsRef.current = new Set(state.filledWords)
  }, [state.filledWords])

  const scheduleRestart = useCallback(() => {
    if (intentionalStop.current || !Ctor) return

    const now = Date.now()
    restartTimestamps.current = [...restartTimestamps.current, now].filter(
      t => now - t < RESTART_WINDOW_MS
    )

    if (restartTimestamps.current.length >= MAX_RESTARTS) {
      setIsListening(false)
      setError('too-many-restarts')
      dispatch({ type: 'SET_LISTENING', isListening: false })
      dispatch({
        type: 'ADD_TOAST',
        toast: { kind: 'error', message: 'Speech recognition stopped after too many errors.' },
      })
      return
    }

    dispatch({ type: 'ADD_TOAST', toast: { kind: 'warning', message: 'Reconnecting microphone…' } })

    restartTimer.current = setTimeout(() => {
      if (intentionalStop.current) return
      try {
        srRef.current?.start()
      } catch {
        // already started — ignore
      }
      backoffMs.current = Math.min(backoffMs.current * 2, 16000)
    }, backoffMs.current)
  }, [Ctor, dispatch])

  const createRecognition = useCallback((): SR | null => {
    if (!Ctor) return null
    const sr = new Ctor()
    sr.continuous = true
    sr.interimResults = true
    sr.lang = 'en-US'

    sr.onresult = (e: SpeechRecognitionEvent) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i]
        if (!result?.isFinal) continue
        const transcript = result[0]?.transcript ?? ''
        const matches = detectWords(transcript, cardWordsRef.current, filledWordsRef.current)
        for (const word of matches) {
          filledWordsRef.current.add(word)
          dispatch({ type: 'AUTO_FILL', word })
          dispatch({ type: 'ADD_TOAST', toast: { kind: 'info', message: `"${word}" detected!` } })
        }
      }
    }

    sr.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'not-allowed') {
        setError('not-allowed')
        setIsListening(false)
        dispatch({ type: 'SET_LISTENING', isListening: false })
        return
      }
      if (e.error === 'aborted') return
      scheduleRestart()
    }

    sr.onend = () => {
      if (!intentionalStop.current) scheduleRestart()
      else setIsListening(false)
    }

    return sr
  }, [Ctor, dispatch, scheduleRestart])

  const start = useCallback(() => {
    if (!Ctor || isListening) return
    setError(null)
    intentionalStop.current = false
    backoffMs.current = 1000
    restartTimestamps.current = []
    const sr = createRecognition()
    if (!sr) return
    srRef.current = sr
    try {
      sr.start()
      setIsListening(true)
      dispatch({ type: 'SET_LISTENING', isListening: true })
    } catch {
      setError('unknown')
    }
  }, [Ctor, isListening, createRecognition, dispatch])

  const stop = useCallback(() => {
    intentionalStop.current = true
    if (restartTimer.current) clearTimeout(restartTimer.current)
    try { srRef.current?.stop() } catch { /* ignore AbortError */ }
    setIsListening(false)
    dispatch({ type: 'SET_LISTENING', isListening: false })
  }, [dispatch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intentionalStop.current = true
      if (restartTimer.current) clearTimeout(restartTimer.current)
      try { srRef.current?.stop() } catch { /* ignore */ }
    }
  }, [])

  if (!supported) return { supported: false, isListening: false, error: null, start: () => {}, stop: () => {} }
  return { supported: true, isListening, error, start, stop }
}
