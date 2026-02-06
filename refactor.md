# Inline Script Refactor Plan

## Progress
- [ ] Finished

## Checklist
- [x] Move `InteractiveBackground` script to `src/scripts/interactive-background.ts`.
- [x] Move `Header` script to `src/scripts/header-scroll.ts`.
- [x] Move `SkillTag` tooltip script to `src/scripts/skill-tooltips.ts`.
- [x] Move Cloudflare analytics loader to `src/scripts/analytics-cloudflare.ts`.
- [x] Move `TechnicalTermTooltip` script to `src/scripts/tech-term-tooltips.ts`.
- [ ] Move `AudioSummaryPlayer` script to `src/scripts/audio-summary-player.ts`.
- [ ] Move `AudioPlaylistPlayer` script to `src/scripts/audio-playlist-player.ts`.
- [ ] Move `PodcastPlayer` script to `src/scripts/podcast-player.ts`.
- [x] Move `CopyResumeButton` script to `src/scripts/copy-resume.ts`.
- [x] Move `MagneticContactCarousel` script to `src/scripts/magnetic-contact-carousel.ts`.
- [ ] Move `SkillsRadar` script to `src/scripts/skills-radar.ts`.
- [ ] Move experience data bootstrap to a module (`src/scripts/experience-toggle.ts` or similar).
- [ ] Move home page interactions to `src/scripts/home-interactions.ts` for EN/DE pages.

## Goals
- Reduce inline JS in Astro components and pages.
- Centralize client scripts in a dedicated directory.
- Keep tiny bootstraps inline only when needed to pass page data.

## Proposed Structure
- `src/scripts/` for client modules.
- Each component/page initializes its script by importing a small module or by using a tiny inline bootstrap that calls a global initializer.

## Inventory + Proposed Moves
1. `src/layouts/BaseLayout.astro` (inline JS)
   - Purpose: Lazy-load Cloudflare Web Analytics on idle.
   - Proposed module: `src/scripts/analytics-cloudflare.ts`
   - Inline bootstrap: Optional (could be a single `initCloudflareAnalytics()` call).

2. `src/layouts/BaseLayout.astro` (JSON-LD script tag)
   - Purpose: Structured data for SEO.
   - Keep inline (not JS behavior).

3. `src/components/InteractiveBackground.astro`
   - Purpose: Canvas-based interactive dot grid background.
   - Proposed module: `src/scripts/interactive-background.ts`
   - Init strategy: Component adds `data-interactive-bg` and script locates canvas by id.

4. `src/components/Header.astro`
   - Purpose: Scroll progress bar + active section highlighting.
   - Proposed module: `src/scripts/header-scroll.ts`
   - Init strategy: Run on `DOMContentLoaded`, re-run on `astro:after-swap`.

5. `src/components/SkillTag.astro`
   - Purpose: Tooltip positioning logic on hover/focus.
   - Proposed module: `src/scripts/skill-tooltips.ts`
   - Init strategy: Export `initSkillTooltips()` and call on load + `astro:after-swap`.

6. `src/components/TechnicalTermTooltip.astro` (define:vars)
   - Purpose: Global glossary tooltip with injected glossary JSON.
   - Proposed module: `src/scripts/tech-term-tooltips.ts`
   - Init strategy: Keep a minimal inline bootstrap that passes `glossaryJson` to `initTechTermTooltips(glossaryJson)`.

7. `src/components/AudioSummaryPlayer.astro`
   - Purpose: Custom audio player with mini player + controls.
   - Proposed module: `src/scripts/audio-summary-player.ts`
   - Init strategy: Component adds `data-src` and `data-title` as already, module queries `.audio-summary-player-wrapper`.

8. `src/components/AudioPlaylistPlayer.astro`
   - Purpose: Audio playlist logic and UI state.
   - Proposed module: `src/scripts/audio-playlist-player.ts`
   - Init strategy: Use `data-*` attributes for track metadata (if needed).

9. `src/components/PodcastPlayer.astro`
   - Purpose: Podcast player logic.
   - Proposed module: `src/scripts/podcast-player.ts`

10. `src/components/CopyResumeButton.astro` (define:vars)
    - Purpose: Copy/download CV actions.
    - Proposed module: `src/scripts/copy-resume.ts`
    - Init strategy: Inline bootstrap passing `rootId`, `downloadButtonId`, `copyButtonId`, `cvSource` to initializer.

11. `src/components/MagneticContactCarousel.astro` (define:vars)
    - Purpose: Magnetic CTA + carousel logic.
    - Proposed module: `src/scripts/magnetic-contact-carousel.ts`
    - Init strategy: Inline bootstrap passing `cvSource` to initializer.

12. `src/components/SkillsRadar.astro` (define:vars)
    - Purpose: Skills radar drawing and interactions.
    - Proposed module: `src/scripts/skills-radar.ts`
    - Init strategy: Inline bootstrap passing `categoryData`, `proficiencyPoints`, `experiencePoints`, `center`, `maxRadius`, `initialDetailsText`.

13. `src/pages/index.astro` (define:vars)
    - Purpose: Expose `experienceData` to client.
    - Proposed module: `src/scripts/experience-toggle.ts`
    - Init strategy: Inline bootstrap assigns data to `window.__experienceData` or uses `data-*` on a wrapper element.

14. `src/pages/index.astro` (inline JS)
    - Purpose: Experience toggle, lazy video embed, audio summary auto-play.
    - Proposed module: `src/scripts/home-interactions.ts`
    - Note: Split into 2 modules if you want stricter separation (experience toggle vs media embeds).

15. `src/pages/de/index.astro` (define:vars)
    - Purpose: Expose `experienceData` to client.
    - Proposed module: Same as `src/scripts/experience-toggle.ts`.

16. `src/pages/de/index.astro` (inline JS)
    - Purpose: Same interactions as EN page with localized strings.
    - Proposed module: Same `src/scripts/home-interactions.ts` with localized copy passed via `data-*` or inline bootstrap.

## Suggested Order of Refactor
1. Move shared, low-coupling scripts first: `header-scroll`, `skill-tooltips`, `interactive-background`.
2. Move page-level interactions: `home-interactions`, `experience-toggle` with data attributes.
3. Move component players: `audio-summary`, `audio-playlist`, `podcast`.
4. Move data-heavy scripts that need inline bootstraps: `skills-radar`, `tech-term-tooltips`, `copy-resume`, `magnetic-contact-carousel`.

## Open Decisions
- Whether to keep `window.__experienceData` or move to a `data-experience` attribute on a wrapper element.
- Whether to consolidate audio player logic or keep per-component modules.
