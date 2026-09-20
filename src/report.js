import { join } from 'node:path';
import { escapeMd, writeText } from './utils.js';

export function summarize(results) {
  const counts = { proven: 0, failed: 0, unverified: 0, skipped: 0 };

  for (const r of results) {
    counts[r.status] = (counts[r.status] || 0) + 1;
  }

  const required = results.filter((r) => r.required);
  let verdict = 'PROVEN';

  if (required.some((r) => r.status === 'failed')) verdict = 'FAILED';
  else if (required.some((r) => r.status !== 'proven')) verdict = 'PARTIAL';

  return { counts, verdict, total: results.length };
}

export function markdownReport(run) {
  const icon = { proven: '✅', failed: '❌', unverified: '❓', skipped: '⏭️' };
  const lines = [
    '# Tashev Proof Report',
    '',
    '**Task:** ' + escapeMd(run.task),
    '',
    '**Verdict:** ' + run.summary.verdict,
    '',
    '| Status | Criterion | Evidence |',
    '| --- | --- | --- |'
  ];

  for (const r of run.results) {
    lines.push(
      '| ' + (icon[r.status] || '') + ' ' + r.status.toUpperCase() +
      ' | ' + escapeMd(r.title) +
      ' | ' + escapeMd(firstLine(r.detail)) + ' |'
    );
  }

  lines.push('', '## Run metadata', '', '- Run: ' + run.id, '- Created: ' + run.createdAt);

  if (run.git?.branch) lines.push('- Branch: ' + run.git.branch);
  if (run.git?.commit) lines.push('- Commit: ' + run.git.commit.slice(0, 12));

  return lines.join('\n') + '\n';
}

function firstLine(value) {
  return String(value || '').split('\n').find(Boolean) || '';
}

export function writeReport(root, run, reportsDir) {
  const file = join(reportsDir, run.id + '.md');
  writeText(file, markdownReport(run));
  return file;
}
