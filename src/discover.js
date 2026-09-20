import { join } from 'node:path';
import { readJson } from './utils.js';

const SCRIPT_ORDER = ['lint', 'typecheck', 'test', 'build'];

export function discoverChecks(root) {
  const pkg = readJson(join(root, 'package.json'), null);
  const checks = [];

  if (pkg?.scripts) {
    for (const name of SCRIPT_ORDER) {
      if (pkg.scripts[name]) {
        checks.push({
          id: 'script-' + name,
          title: 'Project ' + name + ' passes',
          type: 'command',
          command: 'npm run ' + name,
          required: true,
          timeoutMs: name === 'test' ? 120000 : 90000,
          tags: ['baseline'],
        });
      }
    }
  }

  return checks;
}

export function starterCriteria() {
  return [
    {
      id: 'acceptance-1',
      title: 'Primary user flow works',
      type: 'manual',
      required: true,
      instructions: 'Replace this manual criterion with a command, HTTP, file or browser test when possible.',
      tags: ['acceptance'],
    },
  ];
}
