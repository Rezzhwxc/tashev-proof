# Proof Examples Gallery

This gallery shows how Proof can verify common features that are often built quickly with AI assistance ("vibe-coded"). Each example explains what is automated, what remains manual, and why.

---

## 1. Authentication / Password Reset

**Scenario:** A user signs up, logs in, and can reset a forgotten password via email.

**What Proof automates:**
- Checks that the signup endpoint returns 201 and a valid session token.
- Verifies that login with correct credentials returns 200 and a token.
- Triggers a password reset and asserts that a reset email is queued (via a mock SMTP or a test inbox).
- Confirms that using the reset token changes the password and old password no longer works.

**What remains manual:**
- Deciding whether the email content and UX are acceptable.
- Attesting that the reset flow follows security best practices (e.g., token expiry, rate limiting).

**Why:**
Automated checks catch regressions in the happy path, but security and user experience require human judgment.

---

## 2. Stripe-style Webhook Idempotency

**Scenario:** A payment provider sends webhooks that may be delivered multiple times. The system must process each event exactly once.

**What Proof automates:**
- Sends the same webhook payload twice.
- Asserts that the first call creates an order and the second call does not duplicate it.
- Verifies that the response to the duplicate is a 200 (acknowledgment) without side effects.
- Checks that the event ID is stored and used for deduplication.

**What remains manual:**
- Confirming that the chosen idempotency key strategy matches the provider's semantics.
- Reviewing that error handling for failed webhooks is robust.

**Why:**
Idempotency logic is easy to get wrong; automation ensures the basic contract, but the design still needs human review.

---

## 3. REST API Health

**Scenario:** A REST API is expected to be up and return a JSON health status.

**What Proof automates:**
- Calls the `/health` endpoint.
- Checks that the status code is 200.
- Validates the response against a JSON schema (e.g., `{ "status": "ok" }`).
- Measures response time and fails if it exceeds a threshold.

**What remains manual:**
- Deciding if the reported health actually reflects the system's ability to serve traffic.
- Attesting that dependencies (database, cache) are also healthy.

**Why:**
A health endpoint can be shallow; automated checks verify the contract, but not the depth of the check.

---

## 4. Database Migration

**Scenario:** A schema change is applied to a database, and the application must continue to work.

**What Proof automates:**
- Runs the migration on a fresh database.
- Verifies that the new schema matches expectations (tables, columns, types).
- Runs a set of queries that exercise the new schema.
- Rolls back the migration and confirms the database returns to the previous state.

**What remains manual:**
- Assessing data integrity for existing rows.
- Deciding if the migration is safe to run in production without downtime.

**Why:**
Automation can test the mechanics, but production safety often depends on data volume and live traffic.

---

## 5. Responsive UI + Human Attestation

**Scenario:** A web page should look correct on mobile and desktop.

**What Proof automates:**
- Takes screenshots at various viewport sizes (mobile, tablet, desktop).
- Checks that key elements are visible and not overlapping.
- Compares against baseline images to detect visual regressions.

**What remains manual:**
- A human reviews the screenshots and attests that the layout is usable and matches the design intent.
- Sign-off that the responsive behavior is acceptable.

**Why:**
Visual correctness is subjective; automation can flag changes, but a human must confirm they are improvements or at least acceptable.

---

## 6. Release Readiness

**Scenario:** Before a release, the team wants to ensure all checks pass and the artifact is ready.

**What Proof automates:**
- Runs the full test suite (unit, integration, e2e).
- Checks that all required approvals (e.g., code review, security scan) are present.
- Verifies that the version number and changelog are updated.
- Confirms that the build artifact is signed and reproducible.

**What remains manual:**
- A release manager attests that the release is ready for production.
- Final decision to deploy, based on business context.

**Why:**
Automation enforces the checklist, but the go/no-go decision remains human.

---

*These examples are illustrative. For specific Proof commands and configuration, refer to the official documentation.*
