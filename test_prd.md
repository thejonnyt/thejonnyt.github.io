# Playwright Test Suite PRD

## Objective
Add a Playwright-based end-to-end test suite that verifies the most important UI components and interactions for the Astro portfolio site.

## Goals
- Validate core page rendering for EN/DE routes.
- Catch regressions in interactive components (toggles, language switcher, copy buttons).
- Provide a small, reliable smoke suite for pre-release checks.

## Non-goals
- Visual regression testing.
- Deep component unit testing.
- Performance or accessibility audits.

## Scope and progress (by component)
| Component / Area | Coverage | Status | Notes |
| --- | --- | --- | --- |
| Header navigation | Link presence + structure | Done | `tests/site-smoke.spec.ts` |
| Language switcher | EN to DE route change | Done | `tests/site-smoke.spec.ts` |
| Bio toggle | Expand/collapse behavior | Done | `tests/site-smoke.spec.ts` |
| Experience toggle | Hidden items reveal | Done | `tests/site-smoke.spec.ts` |
| Audio summary | Player reveal on click | Done | `tests/site-smoke.spec.ts` |
| Footer social links | GitHub + LinkedIn presence | Done | `tests/site-smoke.spec.ts` |
| Copy buttons (header/footer) | Clipboard JSON | Done | `tests/copy-button.spec.ts` |
| Magnetic carousel copy card | Clipboard JSON | Done | `tests/copy-button.spec.ts` |
| Skills radar | Presence + basic render | Pending | Add SVG sanity checks |
| Podcast player | Presence + play trigger | Pending | Add once selectors stabilized |

## Tasks and progress
- [x] Confirm Playwright config and test runner wiring.
- [x] Add core smoke tests for page structure and navigation.
- [x] Add interaction tests for expandable sections.
- [ ] Add visual/structural smoke checks for SVG-heavy components (SkillsRadar).
- [ ] Add media component smoke checks (Podcast/Audio players) without autoplay dependency.

## Success metrics
- `npm run test:e2e` passes locally.
- Core UI regressions are caught before release.
- Tests run under 1 minute on a warm dev server.

## Risks and mitigations
- Flaky media playback: avoid asserting on playback state, only on UI visibility.
- Content changes: prefer stable selectors (ids, aria labels).
