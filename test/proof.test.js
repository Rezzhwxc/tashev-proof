import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import http from 'node:http';

import { initContract, validateContract } from '../src/contract.js';
import { runCriterion } from '../src/checks.js';
import { runProof } from '../src/runner.js';
import { summarize } from '../src/report.js';
import { redact } from '../src/redact.js';
import { criterionImpacted } from '../src/impact.js';
import { attest, loadAttestations, revoke } from '../src/attest.js';

function project() {
  const dir = mkdtempSync(join(tmpdir(), 'tashev-proof-'));
  execSync('git init -q', { cwd: dir });
  execSync('git config user.email proof@example.com', { cwd: dir });
  execSync('git config user.name "Proof Test"', { cwd: dir });
  writeFileSync(join(dir, 'README.md'), '# fixture\n');
  execSync('git add . && git commit -qm init', { cwd: dir });
  return dir;
}

test('summary produces PROVEN, PARTIAL and FAILED verdicts', () => {
  assert.equal(summarize([{ required: true, status: 'proven' }]).verdict, 'PROVEN');
  assert.equal(summarize([{ required: true, status: 'unverified' }]).verdict, 'PARTIAL');
  assert.equal(summarize([{ required: true, status: 'failed' }]).verdict, 'FAILED');
});

test('init discovers package scripts and creates a manual acceptance criterion', () => {
  const dir = project();
  writeFileSync(join(dir, 'package.json'), JSON.stringify({
    scripts: {
      lint: 'node -e "process.exit(0)"',
      test: 'node -e "process.exit(0)"',
      build: 'node -e "process.exit(0)"'
    }
  }));

  const contract = initContract(dir, 'Ship the feature');

  assert.equal(contract.task, 'Ship the feature');
  assert.ok(contract.criteria.some((c) => c.id === 'script-lint'));
  assert.ok(contract.criteria.some((c) => c.id === 'script-test'));
  assert.ok(contract.criteria.some((c) => c.id === 'script-build'));
  assert.ok(contract.criteria.some((c) => c.type === 'manual'));
});

test('init can inherit the current task from Tashev Relay', () => {
  const dir = project();
  mkdirSync(join(dir, '.relay'));
  writeFileSync(join(dir, '.relay/state.json'), JSON.stringify({
    task: { current: 'Fix signup', next: 'Run browser test' },
    session: { agent: 'claude' }
  }));

  const contract = initContract(dir);

  assert.equal(contract.task, 'Fix signup');
  assert.equal(contract.source.type, 'tashev-relay');
  assert.equal(contract.source.agent, 'claude');
});

test('contract validation rejects duplicate ids and broken checks', () => {
  const errors = validateContract({
    schemaVersion: 1,
    task: 'x',
    criteria: [
      { id: 'same', title: 'a', type: 'command' },
      { id: 'same', title: 'b', type: 'unknown' }
    ]
  });

  assert.ok(errors.some((e) => e.includes('duplicate criterion id')));
  assert.ok(errors.some((e) => e.includes('command is required')));
  assert.ok(errors.some((e) => e.includes('unsupported criterion type')));
});

test('command and file checks produce real evidence', async () => {
  const dir = project();
  writeFileSync(join(dir, 'feature.txt'), 'ready for users\n');

  const command = await runCriterion(dir, {
    id: 'cmd',
    title: 'command passes',
    type: 'command',
    command: 'node -e "console.log(42)"',
    required: true
  });

  const exists = await runCriterion(dir, {
    id: 'file',
    title: 'file exists',
    type: 'file_exists',
    path: 'feature.txt',
    required: true
  });

  const contains = await runCriterion(dir, {
    id: 'contains',
    title: 'content exists',
    type: 'file_contains',
    path: 'feature.txt',
    contains: 'ready for users',
    required: true
  });

  assert.equal(command.status, 'proven');
  assert.match(command.detail, /42/);
  assert.equal(exists.status, 'proven');
  assert.equal(contains.status, 'proven');
});

test('manual checks are PARTIAL until explicitly attested', async () => {
  const dir = project();
  const criterion = {
    id: 'mobile-ui',
    title: 'Mobile layout visually checked',
    type: 'manual',
    required: true
  };

  const before = await runCriterion(dir, criterion, { attestations: {} });
  assert.equal(before.status, 'unverified');

  attest(dir, 'mobile-ui', 'Checked on iPhone viewport', 'Rinat');
  const after = await runCriterion(dir, criterion, { attestations: loadAttestations(dir) });

  assert.equal(after.status, 'proven');
  assert.match(after.detail, /Rinat/);
  assert.equal(revoke(dir, 'mobile-ui'), true);
});

test('HTTP checks can read secrets from environment without putting them in the contract', async () => {
  const previous = process.env.PROOF_TEST_TOKEN;
  process.env.PROOF_TEST_TOKEN = 'secret-test-value';

  const server = http.createServer((req, res) => {
    if (req.headers.authorization === 'Bearer secret-test-value') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('{"ok":true}');
    } else {
      res.writeHead(401);
      res.end('unauthorized');
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    const result = await runCriterion(process.cwd(), {
      id: 'api',
      title: 'API responds',
      type: 'http',
      url: 'http://127.0.0.1:' + port,
      status: 200,
      contains: '"ok":true',
      headers: { Authorization: 'Bearer {{env.PROOF_TEST_TOKEN}}' },
      required: true
    });

    assert.equal(result.status, 'proven');
    assert.doesNotMatch(result.detail, /secret-test-value/);
  } finally {
    server.close();
    if (previous == null) delete process.env.PROOF_TEST_TOKEN;
    else process.env.PROOF_TEST_TOKEN = previous;
  }
});

test('redaction removes common credentials from evidence', () => {
  assert.equal(redact('password=hunter2'), 'password=[REDACTED]');
  assert.doesNotMatch(redact('Bearer ghp_1234567890123456789012345'), /123456789/);
});

test('impact filtering respects file patterns', () => {
  const criterion = { files: ['src/auth/**', 'package.json'] };

  assert.equal(criterionImpacted(criterion, ['src/auth/login.js']), true);
  assert.equal(criterionImpacted(criterion, ['package.json']), true);
  assert.equal(criterionImpacted(criterion, ['docs/readme.md']), false);
  assert.equal(criterionImpacted({}, ['anything.txt']), true);
});

test('runProof stores evidence and yields PARTIAL before manual attestation', async () => {
  const dir = project();
  mkdirSync(join(dir, '.proof'));
  writeFileSync(join(dir, '.proof/contract.json'), JSON.stringify({
    schemaVersion: 1,
    task: 'Verify fixture',
    criteria: [
      {
        id: 'automated',
        title: 'Automated command works',
        type: 'command',
        command: 'node -e "process.exit(0)"',
        required: true
      },
      {
        id: 'human',
        title: 'Human checked UX',
        type: 'manual',
        required: true
      }
    ]
  }));

  const first = await runProof(dir);
  assert.equal(first.summary.verdict, 'PARTIAL');

  attest(dir, 'human', 'Checked visually');
  const second = await runProof(dir);
  assert.equal(second.summary.verdict, 'PROVEN');

  const latest = JSON.parse(readFileSync(join(dir, '.proof/latest.json'), 'utf8'));
  assert.equal(latest.summary.verdict, 'PROVEN');
  assert.ok(readFileSync(join(dir, '.proof/reports', second.id + '.md'), 'utf8').includes('PROVEN'));
});
