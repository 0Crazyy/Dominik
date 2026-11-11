# Community Teams Security and Reliability Review

Reviewed on 2026-11-11. Scope: the community-team submission, moderation, and public listing flow in the repository. This review does not verify the deployed Cloudflare configuration, production secrets, or operational backup settings.

## Finding

| # | Severity | File | Lines | Finding | Confidence |
|---|---|---|---|---|---|
| 1 | MEDIUM | `functions/api/admin.js`; `functions/api/teams.js` | `admin.js:13-15,40-46`; `teams.js:5-7` | Approval is persisted in D1 before the approved-team snapshot is written to KV. If the KV write fails, a retry sees the team is no longer pending and exits without publishing it. Concurrent approvals can also publish snapshots out of order. An approved team can therefore remain missing from the public listing until a later successful publish. | 9/10 |
| 2 | MEDIUM | `functions/api/submit.js` | `57-72` | Rate-limit and pending-queue counts are read before insertion, without an atomic reservation. Concurrent direct API requests from the same IP can all pass the pre-checks and exceed the hourly/daily limits or pending cap. The unique hash index still prevents duplicate teams. | 8/10 |

## Checklist

### Critical

- **Administrative endpoint authorization — present.** `/api/admin` requires the `Authorization` value to match the `ADMIN_KEY` secret before either listing or changing records (`functions/api/admin.js:8-11,18-21,27-30`). The secret is not declared in `wrangler.toml`.
- **Turnstile verification — present.** The server calls Cloudflare Siteverify and rejects unsuccessful verification (`functions/api/submit.js:47-54`).
- **Rate limiting and spam controls — present, but not concurrency-safe.** The endpoint enforces per-IP hourly/daily limits, a pending-queue cap, a minimum form-open time, and a honeypot (`functions/api/submit.js:6-12,36-41,57-66`). See finding 2.
- **Server-side data validation — present.** The server reconstructs accepted team fields from the catalog and checks required page, characters, and memories (`server/team.js:5-46,53-61`). This does not rely on frontend validation.
- **Pending teams kept private — present.** Only rows with `status = 'approved'` are copied to KV; the public endpoint reads that approved-team cache (`functions/api/admin.js:13-15`; `functions/api/teams.js:5-7`). The publication consistency finding above is the caveat.
- **XSS and SQL injection — no concrete issue identified in the reviewed flow.** Team text is escaped when rendered (`app.js:565,769-773`), and D1 queries use bound parameters.

### Important

- **Duplicate submissions — present.** The API checks the normalized team hash, and D1 enforces a unique index (`functions/api/submit.js:57-64`; `server/schema.sql:16`). Concurrent duplicates cannot both be stored due to the unique index, though one request may fail at insertion.
- **Request size — present for submissions.** `/api/submit` rejects bodies over 30,000 characters (`functions/api/submit.js:7,31-32`). The authenticated admin POST has no equivalent explicit body-size check.
- **Approval concurrency — partially handled.** Conditional D1 status updates prevent two reviewers from making the same pending-state transition. The separate KV publication can still become stale or out of order, as described in the finding.
- **Source of truth — D1.** KV is a public projection/cache of approved rows, not the moderation database. Public reads depend on that projection being successfully refreshed.
- **D1 backups — not established by this repository.** No backup schedule or retention policy was found in the reviewed project configuration; verify this operationally in Cloudflare.

### User experience

- **Build preview — present** in the Team Builder.
- **Sending indicator and duplicate-click prevention — present.** The send action disables the button and shows a sending state (`editor.js:392-399`).
- **Success/error messages and approval notice — present.** Success states that the team appears after review (`editor.js:404-406`).
- **Submission tracking identifier — absent.** The API returns `{ ok: true }` without a submission ID, and the UI does not provide a tracking token (`functions/api/submit.js:78`; `editor.js:404-406`).
- **Preserving form data after failure — present.** The draft is saved in browser storage (`editor.js:64-68`).
