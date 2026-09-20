import { join } from 'node:path';
import { runCriterion } from './checks.js';
import { loadAttestations } from './attest.js';
import { loadContract, validateContract } from './contract.js';
import { gitSnapshot, changedFilesSince } from './git.js';
import { criterionImpacted } from './impact.js';
import { proofPaths } from './paths.js';
import { ensureDir, idFromNow, nowIso, writeJson, writeText } from './utils.js';
import { markdownReport, summarize } from './report.js';

export async function runProof(root, options = {}) {
  const contract = loadContract(root);
  const errors = validateContract(contract);

  if (errors.length) {
    throw new Error('Invalid proof contract:\n- ' + errors.join('\n- '));
  }

  const id = idFromNow();
  const p = proofPaths(root);
  const evidenceDir = join(p.evidence, id);
  ensureDir(evidenceDir);

  let criteria = contract.criteria;
  let changedFiles = null;

  if (options.since) {
    changedFiles = changedFilesSince(root, options.since);
    criteria = criteria.filter((c) => criterionImpacted(c, changedFiles));
  }

  if (options.only) {
    const ids = new Set(String(options.only).split(',').map((x) => x.trim()).filter(Boolean));
    criteria = criteria.filter((c) => ids.has(c.id));
  }

  if (!criteria.length) throw new Error('No criteria selected.');

  const results = [];
  const attestations = loadAttestations(root);

  for (const criterion of criteria) {
    const r = await runCriterion(root, criterion, { attestations });
    results.push(r);
    writeText(join(evidenceDir, r.id + '.txt'), r.detail || '');
  }

  const run = {
    schemaVersion: 1,
    id,
    createdAt: nowIso(),
    task: contract.task,
    git: gitSnapshot(root),
    since: options.since || null,
    changedFiles,
    results,
    summary: summarize(results)
  };

  writeJson(p.latest, run);
  writeText(join(p.reports, id + '.md'), markdownReport(run));

  return run;
}
