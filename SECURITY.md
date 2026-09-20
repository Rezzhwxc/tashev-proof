# Security Policy

Tashev Proof is local-first. It executes verification commands and records evidence on the user's machine.

## Important trust boundary

The Proof contract can contain command criteria. Running a contract therefore executes commands from that repository.

Treat an unfamiliar .proof/contract.json like an unfamiliar package.json script, Makefile or CI workflow: review it before running proof.

## Secrets

Proof does not intentionally read:
- AI-provider authentication files
- browser cookies
- private SSH keys
- .env files

HTTP criteria support environment placeholders such as {{env.PROOF_API_TOKEN}} so credentials do not need to be committed into the contract.

Captured command/HTTP evidence is passed through common token/password redaction patterns. Redaction is defense in depth, not a substitute for keeping secrets out of command output.

## Evidence storage

Runtime files are local and ignored by Git by default:
- .proof/latest.json
- .proof/attestations.json
- .proof/evidence/
- .proof/reports/

The contract itself is intended to be reviewable and commit-friendly.

## Reporting vulnerabilities

Please use GitHub private vulnerability reporting for this repository. Do not include real tokens, private source code or customer data in a public issue.

High priority areas include:
- command execution escaping
- path traversal
- secret leakage in evidence
- environment substitution bugs
- unsafe report rendering
