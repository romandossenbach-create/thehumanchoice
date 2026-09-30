# V277 + PRIVATE MODE — verification

Source basis: V277 / b21ed1412199b0fefdcf181481523b15398bc666.
Privacy patch reference: GitHub main / 49b6b7b6474ae6b5a96c6a447715c29d6cf8d447.

## Preserved V277 behavior

- Requested valid athlete IDs and foreign-owner rejection remain unchanged.
- Dashboard uses authenticated `/api/leaderboard?owner=1` and `ownerPerformance`; no `ownAthlete` response is introduced.
- The existing `togglePrivateMode()` switch and profile layout remain unchanged.
- History and evidence retain V277's owner access, active sharing requirement, PRIVATE MODE denial, and today-only restrictions.
- The entire V277 Drizzle migration history, snapshots and journal remain unchanged. The older `0016_private_mode.sql` is excluded.

## Added protection

- Direct profile photos require public visibility or authenticated ownership and are never publicly cached.
- Profile images use authenticated fetches on the dashboard and statistics page.
- World archive and record history are served through privacy-aware APIs; private location and performance data are removed from static public assets.
- Verified achievement minimums are supplied by the filtered server response, preserving lifetime awards without embedding athlete identifiers in the statistics client.
- Owner values remain separate from public rows and totals. PRIVATE MODE prevents public training-log links even when sharing is enabled.
- A read-only owner privacy endpoint complements the existing PUT and CORS OPTIONS handlers.
- Profile responses are marked private/no-store.

## Validation

- 11 privacy/access regression tests pass using actual transpiled handlers, simulated identities and an in-memory SQLite fixture generated from the V277 schema snapshot.
- 3 Road flow regression tests pass.
- Tests cover V277 requested-ID preservation, foreign-owner rejection, `owner=1`, private/public aggregates, private direct media access, active/expired sharing and today-only evidence restrictions, account-only persistence, records/archive filtering and independent Creator credits.
- Full Vinext build and TypeScript no-emit check pass.
- Type-only corrections declare the required DB/BUCKET bindings and correctly type the dictionary populated in stages. No language strings or runtime behavior were changed.

No deployment, production migration, production data write, or live second-account test was performed. Local simulated tests do not replace a live second-account test.
