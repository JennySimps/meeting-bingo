import { useCallback, useEffect, useRef, useState } from 'react'
import { GameProvider, useGame } from './context/GameContext'
import { useLocalStorage } from './hooks/useLocalStorage'
import { PermissionPromptScreen } from './screens/PermissionPromptScreen'
import { CategoryScreen } from './screens/CategoryScreen'
import { GameScreen } from './screens/GameScreen'
import type { GameState, ScreenType } from './types'

function assertNever(x: never): never {
  throw new Error(`Unhandled screen type: ${JSON.stringify(x)}`)
}

// Maps screen type → hash fragment for back-gesture routing
const SCREEN_HASH: Record<ScreenType['type'], string> = {
  'permission-prompt': '#start',
  category: '#category',
  game: '#game',
}

function ResumeDialog({
  saved,
  onResume,
  onDiscard,
}: {
  saved: GameState
  onResume: () => void
  onDiscard: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl px-8 py-8 w-full max-w-sm text-center shadow-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Resume your game?</h2>
        <p className="text-gray-500 text-sm mb-6">
          You have a saved game in progress
          {saved.category ? ` — ${saved.category}` : ''}.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3"
          >
            Resume game
          </button>
          <button
            onClick={onDiscard}
            className="text-gray-500 hover:text-gray-700 font-medium py-2"
          >
            Start fresh
          </button>
        </div>
      </div>
    </div>
  )
}

function AppInner() {
  const { state, dispatch } = useGame()
  const { screen } = state
  const [pendingRestore, setPendingRestore] = useState<GameState | null>(null)
  const speechModeRef = useRef(false)

  const handleResumePrompt = useCallback((saved: GameState) => {
    setPendingRestore(saved)
  }, [])

  const { restoreGame, discardSaved } = useLocalStorage(handleResumePrompt)

  // Push a history entry on screen transitions to enable back-gesture navigation
  useEffect(() => {
    const hash = SCREEN_HASH[screen.type]
    if (window.location.hash !== hash) {
      history.pushState(null, '', hash)
    }
  }, [screen.type])

  // Handle browser back button
  useEffect(() => {
    const onPop = () => {
      const hash = window.location.hash
      if (hash === '#game') dispatch({ type: 'SET_SCREEN', screen: { type: 'game' } })
      else if (hash === '#category') dispatch({ type: 'SET_SCREEN', screen: { type: 'category' } })
      else dispatch({ type: 'SET_SCREEN', screen: { type: 'permission-prompt' } })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [dispatch])

  const confirmRestore = () => {
    if (!pendingRestore) return
    restoreGame(pendingRestore)
    setPendingRestore(null)
  }

  const rejectRestore = () => {
    discardSaved()
    setPendingRestore(null)
  }

  let content: React.ReactNode
  if (screen.type === 'permission-prompt') {
    content = (
      <PermissionPromptScreen
        onSpeechGranted={() => { speechModeRef.current = true }}
        onManualOnly={() => { speechModeRef.current = false }}
      />
    )
  } else if (screen.type === 'category') {
    content = <CategoryScreen />
  } else if (screen.type === 'game') {
    content = <GameScreen />
  } else {
    content = assertNever(screen)
  }

  return (
    <>
      {content}
      {pendingRestore && (
        <ResumeDialog
          saved={pendingRestore}
          onResume={confirmRestore}
          onDiscard={rejectRestore}
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  )
}
