# Website Improvements Backlog

This backlog lists potential improvements based on a repository review. Priorities are indicative and can be re-ordered as goals change.

Legend: P0 = critical, P1 = high, P2 = medium, P3 = low.

| ID | Priority | Area | Improvement | Notes / Example | Resolved |
| --- | --- | --- | --- | --- | --- |
| IMP-001 | P0 | Accessibility | Fix broken skip link on the German page | `BaseLayout` includes `#main-content`, but `src/pages/de/index.astro` lacks `id="main-content"`. | ✅ |
| IMP-002 | P0 | Accessibility | Make DE project video toggles keyboard accessible | Replace `.video-thumbnail` div with a button and add `aria-expanded` + `aria-controls`. | ✅ |
| IMP-003 | P1 | Accessibility | Add ARIA state/controls to DE bio toggle | EN uses `aria-expanded` + `aria-controls`; mirror in `src/pages/de/index.astro`. | ✅ |
| IMP-004 | P1 | Accessibility | Add keyboard/focus support for skill tooltips | Make `.skill-tag` focusable and show tooltip on focus; add `aria-describedby`. | ⬜ |
| IMP-005 | P1 | i18n | Align DE/EN experience toggles | EN has show-more logic with hidden entries; DE does not. Decide on parity. | ✅ |
| IMP-006 | P1 | SEO | Dynamic canonical/og URLs per locale | Use `Astro.url` to set `canonical`, `og:url`, and `og:locale` (`de_DE` vs `en_US`). | ✅ |
| IMP-007 | P1 | SEO | Add social preview images | Provide `og:image` and `twitter:image` for share cards. | ✅ |
| IMP-008 | P2 | SEO | Add `hreflang` alternates | Link EN/DE versions via `<link rel="alternate" hreflang="...">`. | ✅ |
| IMP-009 | P2 | Performance | Reduce always-on animation work | Pause `InteractiveBackground` on `prefers-reduced-motion` and on hidden tabs; avoid full rAF loop when idle. | ✅ |
| IMP-010 | P2 | Performance | Lazy-load heavy components | Consider `client:visible` for `SkillsRadar`, `PodcastPlayer`, `AudioSummaryPlayer`. | ✅ |
| IMP-011 | P2 | Visual Consistency | Theme-aware LinkedIn badge | The badge is forced dark; switch to light in light mode or style container to match. | ⬜ |
| IMP-012 | P2 | Content | Fix placeholder social link in footer | `src/components/Footer.astro` uses `https://linkedin.com/in/yourprofile`. | ⬜ |
| IMP-013 | P2 | UX | Add navigation anchors for missing sections | Add `Skills`, `Publications`, `Awards` to header nav or remove sections from layout. | ⬜ |
| IMP-014 | P3 | Security | Add SRI or self-host third-party scripts | `unpkg` Lucide and LinkedIn scripts load without integrity checks. | ⬜ |
| IMP-015 | P3 | QA | Add CI checks for build and link scan | GitHub Actions step to run `npm run build` and optionally `node tests/check-links.mjs`. | ⬜ |
| IMP-016 | P3 | UX | Provide a custom 404 page | Add `src/pages/404.astro` with language-aware copy. | ⬜ |
