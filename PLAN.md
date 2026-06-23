# Meeting Bingo — Implementation Plan

## Review Summary

Reviewed: 2026-06-23 | Reviewers: VP Product, VP Engineering, VP Design

### Changes Applied

| # | Change |
|---|--------|
| 1 | Add pre-permission mic onboarding screen as a distinct `permission-prompt` state in App.tsx state machine (before `category`) |
| 2 | Define browser support matrix in Phase 1: Chrome/Edge desktop = full; Firefox = manual-only; iOS Safari = manual-only. Manual-only mode is a first-class layout variant, not a banner. |
| 3 | Add exponential backoff with 3-restart threshold to `useSpeechRecognition`; halt and surface error state after 3 rapid restarts (<2s apart) |
| 4 | Define Tailwind semantic color tokens for all 5 BingoSquare states in Phase 1, each passing 4.5:1 contrast; add non-color indicator to distinguish auto-filled from manually filled |
| 5 | Add keyboard navigation to BingoCard (`role=grid/row/gridcell`, roving tabindex, arrow keys navigate, Enter/Space toggles); trap focus in WinScreen; add to Phase 4 acceptance criteria |
| 6 | Add Vitest to Phase 1 scaffolding; require unit tests for `cardGenerator`, `bingoChecker` (all 12 winning lines), and `wordDetector` (aliases + false-positive neighbors) before Phase 5 |
| 7 | Move speech detection logic out of GameBoard render layer into `useGame` or a dedicated hook to prevent stale closure bugs |
| 8 | Replace 3-4 level prop drilling with a single `GameContext` + `useReducer` |
| 9 | Add `version` field to `useLocalStorage` GameState schema; handle migration on restore to prevent silent state corruption |
| 10 | Replace substring acronym matching with word-boundary regex universally to prevent false positives (e.g. `API` inside `RAPID`) |
| 11 | Distinguish interim vs. final transcript results in `useSpeechRecognition`; run word detection on final results only |
| 12 | Define Firefox manual-only mode UX flow, layout spec, and feature-parity definition in Phase 5 |
| 13 | Add "resume game?" prompt when localStorage restores a stale game from a previous session |
| 14 | Update `bingoChecker` to return all winning lines, not just the first |
| 15 | Add editorial/quality validation process for the 120+ buzzword lists |
| 16 | Move "One away from BINGO!" banner from Phase 7 (Polish) to Phase 5/6 as a core engagement mechanic |
| 17 | Specify "Play Again" destination (category select screen) |
| 18 | Visually separate "New Card" (destructive) and "Stop/Start Listening" (transient) in GameControls; add confirmation dialog before "New Card" |
| 19 | Redesign WinScreen as an overlay/sheet on top of GameBoard instead of a full state-machine screen replacement |
| 20 | Add loading/generation state for BingoCard to prevent abrupt jump from CategorySelect |
| 21 | Define notification priority hierarchy between "One away" banner and Toast queue |
| 22 | Replace 100-char raw transcript with structured detected-words log (term + relative timestamp) |
| 23 | Dynamically import `canvas-confetti` only on win transition |
| 24 | Mark auto-filled squares as non-toggle-able; add `isAutoFilled` distinction to game rules and `BingoSquare` |
| 25 | Add `paused/restored` mic state so restored games don't falsely show mic as active |
| 26 | Add hash routing or History API to prevent browser back gesture exiting the app on mobile |
| 27 | Batch word burst multiple detections into a single reducer dispatch |
| 28 | Verify port 3000 availability in Codespaces; fall back to Vite default (5173) if conflicting |
| 29 | Handle `navigator.share` `AbortError` (user cancels) to prevent unhandled promise rejection |
| 30 | Cap Toast queue depth (max 3 visible); queue overflow drops oldest |
| 31 | Explicitly descope canvas card image share to post-MVP; document decision |
| 32 | Define detected-word pill lifecycle (accumulate up to last 10; auto-dismiss after 30s) |
| 33 | Add handling for Web Speech API `onerror` events beyond permission denial |
| 34 | Document intentional no-telemetry stance in plan constraints |
| 35 | Add word list preview to CategorySelect cards |
| 36 | Add `prefers-reduced-motion` support: disable `bounceIn` animation and confetti for affected users |
| 37 | Add hover/focus/selected states to CategorySelect cards; add back-nav from GameBoard |
| 38 | Move privacy message to above the "New Game" CTA on LandingPage |
| 39 | Add success/failure feedback to Share button for clipboard path |
| 40 | Document BingoSquare toggle-unfill rules (manual squares only, auto-filled locked) |
| 41 | Define mobile layout in Phase 5 alongside desktop; do not defer to Phase 7 |
| 42 | Give free space a distinct visual treatment (star icon + "FREE" label; distinct color; exclude from X/24 counter) |
| 43 | Add `aria-live` region for mic listening state so screen readers can perceive it |

### Unresolved Items

- [ ] Canvas-based card image export (share) — deferred to post-MVP (scope decision, see item 31)

---

## Revision History

| Date | Reviewer | Action |
|------|----------|--------|
| 2026-06-23 | VP Product, VP Engineering, VP Design | Full plan review — 6 Critical, 16 High, 16 Medium, 5 Low issues identified; all recommendations approved |

---


## Overview
A single-player browser bingo game that auto-detects corporate buzzwords via the Web Speech API. React 18 + TypeScript + Vite + Tailwind CSS. No backend, no accounts, zero cost.

---

## Phase 1 — Project Scaffolding

**Goal**: Working dev environment with Tailwind wired up.

- [ ] Run `npm create vite@latest . -- --template react-ts` in `/workspaces/meeting-bingo`
- [ ] Install dependencies: `canvas-confetti`, `tailwindcss`, `postcss`, `autoprefixer`
- [ ] Configure `tailwind.config.js` with `content` glob for `src/**/*.{ts,tsx}`
- [ ] Add custom keyframe animations (`bounceIn`) to Tailwind config
- [ ] Configure `vite.config.ts` (port 3000, sourcemaps)
- [ ] Create `src/types/index.ts` with all TypeScript interfaces: `CategoryId`, `BingoSquare`, `BingoCard`, `GameState`, `GameStatus`, `WinningLine`, `SpeechRecognitionState`, `Toast`

---

## Phase 2 — Data & Core Logic

**Goal**: Pure functions that can be tested without a UI.

- [ ] Create `src/data/categories.ts` — 3 word packs (Agile/Corporate/Tech), 40+ words each
- [ ] Create `src/lib/cardGenerator.ts` — Fisher-Yates shuffle, pick 24 words, build 5×5 grid with free space at `[2][2]`, pre-filled
- [ ] Create `src/lib/bingoChecker.ts` — check 5 rows + 5 columns + 2 diagonals; return first `WinningLine` found or `null`; helper for "closest to win"
- [ ] Create `src/lib/wordDetector.ts` — word-boundary regex for single words, substring for phrases, alias map for `CI/CD`, `MVP`, `ROI`, `API`, `DevOps`
- [ ] Create `src/lib/shareUtils.ts` — build clipboard-ready text summary (time, winning word, squares filled, category, app link)

---

## Phase 3 — Hooks

**Goal**: Reusable stateful logic decoupled from UI.

- [ ] Create `src/hooks/useSpeechRecognition.ts` — wraps `window.SpeechRecognition || window.webkitSpeechRecognition`; `continuous: true`, `interimResults: true`, auto-restarts on `onend` if still supposed to be listening; exposes `startListening(onResult)`, `stopListening`, `resetTranscript`, `isSupported`
- [ ] Create `src/hooks/useGame.ts` — owns `GameState`, exposes `fillSquare(row, col, isAuto)`, `resetGame()`, `startGame(categoryId)`, `detectWin()`; wires `bingoChecker` after each fill
- [ ] Create `src/hooks/useLocalStorage.ts` — generic key/value persistence; used to save and restore active game on page reload

---

## Phase 4 — Shared UI Primitives

**Goal**: Reusable building blocks (no game logic).

- [ ] `src/components/ui/Button.tsx` — variant props: `primary`, `secondary`, `ghost`
- [ ] `src/components/ui/Card.tsx` — wrapper div with consistent shadow/radius
- [ ] `src/components/ui/Toast.tsx` — auto-dismiss notification, stacks vertically, shows detected word

---

## Phase 5 — Screen Components

**Goal**: Full 4-screen flow wired to game state.

- [ ] `src/components/LandingPage.tsx` — hero with "New Game" CTA, "How It Works" steps, privacy trust message
- [ ] `src/components/CategorySelect.tsx` — 3 category cards with icon + name + sample words + Select button; Back link
- [ ] `src/components/BingoSquare.tsx` — handles `default` / `filled` / `auto-filled` / `free-space` / `winning-square` visual states; click toggles fill
- [ ] `src/components/BingoCard.tsx` — 5×5 grid of `BingoSquare`; passes `isWinningSquare` based on `WinningLine`
- [ ] `src/components/TranscriptPanel.tsx` — pulsing mic indicator, last 100 chars of transcript, detected words as green pills
- [ ] `src/components/GameControls.tsx` — "New Card" and "Stop/Start Listening" buttons
- [ ] `src/components/GameBoard.tsx` — composes header (logo + listening status + `X/24` counter), `BingoCard`, `TranscriptPanel`, `GameControls`; wires `useSpeechRecognition` → `detectWords` → `fillSquare`
- [ ] `src/components/WinScreen.tsx` — confetti via `canvas-confetti`, winning card with green highlight on winning line, stats panel (time elapsed, winning word, squares filled, category), Share + Play Again buttons

---

## Phase 6 — App Shell & State Wiring

**Goal**: End-to-end flow working.

- [ ] `src/App.tsx` — `screen` state machine (`landing` → `category` → `game` → `win`); passes handlers down; no global context needed at MVP scale
- [ ] Wire `useLocalStorage` in `useGame` to persist and restore game state
- [ ] Handle microphone permission denial gracefully — show manual-only mode banner

---

## Phase 7 — Polish

**Goal**: Matches UXR delight moments.

- [ ] "One away from BINGO!" banner — highlight the single unfilled square in the closest winning line
- [ ] Auto-fill animation — `bounceIn` keyframe plays on newly filled square
- [ ] Toast queue — show detected word within 500ms of detection
- [ ] Share button — `navigator.share` on mobile (native sheet), clipboard fallback on desktop
- [ ] Responsive layout — card squares scale with `aspect-square` + CSS grid; sidebar collapses on mobile
- [ ] Handle word burst — multiple simultaneous detections when a sentence hits 3+ squares

---

## Phase 8 — Verification & Deploy

- [ ] Manual test checklist: card uniqueness, all 12 winning lines (5 rows + 5 cols + 2 diagonals), share output, mic permission denied flow, Firefox fallback
- [ ] `npm run build && npm run preview` — verify production bundle
- [ ] Deploy to Vercel (connect repo, auto-deploy on push to `main`)

---

## Key Constraints

- **No sound by default** — user is in a live meeting
- **Firefox**: Web Speech API is behind a flag; detect with `!!window.SpeechRecognition || !!window.webkitSpeechRecognition` and render manual-only UI if absent
- **Same word spoken twice**: `alreadyFilled: Set<string>` in `detectWords` prevents re-filling
- **Audio never leaves the device** — reinforce with visible privacy message throughout
