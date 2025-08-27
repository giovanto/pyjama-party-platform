# Claude × Codex Collaboration Guide

Purpose: Enable repeatable, low-friction, multi-agent work between Claude Code and Codex without Giovanni having to restate context each session.

This document is the single source of truth for: branch strategy, roles, workflows, security gates, mutual verification, and handoff templates. On every new session, both agents should read this file first and follow the Start-of-Session Checklist.

---

## Roles & Strengths

- Claude Code (Anthropic): Schema refactors, data ingestion, map UX/perf, tests/E2E.
- Codex (OpenAI): Security, RLS, infra (rate limiting, CORS, monitoring), CI/build stability.

Both agents must verify each other’s claims before code merges.

---

## Branch Strategy

- `main`: Truth baseline (production-ready).
- `staging`: Integration testing target (optional but recommended for event phases).
- Topic branches:
  - `[fix|feat|refactor]/<short-name>`
  - Integration: `integration/<name>` only when needed.

Commit prefixes:
- `[CODEX] <message>` for Codex commits
- `[CLAUDE] <message>` for Claude commits

PR titles should start with the same prefix.

---

## Start-of-Session Checklist (Both Agents)

1) Sync and context
- `git fetch origin && git checkout main && git pull`.
- Read this file and any open PR descriptions.
- List active branches: `git log --oneline --all --graph --decorate --max-count=30`.

2) Environment & migrations
- Confirm required env vars in CI/staging/prod:
  - `CORS_ALLOW_ORIGINS`
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (if rate limiting enabled)
  - `SENTRY_DSN` (optional)
- Check pending migrations in `supabase/migrations/` and confirm applied.

3) Health & build
- `npm run build` locally (or CI) to spot blockers.
- `npm test` for unit/integration sanity (skip E2E if not configured).

4) Planning & ownership
- Create/Update a short plan (5–7 steps max) with owners, acceptance criteria, and test strategy.
- Post the plan in the PR or `docs/HANDOFF.md` (see template below).

5) Security & privacy gate (mandatory)
- Verify:
  - Public endpoints do not expose PII (email, names).
  - RLS and column grants prevent PII read via anon/auth roles.
  - No service-role keys in GET paths.
  - CORS allowlist is enforced (no wildcard).
  - Service worker does not cache PII endpoints.

6) Mutual verification
- Each agent writes a Claims Summary of what changed/assumed.
- The other agent verifies by:
  - Reading diffs
  - Running the code/tests against a neutral environment
  - Exercising API endpoints (curl or test scripts)
- Mark each claim as Verified / Needs Attention.

7) Handoff
- Update the Handoff Template (below) with status, next actions, and blockers.

---

## Security & Compliance Guardrails

- PII fields (emails, names, phone, IPs) must never be exposed by public APIs.
- Prefer sanitized views (e.g., `public_dreams`, `public_pyjama_parties`) for public reads.
- Views must be `security_invoker` so RLS applies to the caller.
- Service-role usage allowed only on server-only mutations with validation.
- Rate limiting enforced via shared Redis (Upstash) per approved quotas:
  - Dreams POST: 10 / 5 min / IP
  - Interview: 20 / min / IP
  - Analytics: 100 / min / IP
  - Read endpoints: 300 / min / IP
  - Event day global burst: 5k rpm cap
- Service worker: cache only non-PII endpoints (stats/impact/reality), no `/api/dreams`.

---

## PR Expectations

- Include: Summary, risks, env changes, migrations, test plan, and a short Claims Summary for cross-verification.
- Add acceptance criteria and any telemetry/monitoring notes (if applicable).
- Keep diffs focused (avoid drive-by changes unless critical).

---

## Handoff Template (Paste into PR or docs/HANDOFF.md)

```
Title: <branch-name> — <short description>

Context:
- Goal:
- Scope (in/out):
- Related PRs/Issues:

Changes:
- Implementation summary:
- Migrations (if any):
- Env vars (new/changed):

Security & Privacy:
- PII exposure: [None/Explain]
- RLS/views: [Validated/Explain]
- CORS: [Allowlist configured]
- Rate limiting: [Applied/Planned]

Claims Summary:
- Claim 1: …
- Claim 2: …
(Verifier to mark as Verified / Needs Attention)

Testing:
- Unit/Integration:
- Manual API checks:
- E2E (if applicable):

Acceptance Criteria:
- [ ] Criterion A
- [ ] Criterion B

Next Steps:
- Task 1 (owner)
- Task 2 (owner)

Blockers/Risks:
- …
```

---

## Quickstart for Giovanni (Session Kickoff)

When starting a new session with both agents, just say:

“Boot collaboration. Read docs/CLAUDE_CODEX_COLLABORATION.md, follow the Start-of-Session Checklist, and post your short joint plan, claims, and verification steps before coding.”

This eliminates re-explaining context; agents self-orient from this doc and current PRs.

---

## Current Focus (as of latest merge)

- Claude (refactor/remove-triphop): Strip TripHop; text-only station inputs; fix tests.
- Claude (feat/openrailmap-integration): Overpass offline fetch → static JSON; viewport API; GL clustering.
- Codex (fix/security-critical): Sanitize APIs; views/grants; CORS allowlist; remove service-role in GETs.
- Codex (fix/infrastructure): Upstash Redis rate limiting; Sentry; CI lint/TS fixes to green.

Keep PRs small and verify each other’s claims before merges.

