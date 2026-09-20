import { resolve } from 'node:path';
import { initContract, loadContract, validateContract } from './contract.js';
import { projectRoot, proofPaths } from './paths.js';
import { runProof } from './runner.js';
import { printRun, printStatus, header } from './render.js';
import { readJson } from './utils.js';
import { attest, revoke } from './attest.js';

const VERSION = '0.1.0';

function parse(argv) {
  const out = { _: [] };
  const valueKeys = new Set(['task', 'since', 'only', 'note', 'by']);

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];

    if (!a.startsWith('--')) {
      out._.push(a);
      continue;
    }

    const key = a.slice(2);

    if (valueKeys.has(key)) {
      const next = argv[i + 1];

      if (!next || next.startsWith('--')) {
        throw new Error('--' + key + ' requires a value');
      }

      out[key] = next;
      i++;
    } else {
      out[key] = true;
    }
  }

  return out;
}

function help() {
  console.log([
    'Tashev Proof ' + VERSION,
    'Proof-of-done for AI-assisted development.',
    '',
    'Usage:',
    '  proof init [--task "..."]',
    '  proof plan',
    '  proof run [--only id1,id2] [--since <git-ref>]',
    '  proof status',
    '  proof ship [--since <git-ref>]',
    '  proof attest <criterion-id> --note "..." [--by "..."]',
    '  proof revoke <criterion-id>',
    '  proof contract',
    '  proof version',
    '',
    'Workflow:',
    '  1. proof init --task "Add password reset"',
    '  2. edit .proof/contract.json',
    '  3. proof run',
    '  4. proof ship'
  ].join('\n'));
}

export async function run(argv) {
  const opts = parse(argv);
  const command = opts._[0] || 'help';

  if (opts.help || command === 'help') return help();
  if (opts.version || command === 'version') return console.log(VERSION);

  const root = projectRoot(resolve(process.cwd()));
  const p = proofPaths(root);

  if (command === 'init') {
    const contract = initContract(root, opts.task || '');

    header();
    console.log('Proof contract created: ' + p.contract);
    console.log('Task: ' + contract.task);
    console.log('Criteria: ' + contract.criteria.length);
    console.log('\nNext: edit .proof/contract.json, then run proof run.');

    return;
  }

  if (command === 'plan' || command === 'contract') {
    const contract = loadContract(root);

    if (!contract) {
      throw new Error('No proof contract. Run proof init first.');
    }

    const errors = validateContract(contract);

    header();
    console.log(JSON.stringify(contract, null, 2));

    if (errors.length) {
      console.log('\nContract problems:\n- ' + errors.join('\n- '));
      process.exitCode = 2;
    }

    return;
  }

  if (command === 'attest') {
    const criterionId = opts._[1];
    if (!criterionId) throw new Error('Usage: proof attest <criterion-id> --note "..."');
    if (!opts.note) throw new Error('--note is required for human attestation');

    const contract = loadContract(root);
    if (!contract) throw new Error('No proof contract. Run proof init first.');
    const criterion = contract.criteria.find((item) => item.id === criterionId);
    if (!criterion) throw new Error('Unknown criterion: ' + criterionId);
    if (criterion.type !== 'manual') throw new Error('Only manual criteria can be attested. Automated evidence should be rerun.');

    const item = attest(root, criterionId, opts.note, opts.by || 'human');
    header();
    console.log('✓ Attested: ' + criterion.title);
    console.log('By: ' + item.by);
    return;
  }

  if (command === 'revoke') {
    const criterionId = opts._[1];
    if (!criterionId) throw new Error('Usage: proof revoke <criterion-id>');
    const removed = revoke(root, criterionId);
    header();
    console.log(removed ? '✓ Attestation revoked: ' + criterionId : 'No attestation found: ' + criterionId);
    return;
  }

  if (command === 'run' || command === 'ship') {
    const result = await runProof(root, {
      only: opts.only,
      since: opts.since
    });

    printRun(result);
    console.log('\nReport: ' + p.reports + '/' + result.id + '.md');

    if (command === 'ship') {
      if (result.summary.verdict !== 'PROVEN') {
        console.log('\nDO NOT SHIP');
        process.exitCode = 2;
      } else {
        console.log('\nREADY TO SHIP ✓');
      }
    } else if (result.summary.verdict === 'FAILED') {
      process.exitCode = 2;
    }

    return;
  }

  if (command === 'status') {
    printStatus(readJson(p.latest, null));
    return;
  }

  help();
}
