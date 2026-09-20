<p align="center">
  <img src="assets/hero-v2.svg" alt="Tashev Proof — AI said done. Proof checks if it is." width="100%">
</p>

<p align="center">
  <a href="https://github.com/tashev11/tashev-proof/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/tashev11/tashev-proof?style=for-the-badge&color=22c55e"></a>
  <a href="LICENSE"><img alt="MIT" src="https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge"></a>
  <img alt="Zero dependencies" src="https://img.shields.io/badge/runtime_dependencies-0-16a34a?style=for-the-badge">
  <img alt="Node 18+" src="https://img.shields.io/badge/Node.js-%3E%3D18-84cc16?style=for-the-badge">
  <a href="https://github.com/tashev11/tashev-proof/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/tashev11/tashev-proof?style=for-the-badge&color=22c55e"></a>
</p>

<p align="center">
  <strong>Proof-of-done for AI-assisted development.</strong><br>
  Turn a human task into an explicit acceptance contract, run real evidence, and get an honest ship verdict.
</p>

<p align="center">
  <a href="#-60-second-start"><strong>⚡ Quick start</strong></a>
  ·
  <a href="#-what-problem-does-proof-solve"><strong>🎯 Why Proof</strong></a>
  ·
  <a href="#-evidence-types"><strong>🔬 Evidence</strong></a>
  ·
  <a href="#-architecture"><strong>🧠 Architecture</strong></a>
  ·
  <a href="README_RU.md"><strong>🇷🇺 Русская версия</strong></a>
</p>

---

# 🎯 What problem does Proof solve?

AI coding agents can implement features incredibly fast.

The weak point is what happens **after** the agent says:

> Done ✅

Did it test the edge cases?
Did another flow regress?
Did the API actually respond?
Did the mobile layout still work?
Was the original human request fully completed — or only the obvious 80%?

<p align="center">
  <img src="assets/problem-solution.svg" alt="Without Proof vs with Tashev Proof" width="100%">
</p>

The cost of vibe coding is increasingly not only **writing the code**.

It is:

- reconstructing what “done” was supposed to mean;
- manually checking the same flows after every AI change;
- discovering missing edge cases after deploy;
- asking the coding agent to review its own work;
- repeating “check everything again” because there is no independent acceptance layer;
- shipping with confidence based on conversation rather than evidence.

**Tashev Proof is a small verification layer between “AI finished coding” and “ship it”.**

---

# 🧩 The core idea

A coding agent should not be the final authority on whether its own work is complete.

Proof makes “done” explicit:

<p align="center">
  <img src="assets/pipeline.svg" alt="Tashev Proof pipeline" width="100%">
</p>

The pipeline is intentionally simple:

1. **Human task** — what the user actually asked for.
2. **Acceptance contract** — what must be true before the task counts as complete.
3. **Evidence** — tests, commands, files, HTTP checks and explicit human review.
4. **Verdict** — PROVEN, PARTIAL or FAILED.

Proof does not need to understand or rewrite your entire application.
It needs to answer one question reliably:

> **Do we have enough evidence to call this task done?**

---

# ✅ Three honest outcomes

<p align="center">
  <img src="assets/verdicts.svg" alt="PROVEN, PARTIAL and FAILED verdicts" width="100%">
</p>

| Verdict | Meaning | Release decision |
| --- | --- | --- |
| **PROVEN** | Every required criterion has evidence | Ready to ship |
| **PARTIAL** | Nothing failed, but required evidence is missing | More verification needed |
| **FAILED** | At least one required criterion failed | Do not ship |

A key design rule:

> **Unknown is not success.**

If a visual flow still needs a human review, Proof says **PARTIAL** instead of pretending the task passed.

---

# 👤 Who is this for?

### Vibe coders
You can build with Claude Code, Codex, Cursor, Gemini, Windsurf or another agent without becoming a full-time QA engineer just to understand whether the result is releasable.

### Founders and product owners
You care about the feature that was requested — not only whether one technical test returned green.

### Solo developers
Proof turns your implicit release checklist into a repeatable contract.

### Small AI-heavy teams
Different people and agents can work quickly while the definition of “done” stays visible and reviewable.

### Maintainers of AI-generated code
Proof gives contributors a common acceptance layer without forcing a new test framework.

---

# ⚡ 60-second start

<p align="center">
  <img src="assets/quickstart.svg" alt="Tashev Proof quick start" width="100%">
</p>

## 1. Install

From the current GitHub release:

```bash
npm install -g https://github.com/tashev11/tashev-proof/releases/download/v0.1.0/tashev-proof-0.1.0.tgz
```

Or from source:

```bash
git clone https://github.com/tashev11/tashev-proof.git
cd tashev-proof
npm install -g .
```

Check it:

```bash
proof --help
```

## 2. Initialize a task

Inside your project:

```bash
proof init --task "Add password reset"
```

Proof creates:

```text
.proof/
├── contract.json
└── README.md
```

It also discovers common npm scripts such as:

- `lint`
- `typecheck`
- `test`
- `build`

If **Tashev Relay** is present, Proof can inherit the current Relay task automatically.

## 3. Define what “done” means

Edit:

```text
.proof/contract.json
```

Example:

```json
{
  "schemaVersion": 1,
  "project": "my-app",
  "task": "Add password reset",
  "criteria": [
    {
      "id": "auth-tests",
      "title": "Authentication regression tests pass",
      "type": "command",
      "command": "npm test -- auth",
      "required": true
    },
    {
      "id": "reset-api",
      "title": "Reset endpoint responds correctly",
      "type": "http",
      "url": "http://localhost:3000/api/password/reset/health",
      "status": 200,
      "required": true
    },
    {
      "id": "mobile-ux",
      "title": "Mobile reset flow was visually checked",
      "type": "manual",
      "required": true
    }
  ]
}
```

## 4. Run evidence

```bash
proof run
```

## 5. Add human evidence where automation should not fake certainty

```bash
proof attest mobile-ux \
  --note "Checked the full reset flow on a 390px viewport" \
  --by "Rinat"
```

## 6. Gate the release

```bash
proof ship
```

Example:

```text
TASHEV PROOF
AI said done. Proof checks if it is.

Task: Add password reset

✓ Authentication regression tests pass
✓ Reset endpoint responds correctly
✓ Mobile reset flow was visually checked

Evidence: 3 proven · 0 failed · 0 unverified
STATUS: PROVEN ✓

READY TO SHIP ✓
```

---

# 🔬 Evidence types

Proof intentionally reuses the tooling your project already trusts.

<p align="center">
  <img src="assets/evidence.svg" alt="Tashev Proof evidence types" width="100%">
</p>

## 1. Command evidence

Run any existing project command:

```json
{
  "id": "checkout-e2e",
  "title": "Checkout browser flow passes",
  "type": "command",
  "command": "npx playwright test checkout.spec.ts",
  "required": true
}
```

That means Proof can orchestrate:

- Jest / Vitest
- pytest
- Playwright
- Cypress
- Go tests
- lint
- typecheck
- builds
- security scanners
- shell scripts
- custom project verification tools

**Proof is not trying to replace any of them.**

## 2. File existence evidence

```json
{
  "id": "migration",
  "title": "Database migration exists",
  "type": "file_exists",
  "path": "migrations/2026_add_reset_token.sql",
  "required": true
}
```

Useful for:

- migrations;
- generated files;
- build artifacts;
- config files;
- expected assets.

## 3. File content evidence

```json
{
  "id": "route",
  "title": "Reset route is registered",
  "type": "file_contains",
  "path": "src/routes.js",
  "contains": "/password/reset",
  "required": true
}
```

Regular expressions are supported with `regex` and optional `flags`.

## 4. HTTP evidence

```json
{
  "id": "production-health",
  "title": "Production health endpoint is healthy",
  "type": "http",
  "url": "https://example.com/health",
  "status": 200,
  "contains": "\"ok\":true",
  "required": true
}
```

Useful for:

- REST APIs;
- health endpoints;
- deployed services;
- webhook test endpoints;
- internal services.

Credentials do not need to live in the contract:

```json
{
  "headers": {
    "Authorization": "Bearer {{env.PROOF_API_TOKEN}}"
  }
}
```

## 5. Human evidence

Some things should stay explicitly human:

- visual polish;
- UX quality;
- wording;
- business approval;
- physical-device behavior;
- legal/content review;
- product-owner acceptance.

```bash
proof attest mobile-ux \
  --note "Checked on a real iPhone" \
  --by "Product owner"
```

Revoke it any time:

```bash
proof revoke mobile-ux
```

This is a feature, not a limitation.

Proof does not pretend a machine proved something that only a human actually reviewed.

---

# 🧠 Architecture

<p align="center">
  <img src="assets/architecture-v2.svg" alt="Tashev Proof architecture" width="100%">
</p>

Proof has four layers:

### Input
A human task or a current Tashev Relay task.

### Contract
A reviewable `.proof/contract.json` that defines acceptance criteria.

### Evidence adapters
Commands, files, HTTP and human attestations.

### Verdict
A deterministic summary and release exit code.

Generated runtime data stays under:

```text
.proof/
├── contract.json          # acceptance contract — commit this
├── attestations.json      # local human evidence — ignored
├── latest.json            # last run — ignored
├── evidence/              # raw evidence — ignored
│   └── <run-id>/
│       ├── tests.txt
│       ├── api.txt
│       └── mobile-ux.txt
└── reports/               # Markdown reports — ignored
    └── <run-id>.md
```

The contract can travel with the code.
Runtime evidence remains local by default.

---

# 🧪 Why this is not another test framework

<p align="center">
  <img src="assets/test-vs-proof.svg" alt="Test framework compared with Tashev Proof" width="100%">
</p>

A test framework answers:

> Did this assertion pass?

Proof answers:

> Does the evidence we have prove the original human task is complete?

That difference matters.

A feature may have 100% green unit tests and still be incomplete because:

- a required route was never wired;
- a mobile flow was not reviewed;
- production health was never checked;
- a business rule is missing;
- the requested user-visible behavior is not covered by those tests.

Proof sits **above** individual testing tools and maps evidence back to acceptance criteria.

---

# 🔁 Verify only what changed

Criteria can optionally describe relevant files:

```json
{
  "id": "auth-regression",
  "title": "Authentication regression suite passes",
  "type": "command",
  "command": "npm test -- auth",
  "required": true,
  "files": [
    "src/auth/**",
    "src/session/**"
  ]
}
```

Then:

```bash
proof run --since HEAD~3
```

Proof uses Git changes to select impacted criteria.

Criteria without file mappings remain conservative and still run.

That gives you **faster verification without silently skipping unknown impact**.

---

# 🚦 Release gate

`proof ship` is designed to be usable in release automation.

Behavior:

- **PROVEN** → exit success
- **PARTIAL** → exit non-zero
- **FAILED** → exit non-zero

Example CI idea after installing Proof:

```yaml
- name: Install Tashev Proof
  run: npm install -g https://github.com/tashev11/tashev-proof/releases/download/v0.1.0/tashev-proof-0.1.0.tgz

- name: Verify release
  run: proof ship
```

This lets the same acceptance contract work locally and in CI.

---

# 📊 Reports and evidence

Every run creates a readable Markdown report.

Example:

```text
# Tashev Proof Report

Task: Add password reset
Verdict: PROVEN

✅ Authentication tests pass
✅ Reset API is healthy
✅ Expired token is rejected
✅ Mobile UX manually attested

Commit: 9fa31b2c
```

Raw outputs are captured separately so the verdict is traceable to evidence.

The **v0.1.0 GitHub release of Tashev Proof itself includes its own generated Proof report**.

That is intentional dogfooding:

> Proof had to prove Proof before shipping.

---

# 🔐 Security model

Proof is local-first and does not require a Proof cloud account.

It does **not intentionally read**:

- AI provider authentication files;
- browser cookies;
- private SSH keys;
- `.env` files.

Common token/password patterns are redacted from captured evidence.

HTTP criteria can read secrets from environment variables:

```json
{
  "Authorization": "Bearer {{env.PROOF_API_TOKEN}}"
}
```

### Important trust boundary

A Proof contract may contain command criteria.

That means an untrusted `.proof/contract.json` can request execution of project commands.

Treat an unknown Proof contract the same way you treat:

- `package.json` scripts;
- Makefiles;
- CI workflows;
- shell scripts.

**Review it before running it.**

See [SECURITY.md](SECURITY.md).

---

# 🔗 Tashev Relay integration

Proof works independently.

But when `.relay/state.json` exists, `proof init` can inherit the current task from Tashev Relay.

The two tools solve different problems:

```text
Tashev Relay
“Where did we stop?”
       ↓
Tashev Proof
“What must be proven before we ship?”
```

<p align="center">
  <img src="assets/ecosystem.svg" alt="Tashev open source ecosystem" width="100%">
</p>

The broader idea:

- **TashevOS** — orchestrate and remember AI development
- **Tashev Relay** — continue across agents and machines
- **Tashev Proof** — independently verify “done”

---

# 🛠 CLI reference

| Command | Purpose |
| --- | --- |
| `proof init --task "..."` | Create a Proof contract |
| `proof plan` | Inspect and validate the contract |
| `proof contract` | Print the current contract |
| `proof run` | Execute evidence |
| `proof run --only id1,id2` | Run selected criteria |
| `proof run --since REF` | Run criteria impacted by Git changes |
| `proof attest ID --note "..."` | Add explicit human evidence |
| `proof revoke ID` | Revoke human evidence |
| `proof status` | Show the latest verdict |
| `proof ship` | Release gate — succeeds only when PROVEN |
| `proof version` | Print version |

---

# 💡 Real-world examples

## Authentication change

**Task**

```text
Add password reset.
```

**Proof contract can require**

- auth tests;
- endpoint health;
- expired token rejection;
- one-time token behavior;
- old password rejection;
- mobile UX review.

## Payment webhook

**Task**

```text
Handle duplicate payment webhooks safely.
```

**Proof contract can require**

- idempotency tests;
- DB state assertion via project command;
- webhook endpoint HTTP check;
- failed event path;
- retry path.

## Landing page change

**Task**

```text
Redesign pricing section for mobile.
```

**Proof contract can require**

- build succeeds;
- Playwright screenshot flow;
- no console errors;
- mobile viewport manual attestation;
- copy approval.

## Production hotfix

**Task**

```text
Fix 500 error on customer export.
```

**Proof contract can require**

- regression test;
- export file exists;
- production health endpoint;
- real export manually reviewed;
- only impacted checks via `--since`.

---

# 🧭 Design principles

### 1. Evidence over confidence
The coding agent's statement is not itself proof.

### 2. Unknown stays unknown
Unverified required evidence yields PARTIAL.

### 3. Reuse existing tools
Proof orchestrates your tests instead of reinventing them.

### 4. Human review stays visible
Manual acceptance is explicit, named and revocable.

### 5. Local-first
Core Proof works without a hosted service.

### 6. Agent-neutral
Claude, Codex, Cursor or another coding agent can implement the feature. Proof remains the acceptance layer.

### 7. Small core
The project should remain understandable and composable.

---

# 🌱 Roadmap

## v0.1 — shipped

- [x] acceptance contracts
- [x] command evidence
- [x] file existence/content evidence
- [x] HTTP evidence
- [x] human attestations
- [x] PROVEN / PARTIAL / FAILED
- [x] evidence reports
- [x] secret redaction
- [x] Git impact filtering
- [x] Relay task inheritance
- [x] ship-gate exit codes
- [x] zero runtime dependencies

## v0.2 — richer evidence

- [ ] first-class Playwright adapter
- [ ] screenshot / video / trace evidence
- [ ] GitHub PR report
- [ ] JUnit output
- [ ] SARIF output
- [ ] reusable policy packs

## v0.3 — smarter contracts

- [ ] optional acceptance-criteria suggestions
- [ ] Claude Code adapter
- [ ] Codex adapter
- [ ] Cursor / Gemini adapters
- [ ] contract drift detection
- [ ] requirement-to-evidence coverage map

## v0.4 — teams

- [ ] signed attestations
- [ ] proof history
- [ ] regression trends
- [ ] multi-service contracts
- [ ] MCP server
- [ ] optional encrypted evidence index

See [ROADMAP.md](ROADMAP.md).

---

# 🤝 Contributing

The most valuable contributions are:

- evidence adapters;
- security hardening;
- real acceptance-contract examples;
- GitHub/CI integrations;
- browser evidence;
- output formats;
- cross-platform testing.

Starter issues:

- [#1 — Playwright browser evidence + screenshots](https://github.com/tashev11/tashev-proof/issues/1)
- [#2 — GitHub PR Proof report](https://github.com/tashev11/tashev-proof/issues/2)
- [#3 — Acceptance-criteria suggestions](https://github.com/tashev11/tashev-proof/issues/3)
- [#4 — Real-world policy packs](https://github.com/tashev11/tashev-proof/issues/4)

Read [CONTRIBUTING.md](CONTRIBUTING.md).

---

# 🎨 Visual kit

The repository also ships a reusable visual system for launch posts, landing pages and documentation.

<p align="center">
  <img src="assets/icons/command.svg" width="52" alt="Command evidence">
  &nbsp;&nbsp;
  <img src="assets/icons/file.svg" width="52" alt="File evidence">
  &nbsp;&nbsp;
  <img src="assets/icons/http.svg" width="52" alt="HTTP evidence">
  &nbsp;&nbsp;
  <img src="assets/icons/human.svg" width="52" alt="Human evidence">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="assets/icons/proven.svg" width="52" alt="PROVEN">
  &nbsp;&nbsp;
  <img src="assets/icons/partial.svg" width="52" alt="PARTIAL">
  &nbsp;&nbsp;
  <img src="assets/icons/failed.svg" width="52" alt="FAILED">
</p>

Included assets:

- product hero;
- 1280×640 social-preview source;
- problem → solution diagram;
- verification pipeline;
- verdict cards;
- architecture;
- test-framework comparison;
- quick-start terminal visual;
- reusable evidence and status icons.

See [docs/BRANDING.md](docs/BRANDING.md).

---

# ❓ FAQ

### Does Proof use AI to decide whether code is correct?
Not in the v0.1 core. The core executes explicit evidence. Future AI-assisted contract suggestions are planned as optional drafts, not authoritative verdicts.

### Is Proof a replacement for Playwright, Jest or pytest?
No. It orchestrates them and connects their results to the human task.

### Does Proof upload my code or evidence?
No cloud upload is required by the core project.

### Can Proof test production?
Yes, through explicit HTTP criteria or project commands. Be careful with credentials and destructive actions.

### What happens if a criterion cannot be automated?
Use a manual criterion and explicit `proof attest`.

### Can the same contract run in CI?
Yes. `proof ship` returns a failing exit code unless all required criteria are PROVEN.

### Does Proof work without Tashev Relay?
Yes. Relay integration is optional.

### Why not just ask the coding AI to “check everything”?
Because that is still the same agent reasoning about its own result. Proof creates an explicit, repeatable evidence contract outside that conversation.

---

# ⭐ If this problem is familiar

If an AI has ever told you **“done”** and you still had to spend the next hour discovering what was not done, this project is for you.

<p align="center">
  <a href="https://github.com/tashev11/tashev-proof/stargazers"><strong>⭐ Star Tashev Proof</strong></a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="https://github.com/tashev11/tashev-proof/discussions"><strong>💬 Join Discussions</strong></a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="https://github.com/tashev11/tashev-proof/issues/new/choose"><strong>🧩 Contribute</strong></a>
</p>

---

# License

MIT © 2026 Rinat Tashev.

<p align="center">
  Built by <a href="https://github.com/tashev11"><strong>@tashev11</strong></a><br><br>
  <strong>Don't trust “done”. Prove it.</strong>
</p>
