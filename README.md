# SummitLink — Alumni & campus engagement platform

**SummitLink** is a demo-ready web app for **Meridian Valley Technical University (MVTU)**: verified alumni directory, jobs, events, announcements, analytics, and role-aware flows for **alumni**, **students**, **faculty**, and **admins**. Copy and seed data stay generic so you can rebrand via [`lib/brand.ts`](lib/brand.ts) and assets under [`public/brand/`](public/brand/).

**Stack:** Next.js 16 (App Router) · React 19 · Prisma 7 + MariaDB · NextAuth.js v5 (credentials) · Tailwind CSS 4 · Recharts (analytics).

---

## Project status (v1.0 scope)

Core product flows in this repo are **implemented and intended for demos / internal deployments**. See [`docs/FEATURES.md`](docs/FEATURES.md) for a detailed checklist, roadmap ideas (email verification, OAuth, CI), and release hygiene.

**Release sanity checks**

```bash
npm run lint
npm run build
```

Use `npx prisma migrate deploy` (or `migrate dev` locally) after pulling schema changes.

---

## Features at a glance

| Area | What ships |
|------|------------|
| **Auth & roles** | Email/password via NextAuth; roles ALUMNI, STUDENT, FACULTY, ADMIN; JWT sessions |
| **Alumni** | Profile (bio, work history, education, skills, links), avatar upload, verification state |
| **Students** | Academic profile (program, batch, roll) with faculty-visible edits |
| **Staff** | Admin/Faculty staff cards + Faculty program scope for directory & tooling |
| **Directory** | Search/filter verified alumni; scoped for faculty; profile detail pages |
| **Jobs** | Post, browse, filter, apply; deactivate listings |
| **Events** | Published events, RSVP, create flow for faculty/admin |
| **Announcements** | Published feed; faculty/admin draft & publish management |
| **Admin home** | KPIs, pending alumni verification |
| **Faculty programs** | Admin assigns which programs each faculty account may see |
| **Analytics** | Charts, explorer search, multi-dataset CSV export |
| **Marketing** | Public landing with stats and CTAs |

**Routing:** Authenticated app lives under `app/(protected)/` with a shared shell (sidebar + header). `/admin/*` and `/announcements` management enforce roles inside each page (faculty/admin as documented per route).

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **MariaDB** or **MySQL** 8+ (Prisma uses the MySQL provider with the MariaDB driver adapter)

---

## Quick start

### 1. Clone and install

```bash
git clone <YOUR_REPO_OR_FORK_URL> alumini-tracker
cd alumini-tracker
npm install
```

`postinstall` runs `prisma generate`; the client is emitted to `app/generated/prisma/`.

### 2. Environment variables

Create a `.env` in the project root (ignored by git):

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MySQL/MariaDB URL (below). |
| `AUTH_SECRET` | Yes | Session/JWT signing secret (`openssl rand -base64 32`). |
| `AUTH_URL` | Production | Public origin, e.g. `https://your-domain.com` (no trailing path). |

**Production hosts:** Set `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL` in your provider’s env UI and redeploy. If login loops with `callbackUrl=/dashboard`, check secrets, `AUTH_URL`, and DB connectivity.

Example:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/alumni_tracker"
AUTH_SECRET="paste-a-long-random-string-here"
```

Create an empty database before migrating.

### 3. Database

```bash
npx prisma migrate deploy
```

Local iterative work:

```bash
npx prisma migrate dev
```

### 4. Seed (optional)

```bash
npm run seed
```

Passwords are at the top of [`prisma/seed.ts`](prisma/seed.ts) (`Admin@123456`, `Faculty@123456`, `Alumni@123456`, `Student@123456`):

| Role | Example emails |
|------|----------------|
| Admin | `admin@mvtu.demo.edu` |
| Faculty | `faculty@mvtu.demo.edu` |
| Alumni (verified / pending) | `marcus.webb@example.com`, `alex.nguyen@example.com`, … |
| Students | `jordan.hayes@example.com`, … |

### 5. Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login` or register at `/register`.

---

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Production server (after `build`) |
| `npm run lint` | ESLint |
| `npm run seed` | `tsx prisma/seed.ts` |

---

## Repo layout

| Path | Role |
|------|------|
| `app/` | Routes (including `(protected)/`, `(auth)/`), API: `app/api/auth/`, `app/api/upload/` |
| `components/` | UI primitives (`components/ui/`) and features |
| `lib/` | Auth, DB client, actions, analytics helpers, [`lib/app-ui.ts`](lib/app-ui.ts) shared shell styles |
| `prisma/` | Schema, migrations, [`seed.ts`](prisma/seed.ts) |
| `prisma.config.ts` | Prisma config (datasource from env) |
| `docs/FEATURES.md` | Feature matrix + suggested roadmap |
| `public/brand/summitlink-mark.svg` | Logo mark; favicon wired from [`app/layout.tsx`](app/layout.tsx) |
| `public/uploads/avatars/` | Runtime avatar storage — don’t commit real user files |

---

## Branding & white-label

- **Logo / favicon:** replace [`public/brand/summitlink-mark.svg`](public/brand/summitlink-mark.svg) or update paths in `app/layout.tsx` and [`components/brand/BrandLogo.tsx`](components/brand/BrandLogo.tsx).
- **Names & institution copy:** [`lib/brand.ts`](lib/brand.ts).

---

## Contributing

1. Branch from default with a short name (e.g. `fix/job-filter`).
2. Keep PRs focused; match existing TypeScript and component patterns ([`.prettierrc`](.prettierrc) if you format locally).
3. Run `npm run lint` before opening a PR.
4. Schema changes: edit `prisma/schema.prisma`, run `npx prisma migrate dev`, commit migrations under `prisma/migrations/`.
5. Never commit `.env` or production uploads.

---

## Troubleshooting

- **Prisma client errors** — `npx prisma generate` or reinstall (`postinstall` generates).
- **DB connection** — Check `DATABASE_URL`, server running, database exists; adapter allows typical local MySQL settings.
- **Build fails on `/` with pool timeout / `ENOTFOUND` (managed MySQL e.g. Aiven)** — The marketing homepage loads live counts **per request** (not at build time). If build still fails elsewhere on DB calls, ensure CI/production **`DATABASE_URL`** uses the current hostname from your provider’s dashboard (Aiven hostnames can change after restores); unreachable DB during build otherwise yields Prisma pool timeouts.
- **Auth** — Stable `AUTH_SECRET` across restarts.
- **`User` table missing when seeding** — Migrate first: `npx prisma migrate deploy` or `migrate dev`.
- **Strict managed MySQL (`sql_require_primary_key`)** — Initial migrations use composite PKs where required for hosts like Aiven.
- **`Table 'User' already exists` after rollback resolve** — Use [`prisma/drop-all-for-fresh-migrate.sql`](prisma/drop-all-for-fresh-migrate.sql) only when intentionally wiping: `npx prisma db execute --file prisma/drop-all-for-fresh-migrate.sql`, then `migrate deploy`.
- **VerificationToken migration drift** — `migrate reset` locally or follow [Prisma migration repair](https://www.prisma.io/docs/guides/migrate/production-troubleshooting).

---

## License

Private project unless maintainers state otherwise.
