# PRIVATE MODE — Implementation and verification

Date: 2026-09-30. Repository: `romandossenbach-create/thehumanchoice`, branch `main`.
Parent/source: `16e8448167b6c2d6cfc38a564cff7ace28c921de` (Add THE.HUMAN.CHOICE source code V270).

## Implemented behavior

- Profile → Privacy → Community Visibility contains an immediately persisted PRIVATE MODE ON/OFF switch. The dedicated owner-only API accepts a boolean and never trusts a supplied target athlete ID.
- Community leader rows and community aggregates exclude private athletes. Authenticated owners receive their personal values separately as `ownAthlete`, without placing them in a public ranking.
- History, evidence, profile-photo, world-archive, and world-record requests check database privacy before returning personal data. Protected responses are not publicly cached. Profile images and owner video playback use authenticated fetches.
- Permanent/temporary training-book sharing cannot override PRIVATE MODE. Legacy profile updates preserve privacy. Existing profile IDs cannot be used to take over another account through profile creation.
- Static world archive information and historical record data now reside behind server checks. The verified lifetime award minimum is supplied by the filtered server response rather than embedded with athlete IDs in the public client.
- Creator credits remain unchanged and do not link to private performance data.

## Database structures

Migration `0016_private_mode.sql` adds `athletes.private_mode INTEGER NOT NULL DEFAULT 0` and sets Roman ON only when the existing athlete ID, athlete number 1 and owner user ID all match. The Drizzle schema, journal and schema snapshot are updated. No training, entries, challenge or road-plan structure is changed. No data reset is included.

## Actually completed checks

- Production database read: Roman's existing athlete row (ID 0001) already has `private_mode = 1`. This was observed, not written by this change. The production database was not modified during this session.
- Eight local regression tests passed using SQLite, the actual transpiled route handlers, simulated owner/normal-athlete/anonymous identities and a simulated media bucket. They cover migration preservation, leaderboard/aggregate filtering, owner reads, direct history/evidence/photo access, account-only persistence/toggling, legacy profile writes, archived/historical data and independent Creator credits.
- Production Worker build passed.
- Globe JavaScript syntax check and Git whitespace check passed.
- TypeScript checking is not clean on the V270 baseline. Baseline/current comparison found 70 existing optional-binding diagnostics and the existing i18n type diagnostic; no added diagnostic categories. Two existing unknown-JSON diagnostics in the touched statistics client were corrected. (The comparison also reports TS5074 because it uses the TypeScript API with the project's incremental options.)
- Local migration tests preserve all stored training and challenge rows byte-for-byte in the fixture snapshots. This is not a claim about production data before/after deployment.

## Not performed / publication limitation

- No real Roman login, logout/login cycle, second-device test, or real second normal-athlete account test was performed.
- Creator credits were verified in source/local tests, not through an authenticated live second-account browser session.
- This GitHub change was not deployed. The existing Sites source repository and mandated GitHub V270 source have divergent histories. The normal publishing workflow refused the mismatch without overwriting history. A different Sites source revision was not substituted for the user's mandated V270 basis.
- The live database already contains the privacy column and newer history tables. Do not replay the fresh-baseline column-add migration blindly against that database. Reconcile its recorded migration history before publication; preserve all existing records.
- Consequently, the observed live ON value does not establish complete live privacy enforcement. Full live protection remains unverified.

## Exact changed/added files

- `APP_DEVELOPMENT_CHANGELOG.md`
- `app/api/evidence/route.ts`
- `app/api/history/route.ts`
- `app/api/leaderboard/route.ts`
- `app/api/privacy/route.ts`
- `app/api/profile-photo/route.ts`
- `app/api/profile/route.ts`
- `app/api/world-archive/route.ts`
- `app/api/world-records/route.ts`
- `app/athletes/[id]/page.tsx`
- `app/athletes/page.tsx`
- `app/page.tsx`
- `app/profile-image.tsx`
- `app/world-records/page.tsx`
- `db/schema.ts`
- `drizzle/0016_private_mode.sql`
- `drizzle/meta/0016_snapshot.json`
- `drizzle/meta/_journal.json`
- `public/handbuch/app-handbuch.html`
- `public/handbuch/index.html`
- `public/push-your-world/index.html`
- `public/push-your-world/world.js`
- `core/privacy/access-regression.test.mjs`
- `docs/backups/2026-09-30-private-mode/app-handbuch.html`
- `docs/backups/2026-09-30-private-mode/trainingshandbuch.html`
- `docs/private-mode-verification.md`
