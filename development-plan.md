# Cache Me Outside Development Plan

This document translates [plan.md](file:///c:/Users/LENOVO/Desktop/cachemeout/plan.md) into an execution-focused development plan.

## Goal

Ship a production-ready MVP of `Cache Me Outside` that:

- supports `2020` only
- renders public year, month, and day archive pages
- uses reviewed admin-managed entries as the only public source of truth
- keeps the admin surface hidden behind stealth auth
- allows admin access on desktop devices only

## Non-Negotiables

- Scope is limited to `2020`.
- No live scraping.
- No offline scraping.
- No live third-party API dependency for MVP generation.
- Public pages must never show draft content.
- Admin routes and admin APIs must return `404 Not Found` when unauthorized.
- Mobile devices must not be able to access admin pages, preview pages, or admin APIs.

## Delivery Strategy

Build the app in vertical slices instead of building all frontend first and all backend later.

Recommended order:

1. Public routing and data model foundation
2. Stealth admin access and desktop-only enforcement
3. Admin content management
4. Generator-to-draft workflow
5. Preview and publishing flow
6. Public rendering, SEO, and caching
7. QA, security hardening, and deployment

## Workstreams

### 1. App shell and routing

Deliverables:

- `app/page.tsx` redirects to `/2020`
- `app/2020/page.tsx` renders the year overview
- `app/2020/[month]/page.tsx` renders month pages
- `app/2020/[month]/[day]/page.tsx` renders day pages
- route params validate against 2020-only constraints

Acceptance criteria:

- `/` redirects to `/2020`
- invalid years return `404`
- invalid month/day combinations return `404`
- public routes render on mobile and desktop

### 2. Data model and persistence

Deliverables:

- `capsule_entries` table
- `capsule_drafts` table
- `period_seo` table
- `admin_audit_log` table
- indexes and uniqueness constraints from the product plan

Acceptance criteria:

- published and draft content are stored separately
- `slug + period_start` uniqueness is enforced
- period validation rules are enforced in application logic
- origin tracking exists for `manual`, `generated_draft`, and `curated_seed`

### 3. Stealth admin access

Deliverables:

- hidden public trigger form
- `POST /api/admin/access/start`
- email delivery with the magic link only
- authenticator app verification for the second factor
- `POST /api/admin/access/verify`
- short-lived session creation
- middleware for `/admin/*` and `/api/admin/*`

Acceptance criteria:

- unauthorized admin page requests return `404 Not Found`
- unauthorized admin API requests return `404 Not Found`
- mobile requests to admin pages and admin APIs return `404 Not Found`
- secret-word endpoint is rate-limited and always responds vaguely
- dev mode can log the magic link when email is disabled
- wrong authenticator-app code never creates a session

### 4. Desktop-only admin experience

Deliverables:

- device detection guard for admin pages
- device detection guard for admin APIs
- clear desktop-only messaging during verified flows where appropriate

Acceptance criteria:

- verified mobile sessions still cannot access `/admin/*`
- preview is blocked on mobile
- desktop sessions can complete full admin workflows

### 5. Admin CMS

Deliverables:

- admin entry list
- create entry form
- edit entry form
- publish and archive actions
- source, image, and SEO editing fields
- admin search and filters

Acceptance criteria:

- admin can manually create a published entry without using the generator
- admin can edit title, summary, tags, source data, image data, and SEO fields
- all write actions are logged to `admin_audit_log`

### 6. Generator workflow

Deliverables:

- `curated-2020.json` seed source
- deterministic draft generation logic
- `POST /api/admin/generate`
- draft storage in `capsule_drafts`

Acceptance criteria:

- generator uses only curated seed data, templates, and optional admin notes
- generator never publishes content directly
- generated drafts include content fields and image metadata
- generator failures do not affect public pages

### 7. Review and preview flow

Deliverables:

- draft review table
- approve, reject, and needs-edit actions
- admin preview route
- `DRAFT PREVIEW` watermark
- publish pipeline from draft to entry

Acceptance criteria:

- preview uses the same rendering component as the public page
- preview can combine published entries with selected draft entries
- public pages never expose draft content
- preview is desktop-only and admin-only

### 8. Public rendering

Deliverables:

- reusable `NewspaperPage`
- section assembly logic for year/month/day pages
- ranking and deterministic summary logic
- source badges
- graceful empty-state handling

Acceptance criteria:

- year, month, and day pages render from published entries only
- international meme/editorial focus is reflected in content sections
- sparse dates still render a credible page state

### 9. SEO and caching

Deliverables:

- `period_seo` override support
- featured-entry fallback for metadata
- `sitemap.xml`
- `robots.txt`
- route revalidation after publish, unpublish, or SEO changes

Acceptance criteria:

- each public page has stable metadata
- cache revalidation runs after admin changes
- admin routes and preview responses are never publicly cached

### 10. QA and release readiness

Deliverables:

- route validation tests
- auth flow tests
- admin guard tests
- publish/unpublish verification
- preview isolation checks
- manual regression checklist

Acceptance criteria:

- desktop-only admin restrictions are verified
- unauthorized admin access always returns `404`
- wrong authenticator-app code never creates a session
- public pages hide drafts
- publish flow updates public pages after revalidation

## Milestones

### Milestone 1: Foundation

Scope:

- routing
- schema creation
- base public page shell

Done when:

- `/2020` renders
- database schema exists
- test data can be loaded manually

### Milestone 2: Secure admin access

Scope:

- stealth auth
- desktop-only enforcement
- admin middleware

Done when:

- desktop admin session can be created
- mobile and unauthorized requests get `404`

### Milestone 3: Content operations

Scope:

- entry CRUD
- draft generation
- review workflow
- preview flow

Done when:

- admin can generate, review, preview, and publish content for a selected 2020 period

### Milestone 4: Public quality

Scope:

- final public rendering
- SEO
- caching
- polish

Done when:

- public routes render published content with stable metadata
- caching and revalidation work

### Milestone 5: Release

Scope:

- deployment
- QA
- smoke tests
- initial content seeding

Done when:

- the app is live
- strongest 2020 periods are seeded
- release checklist passes

## Implementation Order

### Phase 1: Setup

Tasks:

- initialize Next.js app structure if not already present
- configure TypeScript and Tailwind
- set up Supabase connection
- create environment variable template

### Phase 2: Database and types

Tasks:

- create SQL migrations
- define TypeScript types for entries, drafts, period SEO, and audit log
- add validation helpers for period parsing

### Phase 3: Public routes

Tasks:

- implement redirect from `/` to `/2020`
- build year, month, and day route loaders
- add `404` handling for invalid periods

### Phase 4: Auth and admin guard

Tasks:

- implement secret-word request endpoint
- integrate email sender
- implement magic-link verification and authenticator-app code validation
- create session cookie logic
- add middleware for auth, desktop-only checks, and `404` concealment

### Phase 5: Admin CMS

Tasks:

- build entry list and entry form
- build publish/archive actions
- add audit logging for admin actions
- add image and source review inputs

### Phase 6: Generator and drafts

Tasks:

- create curated data loader
- build deterministic draft generator
- save generated drafts to database
- build review table and review actions

### Phase 7: Preview and publish

Tasks:

- create preview assembler
- add `DRAFT PREVIEW` watermark
- implement draft-to-entry publish flow
- trigger cache revalidation after publish/unpublish

### Phase 8: Public presentation

Tasks:

- build `NewspaperPage`
- implement ranking and summary helpers
- render source badges
- add empty and sparse-data states

### Phase 9: SEO and release tooling

Tasks:

- support `period_seo`
- generate `sitemap.xml`
- create `robots.txt`
- verify metadata fallback behavior

### Phase 10: QA and deployment

Tasks:

- run functional checks
- run auth and access checks
- verify mobile block on admin
- deploy to production
- seed initial 2020 showcase periods

## Dependencies

Build dependencies:

- Next.js App Router
- Supabase Postgres
- email provider for magic-link delivery

Operational dependencies:

- production environment variables
- domain and deployment target
- a curated `2020` seed dataset

## Risks and Mitigations

### Email delivery issues

Mitigation:

- support resend with backoff
- support local console-link fallback in development
- document production recovery path

### False device detection

Mitigation:

- use conservative server-side detection
- fail closed for admin access
- test common tablet and mobile user agents

### Draft leakage

Mitigation:

- keep preview admin-only
- never query drafts in public loaders
- add regression tests for public pages

### Scope creep

Mitigation:

- reject any request that expands beyond `2020`
- defer live APIs, extra years, and user accounts until after launch

## Definition of Done

The MVP is done when:

- public users can browse `2020`, a month, and a day
- only published entries render publicly
- admin access works on desktop only
- unauthorized and mobile admin requests return `404`
- generator creates drafts from curated data
- admin can review image and content quality before publishing
- preview is admin-only and desktop-only
- SEO metadata and caching work on public routes
- test checklist from [plan.md](file:///c:/Users/LENOVO/Desktop/cachemeout/plan.md) passes

## Suggested First Build Ticket List

1. Create database schema and migrations.
2. Implement `/` to `/2020` redirect and public route validation.
3. Build admin concealment middleware for `/admin/*` and `/api/admin/*`.
4. Implement secret-word request endpoint with rate limiting.
5. Implement email-based magic-link plus authenticator-app verification.
6. Add desktop-only device checks for admin routes and APIs.
7. Build admin entry CRUD.
8. Build generator draft creation from `curated-2020.json`.
9. Build draft review and preview flow.
10. Build public `NewspaperPage` rendering from published data.
11. Add SEO, sitemap, robots, and revalidation.
12. Run QA checklist and deploy.
