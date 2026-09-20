import { join, resolve } from 'node:path';
import { exec } from './utils.js';

export function projectRoot(cwd = process.cwd()) {
  const r = exec('git', ['rev-parse', '--show-toplevel'], { cwd, timeout: 5000 });
  return r.ok ? r.stdout : resolve(cwd);
}

export function proofPaths(root) {
  const dir = join(root, '.proof');
  return {
    dir,
    contract: join(dir, 'contract.json'),
    latest: join(dir, 'latest.json'),
    attestations: join(dir, 'attestations.json'),
    evidence: join(dir, 'evidence'),
    reports: join(dir, 'reports'),
    readme: join(dir, 'README.md'),
  };
}
