# LIVE VOTES & COMMISSION RESULTS — FIX

## What was wrong (verified against the live Supabase DB)

The student vote was **never being recorded**, so the commission results page
(which reads real DB data) always showed **0 votes** and looked "mocked up".

Four independent problems:

1. **`votes` table has NO table-level GRANTs** — `permission denied for table votes`
   (SQLSTATE `42501`) is returned for **every** role, including `service_role`.
   `GET /rest/v1/votes` with the service-role key returns:
   ```json
   {"code":"42501","message":"permission denied for table votes"}
   ```
   Consequence: `/api/vote` could not `INSERT` ballots, no page could count
   votes, and the student "already voted" check in `ElectionContext` silently
   failed. The phase-0 migration created the table + RLS policies but never ran
   `GRANT`s on the table.

2. **The voting UI faked success** — `VotingInterfaceInteractive` generated a
   receipt locally (`UTAS-${Date.now()}-${random}`), showed the "Vote Submitted
   Successfully" modal immediately, and called `castVote()` fire-and-forget
   (no `await`, no error handling). So even when the API failed, the student
   saw a success screen with a fake receipt.

3. **Election voting windows had expired** — both "active" elections had
   `voting_start/end` in **May 2026** (today is 2026-08-09). Even when the API
   was reached it correctly returned *"Voting is not open for this election"*.
   The student UI filtered on the stale DB `status` field, not on the real dates.

4. **`votes` AFTER INSERT triggers were broken** (found during end-to-end
   testing). `schema_security_fixes.sql` created `update_election_stats_trigger`
   / `update_candidate_votes_trigger` on `votes`, but `update_election_stats()`
   queried `COUNT(DISTINCT user_id)` — a column that does not exist (the real
   column is `voter_id`). Postgres rejected **every** insert:
   ```json
   {"code":"42703","message":"column \"user_id\" does not exist",
    "hint":"Perhaps you meant to reference the column \"votes.voter_id\"."}
   ```
   A direct `POST /rest/v1/votes` with the service-role key reproduced it, so
   the whole insert was rolled back even after the GRANTs were fixed.

## ⚠️ ONE manual step required (SQL)

The permissions/trigger fix can only be applied in SQL (not via the REST API).
Open **Supabase Dashboard → SQL Editor → New query** and run the contents of:

```
supabase/migrations/20260809_votes_permissions_fix.sql
```

It is idempotent (safe to re-run — even if you already ran the earlier version) and:
- grants `SELECT/INSERT/UPDATE/DELETE` on `public.votes` to `service_role`
- grants `SELECT/INSERT` to `authenticated` and `SELECT` to `anon`
- re-asserts RLS + the "own votes" policies
- ensures `candidates.votes`, `elections.voted_count`, `elections.total_voters`
- re-creates + grants the `increment_candidate_votes` /
  `increment_election_voted_count` RPCs
- **drops the broken AFTER INSERT triggers** on `votes` (they blocked every
  insert and would double-count next to the RPC increments) and repairs the
  `update_election_stats()` function so future re-runs are safe

> The same GRANTs were also added to `supabase/migrations/20260201_utasvotes_phase0.sql`
> so fresh setups work too.

## Code fixes

| File | Change |
|------|--------|
| `src/contexts/ElectionContext.tsx` | `castVote()` now sends **both** the real Supabase `access_token` and the app's localStorage session (`x-user-id` / `x-user-email`) so `/api/vote` can authenticate every session; returns the real `receiptNumber` from `/api/vote`; election `status` is computed from the actual `voting_start`/`voting_end` dates so only genuinely open elections appear in the voting UI. |
| `src/app/api/vote/route.ts` | Auth now accepts either a real Supabase JWT **or** the app's localStorage session — the `x-user-id` + `x-user-email` pair is re-verified against `user_profiles` server-side (same pattern as candidate applications). Candidates are allowed to vote; one vote per student per election is enforced by `UNIQUE(election_id, voter_id)`. |
| `src/app/voting-interface/components/VotingInterfaceInteractive.tsx` | Submission is now **awaited**; success modal + receipt are shown **only after the API confirms the row was stored**; failures show a clear "Vote Not Recorded" banner (e.g. "Voting is not open", "You have already voted"). |
| `src/app/voting-interface/components/ConfirmationModal.tsx` | Disables buttons + shows a spinner while the vote is being recorded. |
| `src/app/voting-interface/components/SuccessModal.tsx` | "View Election Results" now points to `/student-election-results` (real data) instead of the mock `/election-results` info page. |
| `src/app/api/results/route.ts` | **New** server route: counts ballots straight from the `votes` table with the service-role key (authoritative, bypasses RLS) and returns per-election + per-candidate tallies. |
| `src/app/electoral-commission-panel/election-results/components/CommissionElectionResultsInteractive.tsx` | Commission results now overlay the authoritative `/api/results` counts (fallback to counter columns); fixed a latent bug where the default selected election was the mock id `'election-1'`, so nothing rendered on first load. |

## Data fix already applied to the live DB

The test election **"My New Election" / "Student Council 2026"**
(`be05d277-91dd-4783-a829-ff8810556568`) — which has 2 approved candidates —
had its voting window set to an open one:
`voting_start`/`voting_end` = **2026-08-08 → 2026-08-16** and `status = 'active'`.

## How to verify end-to-end

1. Run the SQL migration (step above). If you already ran an earlier version,
   re-run it — it is idempotent and this is what drops the broken triggers.
   Quick sanity check: `POST /rest/v1/votes` with the service-role key should
   now succeed (or return a duplicate-key `23505`), never `42703`/`user_id`.
2. Start the app, log in as a student, cast a vote in "My New Election" —
   the success screen now shows the **real** receipt from the API.
3. Log in as the **Electoral Commission** → **Results** — the page auto-refreshes
   every 5s and shows the live count for that election.
4. Bonus check: the vote row is visible in Supabase Table Editor → `votes`.

## Note

`src/app/election-results/components/ResultsInteractive.tsx` contains hardcoded
demo numbers (Kwame Mensah, 2145 votes, …) but is **dead code** — no page imports
it. `/election-results` is an informational page that links to the real
`/student-election-results`. The mock file can be deleted when convenient.

## Follow-up: real candidate data on the results pages

After the vote fix, the commission results page showed correct live counts but
looked "mocked up" — candidate photos were stock Unsplash images and clicking an
election was undone seconds later. Verified against the live DB (`candidates`
has no `name` column; real columns are `full_name` / `photo_url` / `department`):

1. **Applicant photos never displayed.** The commission results page only read
   `candidate.avatar` (always empty), so every candidate fell back to a random
   stock photo. The real column is `photo_url` (full public Supabase storage URL
   in the `candidate-documents` bucket), and some legacy rows only contain a bare
   filename. Added `src/lib/candidate-photo.ts` — `resolveCandidatePhoto()` maps
   `photo_url` (falling back to `avatar`) and resolves storage paths to public
   URLs. Applied to commission, admin, and student results pages, plus an
   `onError` fallback to `/assets/images/no_image.png`. Verified: the live photo
   URL for the approved candidate returns **HTTP 200**.

2. **The election click was being silently undone.** `loadElections()` set the
   initial selection with `if (!selectedElection)`, but the 5-second auto-refresh
   ran the closure from the first render where `selectedElection` was always `''`
   — so every refresh snapped the view back to the first election, overriding the
   user's click. Fixed with `selectedElectionRef` so the choice is preserved
   across refreshes (only overridden if the election no longer exists). Applied to
   commission + admin results pages.

3. **"Infinity%" turnout** when `total_voters` is 0 — guarded the division so the
   card shows `0%`. Also removed the hardcoded header avatar and fake
   `notificationCount={5}` from the commission results page.

> Remaining "mock-looking" rows are **test data in the DB** (the two approved
> candidates are the same person in "Test position 2" / "Test position 4" under
> the test election). The results pages now render whatever real rows exist
> faithfully — create real elections/candidates and they display as-is.

