# Cache Me Outside

A newspaper-style 2020 internet time capsule. Public pages render reviewed entries only; admin tools are hidden behind stealth auth and desktop-only access.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — redirects to `/2020`.

## Environment

Copy `.env.example` to `.env.local` and configure:

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Same page (anon/publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page — **service_role** key (server only, never expose client-side) |
| `RESEND_API_KEY` | [Resend](https://resend.com) dashboard |
| `RESEND_FROM` | Verified sender domain in Resend (use `onboarding@resend.dev` for testing) |
| `ADMIN_EMAIL` | Your inbox for magic links |
| `ADMIN_TOTP_SECRET` | Generate with any authenticator app setup QR |
| `ADMIN_SECRET_WORD` | Your hidden trigger word |

- **Email** — set `EMAIL_PROVIDER=resend` and `EMAIL_ENABLED=true`, or use SMTP fallback
- **Google OAuth client ID** — not used by current MVP auth (2FA is TOTP via authenticator app)

Run the SQL migration in `supabase/migrations/001_initial_schema.sql` against your Supabase project.

## Deploy (Vercel)

Add the same env vars in Vercel project settings. Set `NEXT_PUBLIC_SITE_URL` to your production domain.

## Admin access

1. Focus the hidden form on any public page (bottom-right when tabbed to) and enter the secret word.
2. Check email (or server console in dev) for the magic link.
3. Open the link on a **desktop** browser and enter your authenticator app code.
4. Access `/admin` for CMS, generator, review, and preview.

Unauthorized and mobile requests to `/admin/*` and `/api/admin/*` return **404 Not Found**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |

## Architecture

- **Public routes**: `/2020`, `/2020/[month]`, `/2020/[month]/[day]`
- **Admin routes**: `/admin`, `/admin/entries`, `/admin/generator`, `/admin/review`, `/admin/preview`
- **Generator**: reads `data/curated-2020.json` only — never publishes directly
- **Preview**: desktop-only, shows `DRAFT PREVIEW` watermark

See `plan.md` and `development-plan.md` for full product spec.
