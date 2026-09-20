import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { discoverChecks, starterCriteria } from './discover.js';
import { relayTask } from './relay.js';
import { proofPaths } from './paths.js';
import { ensureDir, nowIso, readJson, writeJson } from './utils.js';

export function loadContract(root) {
  return readJson(proofPaths(root).contract, null);
}

export function initContract(root, task = '') {
  const p = proofPaths(root);
  ensureDir(p.dir);

  const relay = relayTask(root);
  const resolvedTask = task || relay?.current || 'Describe the user-visible task to prove';

  const contract = {
    schemaVersion: 1,
    project: basename(root),
    task: resolvedTask,
    createdAt: nowIso(),
    source: relay ? { type: 'tashev-relay', agent: relay.agent, next: relay.next } : { type: 'manual' },
    policy: {
      failOnRequiredFailure: true,
      partialOnUnverified: true,
      redactEvidence: true
    },
    criteria: [...discoverChecks(root), ...starterCriteria()]
  };

  writeJson(p.contract, contract);
  ensureGitignore(root);
  if (!existsSync(p.readme)) {
    writeFileSync(p.readme, '# Tashev Proof\n\ncontract.json is the acceptance contract. Evidence, latest run state and generated reports are ignored by Git by default.\n');
  }
  return contract;
}

function ensureGitignore(root) {
  const gitDir = join(root, '.git');
  if (!existsSync(gitDir)) return;

  const file = join(root, '.gitignore');
  const current = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const lines = ['.proof/latest.json', '.proof/attestations.json', '.proof/evidence/', '.proof/reports/'];
  const existing = current.split(/\r?\n/);
  const missing = lines.filter((x) => !existing.includes(x));

  if (missing.length) {
    appendFileSync(file, (current && !current.endsWith('\n') ? '\n' : '') + missing.join('\n') + '\n');
  }
}

export function validateContract(contract) {
  const errors = [];

  if (!contract || contract.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (!contract?.task?.trim()) errors.push('task is required');
  if (!Array.isArray(contract?.criteria) || contract.criteria.length === 0) {
    errors.push('at least one criterion is required');
  }

  const ids = new Set();
  for (const c of contract?.criteria || []) {
    if (!c.id) errors.push('criterion id is required');
    else if (ids.has(c.id)) errors.push('duplicate criterion id: ' + c.id);
    else ids.add(c.id);

    if (!c.title) errors.push('criterion title is required for ' + (c.id || '?'));
    if (!['command', 'file_exists', 'file_contains', 'http', 'manual'].includes(c.type)) {
      errors.push('unsupported criterion type for ' + (c.id || '?') + ': ' + c.type);
    }
    if (c.type === 'command' && !c.command) errors.push(c.id + ': command is required');
    if ((c.type === 'file_exists' || c.type === 'file_contains') && !c.path) {
      errors.push(c.id + ': path is required');
    }
    if (c.type === 'file_contains' && c.contains == null && c.regex == null) {
      errors.push(c.id + ': contains or regex is required');
    }
    if (c.type === 'http' && !c.url) errors.push(c.id + ': url is required');
  }

  return errors;
}
