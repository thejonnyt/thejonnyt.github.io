# Playwright Test Fixes

## Goal
Resolve failing Playwright tests after adding the smoke suite.

## Issues observed
- Cloudflare analytics requests emit console/page errors in local test runs.
- Footer social link selectors are ambiguous across header/hero/footer.

## Plan and progress
- [x] Filter/ignore Cloudflare analytics errors in Playwright error collection.
- [x] Scope footer link assertions to the footer container.
- [x] Re-run `npm run test:e2e` and verify all tests pass.
