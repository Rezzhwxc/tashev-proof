import { join } from 'node:path';
import { readJson } from './utils.js';

export function relayTask(root) {
  const state = readJson(join(root, '.relay', 'state.json'), null);
  if (!state) return null;
  const current = state.task?.current || '';
  const next = state.task?.next || '';
  return current ? { current, next, agent: state.session?.agent || null } : null;
}
