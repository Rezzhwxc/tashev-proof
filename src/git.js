import { exec } from './utils.js';

export function gitSnapshot(root) {
  const commit = exec('git', ['rev-parse', 'HEAD'], { cwd: root, timeout: 5000 });
  const branch = exec('git', ['branch', '--show-current'], { cwd: root, timeout: 5000 });
  const status = exec('git', ['status', '--porcelain=v1'], { cwd: root, timeout: 5000 });
  const remote = exec('git', ['remote', 'get-url', 'origin'], { cwd: root, timeout: 5000 });

  return {
    commit: commit.ok ? commit.stdout : null,
    branch: branch.ok ? branch.stdout : null,
    dirty: Boolean(status.stdout),
    remote: remote.ok ? remote.stdout.replace(/(https?:\/\/)[^/@]+@/, '$1[REDACTED]@') : null
  };
}

export function changedFilesSince(root, ref) {
  const r = exec('git', ['diff', '--name-only', ref + '...HEAD'], { cwd: root, timeout: 10000 });
  if (!r.ok) throw new Error(r.stderr || 'Cannot compare ' + ref + ' to HEAD');
  return r.stdout ? r.stdout.split('\n').filter(Boolean) : [];
}
