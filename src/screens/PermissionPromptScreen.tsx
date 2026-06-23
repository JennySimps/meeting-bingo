import { useState } from 'react'
import { useGame, speechSupported } from '../context/GameContext'

interface Props {
  onSpeechGranted: () => void
  onManualOnly: () => void
}

export function PermissionPromptScreen({ onSpeechGranted, onManualOnly }: Props) {
  const hasSpeech = speechSupported()
  const [micError, setMicError] = useState<string | null>(null)
  const [requesting, setRequesting] = useState(false)
  const { dispatch } = useGame()

  const requestMic = async () => {
    setRequesting(true)
    setMicError(null)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      dispatch({ type: 'SET_SCREEN', screen: { type: 'category' } })
      onSpeechGranted()
    } catch {
      setMicError('Microphone access was denied. You can still play without it.')
    } finally {
      setRequesting(false)
    }
  }

  const goManual = () => {
    dispatch({ type: 'SET_SCREEN', screen: { type: 'category' } })
    onManualOnly()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
      <h1 className="text-4xl font-bold text-indigo-700 mb-2">Meeting Bingo</h1>
      <p className="text-gray-500 mb-8 text-lg">Mark off buzzwords as you hear them</p>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3 mb-8 max-w-sm text-sm text-indigo-800">
        🔒 Audio never leaves your device — speech is processed locally by your browser.
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {hasSpeech && (
          <button
            onClick={requestMic}
            disabled={requesting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl py-3 px-6 transition-colors"
          >
            {requesting ? 'Requesting…' : '🎙 Enable microphone'}
          </button>
        )}

        {micError && (
          <p className="text-red-600 text-sm">{micError}</p>
        )}

        <button
          onClick={goManual}
          className="text-indigo-600 hover:text-indigo-800 font-medium py-2 underline-offset-2 hover:underline transition-colors"
        >
          Play without microphone
        </button>
      </div>
    </div>
  )
}
