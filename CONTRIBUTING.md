# Contributing to Tashev Proof

The best contribution proves a real user task more reliably without turning Proof into another giant test framework.

## Principles

1. The acceptance contract remains human-readable.
2. Existing project tools should be reused rather than replaced.
3. Evidence must be explicit.
4. Unknown evidence is PARTIAL, never silently treated as success.
5. Secrets must not be required in committed contracts.
6. Proof must remain useful without an AI API or cloud account.

## Development

~~~bash
git clone https://github.com/tashev11/tashev-proof.git
cd tashev-proof
npm test
npm run lint
npm run smoke
~~~

## Good contributions

- evidence adapters
- browser/screenshot evidence
- GitHub PR reporting
- output formats such as JUnit or SARIF
- acceptance-contract examples
- security hardening
- cross-platform tests

For large features, open an issue first.
