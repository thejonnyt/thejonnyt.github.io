# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds all site code: `src/pages/` for route pages, `src/components/` for reusable Astro components, `src/layouts/` for page shells, and `src/styles/` for global CSS.
- Content is JSON-driven in `src/content/` (e.g., `src/content/experience/data.json`), which powers the resume sections.
- Static assets live in `public/` (images, fonts, downloadable files). Production builds land in `dist/`.
- Link checking lives in `tests/check-links.mjs` and writes `link-check-report.md`.

## Build, Test, and Development Commands
- `npm run dev` starts the Astro dev server at `http://localhost:4321` with hot reload.
- `npm run build` builds the static site into `dist/`.
- `npm run preview` serves the production build locally for verification.
- `npx astro check` runs Astro/TypeScript diagnostics.
- `node tests/check-links.mjs` scans files for URLs and checks link health (network required).

## Coding Style & Naming Conventions
- Use 2-space indentation in CSS/JSON/JS/TS; keep formatting consistent with existing files.
- Prefer descriptive, section-based component names (e.g., `Header.astro`, `Footer.astro`).
- JSON content uses ISO date strings (`YYYY-MM` or `present`) and arrays for lists.
- Global styles belong in `src/styles/global.css`; component styles stay in `.astro` files.

## Testing Guidelines
- There is no unit test framework configured.
- Use `node tests/check-links.mjs` before releases; review `link-check-report.md` for failures.
- If adding tests, place them under `tests/` and document the command here.

## Commit & Pull Request Guidelines
- Recent commits use short, imperative summaries and often a `feat:`-style prefix; follow the same pattern.
- Keep commits focused on a single change area when possible.
- PRs should include a clear description, testing notes, and screenshots for UI changes.
- Link relevant issues or add context when changes affect content structure or deployment.

## Deployment Notes
- GitHub Actions deploys on pushes to `main`; ensure `npm run build` is clean locally.
- Content edits typically only require updating JSON in `src/content/`.
