# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

The repository currently contains only planning documents. Code has not been scaffolded yet. Start by running the bootstrap in the root `/workspaces/meeting-bingo`:

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install canvas-confetti
npm install -D tailwindcss postcss autoprefixer vitest
npx tailwindcss init -p
```

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # tsc + vite build (production)
npm run preview      # Preview production bundle
npm run typecheck    # tsc --noEmit (no emit)
npm run lint         # ESLint for .ts/.tsx
npx vitest run       # Run all unit tests
npx vitest run src/lib/cardGenerator.test.ts  # Run a single test file
```

Dev server port is 3000 (configured in `vite.config.ts`). In Codespaces, fall back to 5173 if 3000 is occupied.

## Architecture

Single-page React 18 + TypeScript app. No backend, no auth, no accounts. Everything runs in the browser.

### Screen state machine (`src/App.tsx`)

`App.tsx` owns a `screen` discriminated union: `permission-prompt` → `category` → `game` → `win`. Each screen is a full-component swap. The `win` state renders as an overlay/sheet on top of `game`, not a replacement. `GameContext` + `useReducer` holds game state and is provided at the `App` level — avoid prop-drilling beyond one level.

### Core data flow

1. **Card generation** (`src/lib/cardGenerator.ts`): Fisher-Yates shuffle over a category word list, picks 24, builds a 5×5 `BingoSquare[][]` with a pre-filled free space at `[2][2]`.
2. **Speech** (`src/hooks/useSpeechRecognition.ts`): Wraps `window.SpeechRecognition || window.webkitSpeechRecognition`. Uses `continuous: true`, `interimResults: true`. Runs word detection on **final** results only (not interim). Exponential backoff with a 3-restart threshold; halts and surfaces error state after 3 rapid restarts (<2 s apart). Speech detection logic lives in `useGame` or a dedicated hook — never in a render function (stale closure risk).
3. **Word detection** (`src/lib/wordDetector.ts`): Word-boundary regex (`\b...\b`) for single words; substring match for phrases. Alias map handles `CI/CD`, `MVP`, `ROI`, `API`, `DevOps`. An `alreadyFilled: Set<string>` prevents re-filling the same word.
4. **Win check** (`src/lib/bingoChecker.ts`): Checks all 12 lines (5 rows + 5 columns + 2 diagonals) after every fill. Returns **all** winning lines, not just the first. "One away from BINGO" uses `getClosestToWin`.

### State persistence

`useLocalStorage` persists `GameState` with a `version` field. On restore, migrate stale schema before use and show a "resume game?" prompt before applying it. The `isListening` flag resets to `false` on restore (mic state is never persisted).

### BingoSquare states

Five distinct visual states, all using semantic Tailwind color tokens with ≥4.5:1 contrast: `default`, `filled` (manual), `auto-filled` (speech, non-toggle-able), `free-space`, `winning-square`. Auto-filled squares are locked — clicking them does nothing. Free space has a star icon + "FREE" label and is excluded from the X/24 counter.

### Browser support matrix

| Browser | Mode |
|---------|------|
| Chrome/Edge desktop | Full (auto speech + manual) |
| Firefox | Manual-only (speech API absent) |
| iOS Safari | Manual-only |

Manual-only is a first-class layout variant, not a banner. Detect with `!!window.SpeechRecognition || !!window.webkitSpeechRecognition`.

## Key Constraints

- **No sound** — user is in a live meeting.
- **Audio never leaves the device** — Web Speech API processes locally. Reinforce with visible privacy message.
- **No telemetry** — intentional; do not add analytics.
- **Canvas-based card image export is explicitly out of scope (post-MVP)**.
- `navigator.share` `AbortError` (user cancels) must be caught to avoid unhandled rejection.
- Toast queue capped at 3 visible; oldest drops on overflow.
- Detected-word pills accumulate up to last 10, auto-dismiss after 30 s.
- `prefers-reduced-motion`: disable `bounceIn` animation and confetti for affected users.
- Hash routing or History API to prevent browser back gesture exiting the app on mobile.

## Testing Requirements

Vitest must be added in Phase 1 scaffolding. Unit tests are required (before Phase 5) for:
- `cardGenerator` — card uniqueness
- `bingoChecker` — all 12 winning lines
- `wordDetector` — aliases and false-positive neighbors (e.g. `API` must not match inside `RAPID`)
