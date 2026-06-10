# Cache Me Outside Sprint Plan

## Concept

Cache Me Outside is a no-login, newspaper-style internet time capsule focused on one year only: `2020`.

The public experience should let a user browse:

- the `2020` overview page
- a `2020` month page
- a `2020` day page

Every public page should feel editorial, stable, and reviewable. The app should not depend on live scraping, offline scraping, or uncontrolled third-party output. All public content should come from reviewed admin-managed entries, with memes and viral moments selected through an international lens rather than a US-only timeline.

## MVP Direction

Build the first version around one dependable promise:

> Pick a date in 2020 and see what the internet was paying attention to, presented as a newspaper front page.

The MVP should be intentionally narrow. It is not a full internet-history engine yet. It is a polished, admin-reviewed 2020 archive.

### MVP includes

- One supported year: `2020`.
- Root route `/` that immediately redirects to `/2020`.
- Public routes for `2020`, month pages inside `2020`, and day pages inside `2020`.
- Newspaper-style public layout.
- Admin-managed capsule entries as the source of truth.
- A data-generation tool that prepares draft entries for 2020 periods.
- A desktop-only admin page where you audit generated image and content before publishing.
- Published and draft states.
- SEO-friendly public pages with stable URLs and metadata.
- Shareable URLs.
- Mobile-responsive layout.
- Graceful empty and partial-data states.

### MVP excludes

- Any year outside `2020`.
- Offline scraping of any source.
- Live scraping during requests.
- Full Reddit archive search.
- Paid historical news search.
- AI-generated summaries in the public experience.
- User accounts for the public app.
- User-submitted comments, voting, or saved capsules.

## Data Ownership Model

The product should treat reviewed admin data as the only public source of truth.

The flow should be:

```txt
Generator tool
  -> create draft rows for a 2020 period
  -> admin audit image + content
  -> edit and approve
  -> publish normalized capsule entries
  -> render public archive
```

This keeps the public archive fast, stable, and editorially controlled. It also means you can reject low-quality images, fix weak copy, and keep the public site from showing raw machine output.

## Admin CMS Scope

Build a small internal admin area for managing the 2020 archive.

The admin area is desktop-only by design. Mobile devices should not be allowed to access admin pages or admin API actions.

### Admin routes

```txt
/admin
/admin/entries
/admin/entries/new
/admin/entries/[id]
/admin/generator
/admin/verify
/admin/review?period=2020-03
/admin/preview?period=2020-03
```

### Admin capabilities

- Create and edit capsule entries manually.
- Trigger the data-generation tool for a month or day in `2020`.
- Review generated drafts before they become public.
- Audit image quality, image relevance, alt text, and source attribution.
- Audit title, summary, tags, source links, category, and international relevance.
- Mark each generated draft as approved, rejected, or needs edit.
- Mark entries as draft, published, or archived.
- Preview how a `2020` year, month, or day page will look before publishing.
- Search and filter entries by date, category, source, and status.
- Add editorial notes visible only in admin.
- Edit SEO title, SEO description, slug, canonical URL, and Open Graph preview per period.
- Restrict all admin tasks to desktop devices only.

### Admin review checklist

For every generated draft, review:

- Is the image safe, relevant, and high enough quality?
- Is the title accurate and readable?
- Is the summary correct and worth publishing?
- Are the source URL and source name correct?
- Are the category and tags useful for ranking?
- Does this reflect international internet culture, not just one country or platform bubble?
- Does this belong on the selected 2020 date?

### Admin auth

Use a stealth access flow instead of a visible login screen.

### How the flow works

#### Public page

The public page contains a hidden form where you type the secret word, for example `secretpage`.

#### Email trigger

When the correct word is submitted, the server sends an email to your pre-configured address.

The email contains:

- a magic link with a one-time token

Instead, the email contains only the magic link.

The numeric code is sent through a separate channel:

- an authenticator app such as Google Authenticator

#### Authentication

You click the magic link and land on a verification page that asks for the numeric code. You then enter the code from your authenticator app.

#### Session creation

After the correct code is entered, the server creates a short-lived, non-transferable admin session bound to a lightweight fingerprint: IP prefix, user agent, and a short-lived server-issued session token. Do not bind to a full raw IP only, because mobile and corporate networks can rotate IP addresses mid-session.

#### Admin page access

Only that verified session can access the admin area, and only from a desktop-class device. Unauthenticated visitors should receive a `404 Not Found` response so they cannot tell the admin route exists. Mobile devices should also receive `404 Not Found` for admin pages and admin APIs.

### Admin auth requirements

- Hidden trigger form on the public page.
- Secret word check on the server.
- Email delivery to one pre-configured admin inbox only.
- Rate limiting on the secret-word endpoint with a vague success response even on failure.
- One-time magic-link token with expiration.
- Second-factor numeric code with expiration, generated from an authenticator app.
- Resend flow with exponential backoff.
- Development fallback that logs the magic link to the server console when email is disabled locally.
- Production fallback plan using either a second email provider or a clearly documented recovery path.
- Verification page that requires the correct authenticator-app code after the magic link.
- Short-lived admin session bound to IP prefix and user agent.
- Desktop-device check before granting admin access or accepting admin API writes.
- Re-authentication for sensitive admin write actions after a short idle window.
- Admin middleware that returns `404 Not Found` for all unauthenticated or invalid admin page requests.
- The same `404 Not Found` protection must apply to every `/api/admin/*` route.

Suggested defaults:

- magic-link token expiry: 10 minutes
- authenticator code step uses a time-based rolling code window
- admin session TTL: 5 to 10 minutes
- secret-word attempts: 3 per hour per IP

This is the default MVP auth approach for the admin route because it keeps the admin surface hidden, makes the route appear nonexistent to unauthenticated visitors, and still gives you a second factor from a separate channel before session creation.

Desktop-only rule:

- Public pages are responsive on mobile and desktop.
- Admin pages, preview pages, and admin API actions are desktop-only.
- If the request comes from a mobile device, the app should return `404 Not Found` for `/admin/*` and `/api/admin/*`.

## Source Strategy

The plan should not rely on scraping. Instead, use a controlled generator pipeline.

### Source reliability matrix

| Source | Use in MVP | Reliability | Notes |
|---|---:|---:|---|
| Admin-reviewed entries | Yes | High | Only public source of truth. |
| Generator tool output | Yes | Medium | Draft input only. Must be reviewed before publish. |
| Curated 2020 seed data | Yes | High | Good for initial coverage and demos. |
| Wikimedia Pageviews | No for MVP | High | Defer until after launch to keep the generator deterministic. |
| Reddit API | No for MVP | Medium | Defer until after launch to avoid live dependency and ambiguity. |
| Any scraping flow | No | Low | Explicitly out of scope. |

### Recommended MVP data strategy

#### Primary source: admin-reviewed entries

Use admin-reviewed entries as the canonical source for:

- Front-page headlines
- International meme and viral moment lists
- Period summaries
- Pull quotes
- Opinions and public reaction summaries
- Source links
- Confidence labels

#### Input source: generator tool

The generator tool should create draft data for a selected `2020` period.

For MVP, the generator should use only:

- `curated-2020.json`
- deterministic templates
- optional admin-entered notes or tags

Do not call live third-party APIs during MVP generation. This keeps the generator predictable and keeps the no-scraping, no-live-dependency promise solid.

It can prepare:

- draft title
- draft summary
- source name
- source URL
- category
- tags
- suggested image URL
- image attribution
- confidence hint

The tool should never publish directly. It only prepares drafts for admin review.

#### Starter source: curated 2020 seed data

Create a local seed file of known 2020 internet moments with an international focus so the first version reflects global internet culture, not just US-centric events.

Examples:

- `2020-01`: Kobe Bryant tributes, early pandemic attention
- `2020-03`: lockdown memes, Tiger King, Animal Crossing hype, globally shared quarantine humor
- `2020-05`: 6ix9ine return, PS5/Xbox hype, online concert culture
- `2020-08`: WAP discourse, TikTok ban talk, cross-market TikTok meme spillover
- `2020-10`: Borat 2, Among Us popularity, and globally shared reaction formats
- `2020-11`: international internet reactions to major world events and platform-wide meme cycles

Once the database-backed admin exists, move seed entries into managed records.

## Suggested Tech Stack

- Current stable Next.js with App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres for entries and drafts
- Server-side API routes for generation and admin actions

Keep all data generation and third-party calls server-side so retries, caching, and credentials stay controlled.

## App Architecture

Use a simple layered structure:

```txt
app/
  page.tsx
  2020/page.tsx
  2020/[month]/page.tsx
  2020/[month]/[day]/page.tsx
  api/capsule/route.ts
  api/admin/access/start/route.ts
  api/admin/access/verify/route.ts
  api/admin/generate/route.ts

components/
  NewspaperPage.tsx
  PeriodPicker.tsx
  Breadcrumbs.tsx
  SourceBadge.tsx
  LoadingNewspaper.tsx
  admin/
    EntryForm.tsx
    EntryTable.tsx
    DraftReviewTable.tsx
    ImageAuditCard.tsx
    CapsulePreview.tsx

lib/
  capsule/
    buildCapsule.ts
    rankItems.ts
    summarize.ts
    types.ts
  generator/
    createDrafts.ts
    normalizeDraft.ts
  providers/
    managedEntries.ts
    curated2020.ts
    wikimedia.ts
  admin/
    auth.ts
    entries.ts
    review.ts

data/
  curated-2020.json
```

`app/page.tsx` should do a simple server-side redirect to `/2020`.

The public app should only read published entries. The generator tool should only write drafts. Admin review should be the gate between them.

All `/api/admin/*` routes should share the same stealth auth guard as `/admin/*` and return `404 Not Found` when the session is missing or invalid.

The same guard should also deny mobile devices and return `404 Not Found` so the admin surface stays invisible outside desktop use.

## Data Model

### Public entries table

```sql
create table capsule_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text,
  source_name text,
  source_url text,
  image_url text,
  image_alt text,
  image_source_url text,
  image_license text,
  category text not null,
  tags text[] not null default '{}',
  period_start date not null,
  period_end date,
  period_granularity text not null,
  origin text not null default 'manual',
  confidence text not null default 'medium',
  status text not null default 'draft',
  featured boolean not null default false,
  editorial_note text,
  opinion text,
  quote text,
  seo_title text,
  seo_description text,
  slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, period_start)
);
```

Suggested values:

- `period_granularity`: `day`, `month`, `year`
- `origin`: `manual`, `generated_draft`, `curated_seed`
- `confidence`: `high`, `medium`, `low`
- `status`: `draft`, `published`, `archived`
- `category`: `meme`, `viral_moment`, `news`, `tech`, `gaming`, `music`, `movie_tv`, `internet_drama`, `opinion`, `comment`

Validation rules:

- Day entries use one exact date.
- Month entries use the first and last day of that month.
- Year entries use `2020-01-01` through `2020-12-31`.
- `period_end` must never be before `period_start`.
- `period_granularity` must match the stored date range.

### Generated drafts table

```sql
create table capsule_drafts (
  id uuid primary key default gen_random_uuid(),
  period_key text not null,
  level text not null,
  generator_name text not null,
  raw_data jsonb not null,
  normalized_data jsonb,
  review_status text not null default 'pending',
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
```

Suggested draft review statuses:

- `pending`
- `approved`
- `rejected`
- `needs_edit`

Recommended indexes:

```sql
create index capsule_entries_period_status_idx on capsule_entries (period_start, status);
create index capsule_entries_slug_idx on capsule_entries (slug);
create index capsule_drafts_period_review_idx on capsule_drafts (period_key, review_status);
```

### Period SEO table

Store SEO overrides per public period instead of relying on entry-level SEO fields alone.

```sql
create table period_seo (
  id uuid primary key default gen_random_uuid(),
  period_key text not null unique,
  level text not null,
  seo_title text,
  seo_description text,
  canonical_url text,
  og_image_url text,
  updated_at timestamptz not null default now()
);
```

Fallback rule:

- If no `period_seo` record exists, use the featured published entry for that period.

### Admin audit log table

Track sensitive admin actions, even if there is only one admin.

```sql
create table admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

## API Design

### Public endpoint

```txt
GET /api/capsule?period=2020&level=year
GET /api/capsule?period=2020-03&level=month
GET /api/capsule?period=2020-03-20&level=day
```

### Admin endpoints

```txt
GET /api/admin/entries
POST /api/admin/entries
GET /api/admin/entries/:id
PATCH /api/admin/entries/:id
POST /api/admin/access/start
POST /api/admin/access/verify
POST /api/admin/generate
GET /api/admin/drafts
PATCH /api/admin/drafts/:id/review
POST /api/admin/preview
```

Admin API rules:

- Every `/api/admin/*` route must use the same stealth auth guard and return `404 Not Found` when unauthorized.
- `POST /api/admin/access/start` should always return the same generic success message whether the secret word is correct or not.
- `POST /api/admin/access/start` should be rate-limited.
- `POST /api/admin/preview` should only be available to verified admin sessions.

### Response shape

```ts
type CapsuleResponse = {
  period: string;
  level: "year" | "month" | "day";
  headline: string;
  summary: string;
  confidence: "high" | "medium" | "low";
  sections: {
    culture: CapsuleItem[];
    events: CapsuleItem[];
    discussion: CapsuleItem[];
    opinions: CapsuleItem[];
  };
  sources: {
    managed: boolean;
    curated: boolean;
    generated: boolean;
  };
};

type CapsuleItem = {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  imageAlt?: string;
  origin?: "manual" | "generated_draft" | "curated_seed";
  category?: string;
  source: string;
};
```

## Preview Mode

Preview should use the same `NewspaperPage` component as the public view, but it must be admin-only.

Preview rules:

- Preview can render published entries plus selected draft entries for the requested period.
- Preview must never be accessible without a verified admin session.
- Preview must only work on desktop devices.
- Preview should show a visible `DRAFT PREVIEW` watermark or badge.
- Public routes must never render draft content.
- Preview responses should not be cached publicly.

## Ranking and Summary Rules

The app still needs an interpretation layer, but it should operate on reviewed entries, not raw scraped content.

### Ranking rules

- Prefer approved entries marked as featured.
- Prefer strong 2020 cultural moments with cross-country or cross-platform reach over generic or narrowly local topics.
- Down-rank repetitive or low-signal entries.
- De-duplicate similar entries within the same period.
- Always prefer admin-edited text over untouched generated text.
- Always exclude rejected drafts from ranking.

### Summary rules

- Use deterministic templates for the MVP.
- Generate the headline from the strongest approved item.
- Generate the summary from the top two or three approved categories.
- Mark confidence as `low` when a period has very few approved items.

Example:

```txt
March 2020 online attention was dominated by lockdown life, globally shared pandemic memes, and internet culture that travelled across countries and platforms.
```

## 1-Week Sprint

### Day 1: Routing and 2020 scope

- Scaffold Next.js, TypeScript, and Tailwind.
- Add routes for `/2020`, `/2020/[month]`, and `/2020/[month]/[day]`.
- Make `/` redirect directly to `/2020`.
- Add period parsing that only accepts 2020 dates.
- Create the initial `curated-2020.json` file.
- Add the hidden public trigger form for admin access.
- Build the magic-link + numeric-code verification flow for `/admin`.
- Add desktop-device gating for `/admin/*` and `/api/admin/*`.

### Day 2: Admin data layer

- Create `capsule_entries` and `capsule_drafts` tables.
- Add `period_seo` and `admin_audit_log` tables.
- Implement admin entry list, create, edit, publish, and archive flows.
- Implement draft review states: pending, approved, rejected, needs edit.
- Add application-level validation for `period_start`, `period_end`, and `period_granularity`.
- Build public capsule pages from published entries only.

### Day 3: Generator tool and review flow

- Build `POST /api/admin/generate`.
- Generate draft content for a selected 2020 month or day from `curated-2020.json` and deterministic templates only.
- Save draft rows with image metadata and content metadata.
- Build admin review UI for image and content auditing.

### Day 4: Newspaper UI and preview

- Build reusable `NewspaperPage`.
- Include masthead, headline, columns, pull quote, and footer.
- Add preview mode that renders published + selected draft entries for admin users only.
- Add a visible `DRAFT PREVIEW` watermark.
- Make the layout responsive from the start.

### Day 5: Ranking and summaries

- Add ranking rules for approved entries.
- Generate deterministic summaries.
- Add confidence levels for complete, partial, and sparse capsules.
- Add source badges for `Managed`, `Generated draft`, and `Curated`.

### Day 6: UX polish

- Add breadcrumbs and back navigation.
- Add newspaper-style loading states.
- Add graceful empty states for thin 2020 dates.
- Add admin search and filter tools.
- Add rate limiting and resend backoff for admin access requests.
- Verify that mobile devices receive `404 Not Found` for admin routes and admin APIs.

### Day 7: Deploy and QA

- Deploy to Vercel.
- Add metadata per period page.
- Add `sitemap.xml` and `robots.txt`.
- Add cache revalidation on publish, unpublish, and SEO updates.
- Test desktop and mobile layouts.
- Test the app across strong and weak 2020 periods.
- Test admin generate, review, edit, publish, unpublish, and preview flows.
- Test that admin access works on desktop only and stays hidden on mobile.

## Newspaper Component

Reusable component structure:

```txt
[ MASTHEAD: Cache Me Outside - March 2020 ]
[ HEADLINE: Top online moment of the period ]
[ COL 1: Memes / Culture ]
[ COL 2: Headlines / Events ]
[ COL 3: Reactions / Opinions ]
[ STRIP: Editor Notes / Hot Takes ]
```

The same component should work for the `2020` year page, month pages, and day pages.

## UI Suggestions

- Make the `2020` archive browser the first screen.
- Use a dense editorial layout, not a dashboard look.
- Keep the year fixed and make month/day browsing feel simple.
- Show image review status clearly in admin.
- Show source badges instead of long explanatory text.
- Make every approved period URL shareable.

## SEO Strategy

The public app should render useful server-side HTML from reviewed entries.

### Public URL pattern

```txt
/
/2020
/2020/march
/2020/march/20
```

Root route rule:

- `/` should immediately redirect to `/2020`.

### Page metadata

Each public period page should have:

- Unique `<title>` using `Cache Me Outside` and the selected 2020 period.
- Meta description summarizing key moments and opinions.
- Canonical URL.
- Open Graph title, description, and image.
- One clear `h1` and strong `h2` sections.
- Internal links to nearby 2020 periods.

Metadata source rules:

- Prefer `period_seo` for year, month, and day pages.
- If no `period_seo` record exists, fall back to the featured published entry for that period.

### Content rules

- Each page should have at least one reviewed editorial summary.
- Avoid thin pages. If a day is weak, include nearby month context.
- Use source links for credibility.
- Keep slugs stable once indexed.
- Target search intent like `what was trending online in March 2020`.

## Pre-Cache Targets

Seed these 2020 periods first:

- `2020-03`: lockdown memes, Tiger King, Animal Crossing, globally shared quarantine jokes
- `2020-04`: Zoom culture, sourdough jokes, pandemic routines
- `2020-08`: TikTok ban talk, WAP discourse, globally recycled short-form trends
- `2020-10`: Among Us, Borat 2, and cross-region meme formats
- `2020-11`: major-event reactions and international internet culture spikes

Avoid promising exact details until reviewed in admin.

## Cache Strategy

Public period pages should use server-side caching or ISR so every request does not hit the database directly.

Recommended approach:

- Use Next.js revalidation for public pages, for example hourly.
- Revalidate affected year, month, and day routes after publish, unpublish, or SEO updates.
- Do not publicly cache admin pages, preview routes, or admin API responses.

## Risk Mitigations

- If the generator produces weak content, keep it in draft.
- If an image is low-quality or unsafe, reject it in admin.
- If an image is not legally usable, reject it or require a valid `image_license` value before publish.
- If a day has thin data, roll up to the month context.
- If optional provider data fails, keep the public page powered by reviewed entries only.
- If no approved entries exist for a date, show a graceful empty state instead of raw output.
- If email delivery fails in development, log the access link locally instead of blocking all admin access.
- If email delivery fails in production, rely on resend with backoff and a documented fallback provider or recovery path.
- If network conditions change during an admin session, allow the fingerprint-based session to survive minor IP changes but still expire quickly.

## Success Criteria

The MVP is successful if a user can:

- Browse `2020`, a 2020 month, and a 2020 day.
- See a convincing newspaper-style page.
- Share a deep link to a specific 2020 period.
- Use the app without logging in.

The implementation is successful if:

- The generator tool creates usable draft entries.
- You can audit image and content quality in admin before publish.
- Public pages only show reviewed entries.
- The UI is responsive and readable on mobile.
- The admin area is usable on desktop and inaccessible on mobile.
- The plan supports a tight 2020-only launch without scraping dependencies.

## Testing Checklist

Minimum release checks:

- Request to `/` redirects to `/2020`.
- Unauthenticated request to `/admin` returns `404 Not Found`.
- Unauthenticated request to `/api/admin/entries` returns `404 Not Found`.
- Mobile request to `/admin` returns `404 Not Found`.
- Mobile request to `/api/admin/entries` returns `404 Not Found`.
- Secret-word endpoint stays vague on both success and failure.
- Magic link plus wrong authenticator-app code fails without creating a session.
- Generator creates draft rows from `curated-2020.json`.
- Public pages hide unpublished entries.
- Preview shows draft content only for verified admin sessions.
- Publishing an entry revalidates the affected period pages.
- SEO fallbacks work when no `period_seo` override exists.

## Build Order Recommendation

1. Build the `2020` UI with curated seed data.
2. Add the database-backed admin entry system.
3. Add the generator tool that creates draft entries.
4. Build the admin review flow for image and content auditing.
5. Build public pages from published entries only.
6. Add ranking, summaries, and SEO metadata.
7. Deploy and seed the strongest 2020 periods.

This order keeps the product controlled, reviewable, and aligned with a single-year MVP.
