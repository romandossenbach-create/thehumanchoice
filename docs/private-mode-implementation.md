# PRIVATE MODE implementation — 2026-09-29

Base: existing THE.HUMAN.CHOICE Site, version 276, source commit 6e46ffad7fbf134d247b4f1fa0f506c5bf01f65b. No replacement app or database reset.

## Files

- `db/schema.ts`, `drizzle/0017_rapid_microbe.sql`, associated Drizzle metadata: persistent `athletes.private_mode`, false by default; migration enables it for the exact existing Roman UUID and athlete number 1.
- `app/performance-visibility.ts`: central owner/community permission, public-ranking SQL predicate, neutral denial message and explicit future challenge-sharing permission extension. No challenge is automatically shared.
- `app/api/privacy/route.ts`: authenticated account-owned setting update.
- `app/api/profile/route.ts`: returns stored setting; ordinary profile saves preserve it. Also prevents assigning a caller-supplied existing athlete ID to a different account.
- `app/api/leaderboard/route.ts`: excludes private athletes from public leaders and public aggregate totals. Authenticated `owner=1` requests receive only that caller's own performance separately, with private/no-store responses. No creator exception.
- `app/api/history/route.ts`: denies all non-owner access when private, even if an older training-book grant remains active. Challenge information cannot bypass that denial.
- `app/api/evidence/route.ts`: checks owner/privacy/training-book sharing scope before reading video objects; removes public caching.
- `app/page.tsx`: ME profile Privacy / Community Visibility switch with ON/OFF; server persistence and owner-only dashboard performance; suppresses sharing campaign prompts while private.
- `tests/private-mode.mjs`: executes route handlers against SQLite with two mocked normal identities and anonymous access.

## Backend security

Training, profile, challenge and archive tables use server-only Cloudflare D1, not Supabase PostgREST. Supabase verifies authentication. No Supabase RLS policies were modified: adding Supabase policies would not protect this D1 data. D1 has no client-accessible SQL endpoint. Privacy is enforced in server API authorization and ranking SQL. Admin reads retain the existing `requireAdmin` check including AAL2.

Audited alternate paths: profile, leaderboard, training history pagination, challenge, road-plan, training-book sharing, evidence videos, profile photos, admin athlete queries. Profile photos do not return training/performance information; creator/about assets remain separate. Training-book sharing settings never override global private mode. Challenge and road-plan endpoints remain owner-only. Archive records remain PRIVATE and no public archive read endpoint exists in this version; a future archive endpoint must use central visibility checks before selecting snapshots.

## Verification

Production build: PASS (vinext).

Route/SQLite integration test: PASS. Covers OFF -> ON -> OFF, normal second viewer, anonymous viewer, owner access and totals, ranking omission, public aggregate omission, direct history API, direct evidence API, setting persistence, unauthorized setting mutation, Roman migration selection and preservation of entry/archive/challenge row counts. Supabase authentication is mocked in this test, so this does **not** constitute the requested live two-account acceptance test.

TypeScript: full-project `tsc --noEmit` is not clean. Existing binding declarations mark DB/BUCKET optional throughout the app, with additional existing i18n/athletes-page typing errors. New privacy JSON typing errors found on the first run were fixed. Build passes; do not describe full TypeScript validation as passing.

## Acceptance still outstanding

A real second normal athlete login and real owner session must verify the published app: switch persistence after logout/login and on a second device; all owner totals/sets/PBs/challenges; second account ranking/history/video/API denial; OFF restoration without data loss; creator credits. No second-account credentials were supplied and the production service-role secret is not readable through the environment connector. Do not certify PRIVATE MODE as fully accepted until these live tests pass.
