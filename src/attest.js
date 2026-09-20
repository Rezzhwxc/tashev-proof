import { proofPaths } from './paths.js';
import { nowIso, readJson, writeJson } from './utils.js';
import { redact } from './redact.js';

export function loadAttestations(root) {
  return readJson(proofPaths(root).attestations, {});
}

export function attest(root, criterionId, note, by = 'human') {
  const current = loadAttestations(root);
  current[criterionId] = {
    criterionId,
    note: redact(note),
    by,
    at: nowIso()
  };
  writeJson(proofPaths(root).attestations, current);
  return current[criterionId];
}

export function revoke(root, criterionId) {
  const current = loadAttestations(root);
  const existed = Boolean(current[criterionId]);
  delete current[criterionId];
  writeJson(proofPaths(root).attestations, current);
  return existed;
}
