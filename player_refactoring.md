# Player Refactoring Notes

## Clarified Goals (From User)
- Provide a neat-looking audio player for multiple audio files (e.g., profile summary, thesis podcast).
- Keep a mini player visible when the main controls scroll out of view (already working well).
- Preserve playback state per audio file (saved timestamp, play/pause) across big and mini players.
- Ensure switching between media stops/starts correctly while remembering each audio's position.
- Keep playback speed behavior as-is (already good).
- Keep mini-mini player behavior as-is (already good).
- Open to optimizations for modularity and reusability without changing UX.

## My Comments
- The current UX sounds solid. Refactoring should focus on state management and shared behavior, not UI changes.
- The key complexity is per-audio saved state plus cross-player coordination. That suggests a shared registry or store.
- We should avoid breaking scroll/minimize logic since it's already correct and user-approved.
- I recommend extracting a reusable "player state manager" and leaving component markup largely untouched.

## Current Observations
- There are multiple audio players (`AudioSummaryPlayer`, `AudioPlaylistPlayer`, `PodcastPlayer`).
- They appear to share behaviors (play/pause, progress, volume, speed, minimization when scrolled out of view).
- Cross-player coordination exists (starting a new player stops another).

## Goals to Clarify
- Should there be one global player state (only one audio source at a time) or per-player state?
- Should the mini-player be shared across all audio instances or per instance?
- What are the exact rules for switching between players?
- When a player is out of view, should it always minimize or only when playing?
- How should the page behave on route changes (`astro:after-swap`)?

## Option A: Single Engine Module + Config
Use a shared module that accepts a root element + config.

Pros:
- One source of truth for audio behavior.
- Consistent UX across all players.
- Easier to coordinate cross-player switching.

Cons:
- Requires unifying markup or writing more conditional logic.
- Harder to evolve a single component independently.

Implementation sketch:
- `src/scripts/audio-player-engine.ts`
- Exports `initAudioPlayer(root, options)`
- Options define selectors (play button, progress bar, mini player, etc.)
- A global registry controls “only one audio at a time” policy.

## Option B: Per-Component Modules + Shared Utilities
Keep separate player modules, but factor shared pieces into helpers.

Pros:
- Each component remains easy to reason about.
- No large conditional engine.
- Easier to experiment with UX per component.

Cons:
- More total JS.
- Some duplication unless utilities are well factored.

Implementation sketch:
- `src/scripts/audio-utils.ts` for `formatTime`, progress handlers, volume/speed helpers.
- Each component module calls shared helpers and registers with a small `audio-registry` module for cross-player coordination.

## Option C: One Global Mini-Player
Players only provide a source + metadata; a global mini-player is the actual control surface.

Pros:
- Very clean UX and consistent control surface.
- Reduced duplicate UI.

Cons:
- Larger refactor to UI/markup.
- More design decisions needed.

## Recommendation (Tentative)
Start with Option B to keep risk low while still reducing duplication.
If the UX is stable and you want stronger consistency, move to Option A later.

## Refactoring Tasks (Proposed Plan)
1. Inventory current player implementations and list shared behaviors and unique behaviors.
2. Define a per-audio state shape (id, currentTime, duration, isPlaying, volume, speed, lastUpdated).
3. Implement a shared registry/store module for per-audio state + active audio enforcement.
4. Refactor each player to read/write state via the shared module.
5. Ensure mini and mini-mini players bind to the same per-audio state.
6. Validate switch behavior: stopping, resuming, and saved timestamps per audio.
7. Regression check: scroll minimization, speed, volume, playlist handling, route swaps.

## Open Questions for You
- Do you want a shared global mini-player or per-player mini controls?
- Should starting any player always stop all others immediately?
- Should paused players stay minimized when out of view, or only active ones?
- Any player-specific UI behavior that should remain unique?
