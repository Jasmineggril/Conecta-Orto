---
name: Conecta Orto architecture
description: Key decisions and patterns for the Conecta Orto 2026 event website.
---

# Conecta Orto 2026 — Architecture Notes

## Stack
- **Frontend**: `artifacts/conecta-orto` — React 19 + Vite + Wouter + Tailwind v4 + shadcn/ui
- **Backend**: `artifacts/api-server` — Express 5 + Drizzle ORM
- **DB**: Replit PostgreSQL (`lib/db` package, Drizzle schema)

## Auth & Admin
- Admin password: `ADMIN_PASSWORD` secret (set to 123456 via Replit Secrets UI)
- JWT signed with `SESSION_SECRET`; token stored in `localStorage` as `admin_token`
- Admin login route: `POST /api/admin/login` → returns JWT
- All `/api/admin/*` routes require `Authorization: Bearer <token>`

## DB schema tables (9 total after expansion)
`registrations`, `minicourses`, `enrollments`, `confirmationTokens`, `speakers`, `galleryItems`, `homepageContent`, `sponsors`, `certificates`

**Why:** Schema was expanded from 3 to 9 tables in one push. Rebuild `lib/db` with `pnpm run typecheck:libs` (runs `tsc --build`) after any schema change before typechecking `api-server`.

## Key API routes added
- `GET/PUT /api/homepage` — key-value store for homepage content
- `GET /api/speakers`, `GET /api/speakers/all` (admin)
- `GET /api/gallery`, `GET /api/gallery/all` (admin)
- `GET /api/sponsors`, `GET /api/sponsors/all` (admin)
- `GET /api/certificates/lookup?email=...` — certificate search by email
- `GET /api/certificates/validate/:code` — public validation
- `GET /api/registrations/confirm/:token` — email confirmation
- `GET /api/minicourses/all` — all courses (including inactive), admin only

## Frontend patterns
- `src/lib/api.ts` — simple typed fetch wrapper, reads `admin_token` from localStorage
- `src/components/admin/*` — 8 admin panel sections (Overview, Students, Minicourses, Certificates, Speakers, Gallery, Homepage, Sponsors)
- `src/components/GuidedTour.tsx` — custom tour using framer-motion (no external lib), persists to `localStorage` key `conectaorto_tour_done`
- `src/pages/certificates.tsx` — PDF generation opens a print-ready HTML page in a new window (no jsPDF needed; browser prints to PDF)
- Gallery & Speakers use **URL-based images** (admin pastes image URL), no file upload/object storage
- All public pages have hardcoded fallback data when DB is empty

**Why:** Gallery uses URL images to avoid needing object storage setup. PDF uses browser print dialog because it produces perfect results without library dependencies.
