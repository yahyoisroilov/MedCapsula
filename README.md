# MedCapsula

O‘zbek tilidagi tibbiy ta‘lim platformasi — har bir mavzu **uch bosqichda**: Videodars → Konspekt → Test.

Built with **Next.js 14 (App Router)**, **Supabase** (auth + Postgres), **Tailwind CSS**.

## Design system

Warm, light, editorial theme (no dark mode).

- **Palette:** sand `#F5F0E6` (page), `#EDE6D6` (alt sections), `#FBF8F1` (cards); brand green `#2F6B4F`; accent blue `#5A95BE`; ink `#2B2722`.
- **Type:** `Spectral` (serif headings), `Hanken Grotesk` (body), `Space Mono` (labels/numbers) — loaded via `next/font`.
- **Tailwind tokens:** `bg-sand`/`sand-deep`/`sand-card`, `text-ink`/`ink-soft`/`ink-mute`/`ink-faint`, `brand`/`brand-tint`/`brand-line`, `sky`/`sky-tint`, `night`.
- **Helpers (globals.css):** `mc-label`, `mc-card`, `btn-primary`/`btn-secondary`/`btn-sm`, `pill` + `pill-green`/`pill-blue`/`pill-muted`.
- Icons are inline SVGs in `src/components/ui/icons.tsx` (no icon-font dependency).

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Marketing landing page |
| `/subjects` | Subjects grid (study area home) |
| `/subjects/[slug]` | Topic list for a subject |
| `/subjects/[slug]/[index]` | Lesson player: Videodars → Konspekt → Test |
| `/notes` | Notion-style multi-note block editor |
| `/dashboard` | Student progress dashboard |
| `/auth/login`, `/auth/register` | Auth |
| `/admin`, `/admin/courses`, `/admin/courses/[slug]` | Admin |

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Cloudinary keys
npm run dev
```

### Database

Run the SQL in the Supabase SQL Editor, in order:

1. `supabase/schema.sql` — courses, lessons, progress, profiles, RLS, storage.
2. `supabase/migrations/0001_user_notes.sql` — **required for the Notes feature** (multi-note block editor). Adds the `user_notes` table with per-user RLS.

`supabase/seed.sql` contains sample courses/lessons.

## Notes data model

Each note is a row in `user_notes` with `title`, `subject` (tag label), and a `blocks` JSON array. Block types: `h` (heading), `p` (paragraph), `bullet`, `todo` (checkable), `callout`. The editor autosaves on edit via `PUT /api/notes`.
