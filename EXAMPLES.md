# Proof Examples Gallery

Small, real-world examples of how Proof verifies features that are often built quickly with AI assistance ("vibe-coded"). Each example shows an actual `.proof/contract.json`, explains what Proof automates, what stays manual, and why.

> Conventions used in this file: ✅ PROVEN · 🟡 PARTIAL · ❌ FAILED

---

## 1. Authentication / Password Reset

**Task:** "Users can sign up, log in, and reset a forgotten password."

```json
{
  "schemaVersion": 1,
  "project": "myapp",
  "task": "Authentication and password reset",
  "criteria": [
    {
      "id": "auth.signup",
      "title": "Signup endpoint returns 201 with a session token",
      "type": "http",
      "method": "POST",
      "url": "http://localhost:3000/api/signup",
      "body": { "email": "test@example.com", "password": "hunter2" },
      "expect": { "status": 201, "bodyContains": "token" }
    },
    {
      "id": "auth.login",
      "title": "Login succeeds with correct credentials",
      "type": "http",
      "method": "POST",
      "url": "http://localhost:3000/api/login",
      "body": { "email": "test@example.com", "password": "hunter2" },
      "expect": { "status": 200, "bodyContains": "token" }
    },
    {
      "id": "auth.reset-email",
      "title": "Password reset triggers an email job",
      "type": "command",
      "command": "npm run test:auth -- --reset-email"
    },
    {
      "id": "auth.review",
      "title": "Reset flow has token expiry and rate limiting",
      "type": "manual"
    }
  ]
}
```
- **Automated:** signup/login endpoints, token issuance, reset email job.
- **Manual:** attestation that the reset flow follows security best practices (expiry, rate limiting) — verified by a human with `proof attest auth.review --note "..." --by "..."`.
- **Why:** HTTP and command criteria catch regressions in the happy path. Security posture is a judgment call that no script can sign off on.

## 2. Stripe-style Webhook Idempotency

**Task:** "Process Stripe webhooks exactly once, even if delivered multiple times."

```json
  {
    "schemaVersion": 1,
    "project": "myapp",
    "task": "Webhook idempotency",
    "criteria": [
      {
        "id": "webhook.first",
        "title": "First delivery of an event creates exactly one order",
        "type": "command",
        "command": "npm run test:webhook -- --event evt_test_1 --expect orders=1"
      },
      {
        "id": "webhook.duplicate",
        "title": "Duplicate delivery of the same event creates no new order",
        "type": "command",
        "command": "npm run test:webhook -- --event evt_test_1 --expect orders=1 --repeat"
      },
      {
        "id": "webhook.ack",
        "title": "Duplicate delivery still returns 200",
        "type": "http",
        "method": "POST",
        "url": "http://localhost:3000/webhooks/stripe",
        "headers": { "Stripe-Signature": "{{env.STRIPE_TEST_SIG}}" },
        "body": { "id": "evt_test_1", "type": "checkout.session.completed" },
        "expect": { "status": 200 }
      }
    ]
  }
```
- **Automated:** idempotency contract — same event yields same state; the ack still returns 200.
- **Manual:** not required for this task, but a reviewer may want to confirm the idempotency key strategy matches the provider's semantics.
- **Why:** Idempotency is easy to get subtly wrong. The `command` criterion asserts state, not just HTTP code — that's what actually matters.

## 3. REST API Health

**Task:** "The API is up, returns JSON, and responds within 500ms."

```json
  {
  "schemaVersion": 1,
  "project": "myapp",
  "task": "REST API health check",
  "criteria": [
    {
      "id": "health.up",
      "title": "/health returns 200 with status: ok",
      "type": "http",
      "method": "GET",
      "url": "http://localhost:3000/health",
      "expect": { "status": 200, "bodyContains": "\"status\":\"ok\"" }
    },
    {
      "id": "health.fast",
      "title": "/health responds in under 500ms",
      "type": "command",
      "command": "npm run test:health-latency -- --max-ms 500"
    },
    {
      "id": "health.deps",
      "title": "Database and cache are reachable from the health probe",
      "type": "manual"
    }
  ]
}
```
- **Automated:** endpoint contract (status, body), latency budget.
- **Manual:** whether the health probe actually exercises dependencies — otherwise it's a shallow check.
- **Why:** A health endpoint that only returns 200 is a false sense of safety. The manual criterion forces someone to confirm the probe is meaningful.

## 4. Database Migration

**Task:** "A schema migration can be applied and rolled back safely."

```json
  {
  "schemaVersion": 1,
  "project": "myapp",
  "task": "Safe DB migration",
  "criteria": [
    {
      "id": "migration.up",
      "title": "Migration applies on a fresh database",
      "type": "command",
      "command": "npm run db:migrate:up"
    },
    {
      "id": "migration.schema",
      "title": "Expected tables and columns exist after migration",
      "type": "command",
      "command": "npm run db:assert-schema -- --table orders --column status"
    },
    {
      "id": "migration.down",
      "title": "Migration rolls back cleanly",
      "type": "command",
      "command": "npm run db:migrate:down"
    },
    {
      "id": "migration.prod-safety",
      "title": "Migration is safe to run in production without downtime",
      "type": "manual"
    }
  ]
}
```
- **Automated:** up/down mechanics and schema shape.
- **Manual:** production safety (data volume, lock times, backfill strategy).
- **Why:** Automation can prove the mechanics, but "safe on 500M rows with live traffic" is not something a local command can decide.

## 5. Responsive UI + Human Attestation

**Task:** "The landing page is usable on mobile and desktop."

```json
  {
  "schemaVersion": 1,
  "project": "myapp",
  "task": "Responsive landing page",
  "criteria": [
    {
      "id": "ui.screenshots",
      "title": "Screenshots captured at mobile, tablet, desktop",
      "type": "command",
      "command": "npm run test:visual -- --viewports 375,768,1440"
    },
    {
      "id": "ui.regression",
      "title": "No unexpected visual diffs against baseline",
      "type": "command",
      "command": "npm run test:visual-diff -- --threshold 0.02"
    },
    {
      "id": "ui.review",
      "title": "A human reviewed the screenshots and approved the layout",
      "type": "manual"
    }
  ]
}
```
- **Automated:** screenshot capture and diff detection.
- **Manual:** attestation that the layout is actually good — not just "unchanged".
- **Why:** Visual correctness is subjective. Automation can flag changes; only a human can say whether they're improvements.

## 6. Release Readiness

**Task:** "Everything required for a release has been done."

```json
  {
  "schemaVersion": 1,
  "project": "myapp",
  "task": "Release v1.4.0",
  "criteria": [
    {
      "id": "release.tests",
      "title": "All tests pass",
      "type": "command",
      "command": "npm test"
    },
    {
      "id": "release.changelog",
      "title": "CHANGELOG.md contains v1.4.0",
      "type": "file_contains",
      "path": "CHANGELOG.md",
      "pattern": "v1\\.4\\.0"
    },
    {
      "id": "release.version",
      "title": "package.json version is 1.4.0",
      "type": "file_contains",
      "path": "package.json",
      "pattern": "\"version\":\\s*\"1\\.4\\.0\""
    },
    {
      "id": "release.signoff",
      "title": "Release manager approves the release",
      "type": "manual"
    }
  ]
}
```
- **Automated:** tests, changelog/version presence.
- **Manual:** the actual go/no-go decision.
- **Why:** Automation enforces the checklist. The decision to ship is a business call, not a file check.

---

## Where this leaves you

Every feature above follows the same shape:

- **Automated criteria** (`command`, `http`, `file_exists`, `file_contains`) prove the mechanics.
- **Manual criteria** capture the human judgment the mechanics cannot replace.
- **`PARTIAL` is a feature, not a failure** — it is the honest verdict when only the human half of the check is missing.

Copy the `.proof/contract.json` from any example above, point it at your project, run:

```bash
proof run
```

and read the verdicts.
