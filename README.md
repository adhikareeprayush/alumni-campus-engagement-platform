# Alumni Tracker

Web app for **IOE Purwanchal Campus** (Tribhuvan University): alumni directory, jobs, events, announcements, and role-based areas for **alumni**, **students**, **faculty**, and **admins**.

Stack: **Next.js 16** (App Router), **React 19**, **Prisma 7** with **MariaDB**, **NextAuth.js v5** (credentials), **Tailwind CSS 4**.

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **MariaDB** or **MySQL** 8+ (the app uses Prisma’s MySQL provider with the MariaDB driver adapter)

---

## Quick start

### 1. Clone and install

```bash
git clone <YOUR_REPO_OR_FORK_URL> alumini-tracker
cd alumini-tracker
npm install
```

`postinstall` runs `prisma generate`, which emits the Prisma client into `app/generated/prisma/`.

### 2. Environment variables

Create a `.env` file in the project root (this repo ignores `.env*` in git):

| Variable        | Required | Description |
|-----------------|----------|-------------|
| `DATABASE_URL`  | Yes      | MySQL/MariaDB connection string (see below). |
| `AUTH_SECRET`   | Yes      | Secret for signing sessions/JWT. Generate with `openssl rand -base64 32`. |
| `AUTH_URL`      | Deploy   | Public site URL, e.g. `https://your-domain.com` (helps NextAuth in production). |

**Vercel (or any production host):** In the project **Settings → Environment Variables**, set at least `DATABASE_URL`, **`AUTH_SECRET`** (required in production for Auth.js), and **`AUTH_URL`** to your live origin with no trailing path, e.g. `https://alumini-tracker.prayushadhikari.com.np`. Redeploy after changing env vars. If login loops back to `/login?callbackUrl=/dashboard`, the session cookie was not set — usually missing or wrong `AUTH_SECRET` / `AUTH_URL`, or the DB is unreachable from the serverless runtime (check Aiven allows connections from the internet).

Example `DATABASE_URL`:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/alumni_tracker"
AUTH_SECRET="paste-a-long-random-string-here"
```

Create the database (empty) before running migrations.

### 3. Database schema

Apply migrations:

```bash
npx prisma migrate deploy
```

For local development when you change the schema, you can use:

```bash
npx prisma migrate dev
```

### 4. Seed demo data (optional)

Creates sample users, profiles, jobs, and events:

```bash
npm run seed
```

Demo accounts — passwords are in the comment block at the top of `prisma/seed.ts` (e.g. admin `Admin@123456`, faculty `Faculty@123456`, alumni `Alumni@123456`, students `Student@123456`):

| Role    | Email |
|---------|--------|
| Admin   | `admin@ioepurwanchal.edu.np` |
| Faculty | `faculty@ioepurwanchal.edu.np` |
| Alumni  | `aarav.sharma@example.com`, `priya.thapa@example.com` |
| Student | `bibek.adhikari@example.com`, `sita.rai@example.com` |

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login` after seeding (or register at `/register`).

---

## npm scripts

| Script        | Purpose |
|---------------|---------|
| `npm run dev` | Next.js development server |
| `npm run build` | `prisma generate` then production build |
| `npm run start` | Start production server (after `build`) |
| `npm run lint` | ESLint |
| `npm run seed` | Run `prisma/seed.ts` |

---

## Project layout (short)

| Path | Role |
|------|------|
| `app/` | Routes, layouts, API routes (`app/api/...`) |
| `components/` | UI and feature components |
| `lib/` | Auth (`lib/auth.ts`), DB client (`lib/db.ts`), server actions |
| `prisma/` | `schema.prisma`, migrations, `seed.ts` |
| `prisma.config.ts` | Prisma config (datasource URL from env) |
| `public/uploads/avatars/` | User avatars (written at runtime; don’t commit real user files) |

---

## Contributing

1. **Branch** from `main` (or the default branch) using a short, descriptive name, e.g. `fix/job-deadline-validation`.
2. **Keep changes focused** — one logical change per PR when possible.
3. **Match existing style** — TypeScript, component patterns, and formatting. Prettier is configured (`.prettierrc`); run format if you use it locally.
4. **Lint** before opening a PR: `npm run lint`.
5. **Database changes** — update `prisma/schema.prisma`, run `npx prisma migrate dev`, and commit the generated migration under `prisma/migrations/`. Don’t hand-edit applied migration SQL unless you know the team’s process.
6. **Secrets** — never commit `.env` or real credentials.

### Next.js in this repo

This project may use newer Next.js APIs than older tutorials. If something behaves unexpectedly, check the framework docs under `node_modules/next/dist/docs/` for the version you have installed.

---

## Troubleshooting

- **`PrismaClient` / module errors** — Run `npx prisma generate` (or `npm install`, which triggers generate).
- **DB connection errors** — Verify `DATABASE_URL`, that MariaDB/MySQL is running, and that the database exists. The adapter enables `allowPublicKeyRetrieval` for typical local setups.
- **Auth / session issues** — Ensure `AUTH_SECRET` is set and stable across restarts in dev.
- **`The table User does not exist` (P2021) when seeding** — Apply migrations before seed: `npx prisma migrate deploy` (or `npx prisma migrate dev` locally).
- **Aiven / managed MySQL: `sql_require_primary_key` during migrate** — The initial migration creates `VerificationToken` with a composite primary key so it satisfies strict hosts.
- **`Table 'User' already exists` after `migrate resolve --rolled-back`** — `resolve` does not drop tables. Run the SQL in `prisma/drop-all-for-fresh-migrate.sql` on the database (wipes data + `_prisma_migrations`), then `npx prisma migrate deploy` (no `resolve` needed). From your machine (uses `.env` `DATABASE_URL`): `npx prisma db execute --file prisma/drop-all-for-fresh-migrate.sql`. Aiven often has no in-browser SQL editor for MySQL; use that command or a desktop client (TablePlus, DBeaver, `mysql` CLI) with the host/port/user from the Aiven service **Overview**.
- **Local DB created before the `VerificationToken` primary-key fix** — If `migrate deploy` reports the initial migration was modified after apply, either run `npx prisma migrate reset` (wipes data) or add the primary key manually, then follow [Prisma’s migration repair docs](https://www.prisma.io/docs/guides/migrate/production-troubleshooting) to align `_prisma_migrations` with the team.

---

## License

Private project unless otherwise noted by the maintainers.
