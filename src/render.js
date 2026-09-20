const tty = process.stdout.isTTY;

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m'
};

const color = (code, text) => tty ? code + text + c.reset : text;

export function header() {
  console.log(color(c.bold, 'TASHEV PROOF'));
  console.log(color(c.dim, 'AI said done. Proof checks if it is.\n'));
}

export function printRun(run) {
  header();
  console.log('Task: ' + run.task + '\n');

  for (const r of run.results) {
    const mark = r.status === 'proven'
      ? color(c.green, '✓')
      : r.status === 'failed'
        ? color(c.red, '✗')
        : color(c.yellow, '?');

    console.log(mark + ' ' + r.title + '  ' + color(c.dim, '(' + r.durationMs + 'ms)'));
  }

  const s = run.summary;
  console.log(
    '\nEvidence: ' +
    s.counts.proven + ' proven · ' +
    s.counts.failed + ' failed · ' +
    s.counts.unverified + ' unverified'
  );

  const verdict = s.verdict === 'PROVEN'
    ? color(c.green, s.verdict + ' ✓')
    : s.verdict === 'FAILED'
      ? color(c.red, s.verdict)
      : color(c.yellow, s.verdict);

  console.log('STATUS: ' + verdict);
}

export function printStatus(run) {
  if (!run) {
    header();
    console.log('No proof run yet.');
    return;
  }

  printRun(run);
  console.log('\nLast run: ' + run.createdAt);

  if (run.git?.commit) {
    console.log('Commit: ' + run.git.commit.slice(0, 12));
  }
}
