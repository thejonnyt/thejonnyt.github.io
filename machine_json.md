# Machine-Readable CV JSON Generator (PRD)

## Overview
Add a click-triggered generator that assembles a machine-readable CV JSON from the live site content (hero profile, experience, education, projects, publications, awards, and skills). The output must be concise, stable, and suitable for external parsing or AI ingestion.

## Goals
- Restore the JSON copy buttons (header + footer) and ensure they generate JSON on click.
- Include hero profile data, all job descriptions, and the full skills database.
- Provide a concise, machine-friendly skill model grouped by proficiency with years of experience.
- Keep the output language aligned with the current page (EN/DE).

## Non-Goals
- No backend endpoints or file downloads (clipboard-only output).
- No changes to the underlying content JSON files.
- No new UI for editing skills or the CV.

## Users & Use Cases
- Recruiters / ATS: ingest structured CV data.
- Automation tools: parse skills by proficiency and years.
- Site owner: quick export of the latest CV data.

## Data Model (Proposed)
Top-level structure:
- `profile`: hero profile (intro content JSON).
- `experience`: full experience entries with descriptions and achievements.
- `education`, `projects`, `publications`, `awards`.
- `skills`: concise skills list + proficiency grouping.
- `meta`: generator metadata.

Skills structure:
- `skills.schema`: brief description of list format and ordering
- `skills.order`: explicit ordering for consumers
- `skills.<proficiency>`: array of strings in `Skill(Years)` format (e.g., `skills.expert`)
- `skills.totalCount`: number of skills
Notes:
- Proficiency groups live directly under `skills` for easy consumption.
- Each entry uses `Skill(Years)`; omit `(Years)` when unknown.

Proficiency mapping (initial):
- `beginner` -> `beginner`
- `competent` -> `intermediate`
- `proficient` -> `advanced`
- `expert` -> `expert`
- `wizard` -> `wizard`

## Acceptance Criteria
- Clicking the JSON copy button in the header or footer generates JSON and copies it to the clipboard.
- Output includes `profile`, `experience`, and `skills` from the current language.
- Skills are grouped by proficiency and include years of experience.
- JSON is valid and stable across multiple clicks.
- No runtime errors when data is missing or optional fields are empty.

## UX Notes
- Reuse existing tooltip + toast feedback.
- No additional UI controls required.

## Technical Approach
- Pass content data to `CopyResumeButton` and `MagneticContactCarousel` as props.
- Generate the JSON on click in client-side script (no pre-baked `data-cv` string).
- Build a small helper function that:
  - normalizes skill levels
  - groups skills by proficiency
  - sorts skills by years (desc) then name
  - injects metadata with `generatedAt`

## Risks / Edge Cases
- Missing skills database or empty fields.
- Astro page transitions requiring re-initialization of click handlers.
- Clipboard API unavailable (fallback required).

## Progress Tracking
- [x] Define final JSON schema and proficiency mapping
- [x] Update `CopyResumeButton` to accept content props and generate JSON on click
- [x] Update `Header` and `Footer` to pass content data down
- [x] Update `MagneticContactCarousel` to use the same generator
- [x] Add Astro transition-safe initialization and fallback copy flow
- [x] Validate in both EN and DE pages
