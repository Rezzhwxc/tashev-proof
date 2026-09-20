import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { redact } from './redact.js';
import { shell, truncate } from './utils.js';

function resolveEnv(value) {
  return String(value || '').replace(/\{\{env\.([A-Z0-9_]+)\}\}/g, (_, name) => {
    if (!(name in process.env)) throw new Error('Missing environment variable: ' + name);
    return process.env[name];
  });
}

function mapEnv(headers) {
  return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, resolveEnv(value)]));
}

function result(base, status, detail, started) {
  return {
    ...base,
    status,
    detail: redact(truncate(detail || '', 6000)),
    durationMs: Math.round(performance.now() - started)
  };
}

export async function runCriterion(root, criterion, context = {}) {
  const started = performance.now();
  const base = {
    id: criterion.id,
    title: criterion.title,
    type: criterion.type,
    required: criterion.required !== false,
    tags: criterion.tags || []
  };

  try {
    if (criterion.type === 'manual') {
      const attestation = context.attestations?.[criterion.id];
      if (attestation) {
        return result(base, 'proven', 'Human attestation by ' + attestation.by + ' at ' + attestation.at + '\n' + attestation.note, started);
      }
      return result(base, 'unverified', criterion.instructions || 'Manual evidence required.', started);
    }

    if (criterion.type === 'command') {
      const r = shell(criterion.command, root, criterion.timeoutMs || 60000);
      const detail = [
        '$ ' + criterion.command,
        r.stdout && '\nstdout:\n' + r.stdout,
        r.stderr && '\nstderr:\n' + r.stderr,
        r.error && '\nerror:\n' + r.error
      ].filter(Boolean).join('');

      return result(base, r.ok ? 'proven' : 'failed', detail || 'exit ' + r.status, started);
    }

    if (criterion.type === 'file_exists') {
      const path = resolve(root, criterion.path);
      return result(base, existsSync(path) ? 'proven' : 'failed', criterion.path, started);
    }

    if (criterion.type === 'file_contains') {
      const path = resolve(root, criterion.path);
      if (!existsSync(path)) return result(base, 'failed', 'File not found: ' + criterion.path, started);

      const content = readFileSync(path, 'utf8');
      let pass = false;

      if (criterion.regex != null) {
        pass = new RegExp(criterion.regex, criterion.flags || '').test(content);
      } else {
        pass = content.includes(String(criterion.contains));
      }

      return result(
        base,
        pass ? 'proven' : 'failed',
        pass ? 'Expected content found in ' + criterion.path : 'Expected content not found in ' + criterion.path,
        started
      );
    }

    if (criterion.type === 'http') {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), criterion.timeoutMs || 10000);

      try {
        const response = await fetch(resolveEnv(criterion.url), {
          method: criterion.method || 'GET',
          headers: mapEnv(criterion.headers || {}),
          body: criterion.body == null
            ? undefined
            : (typeof criterion.body === 'string' ? criterion.body : JSON.stringify(criterion.body)),
          signal: controller.signal
        });

        const body = await response.text();
        const expected = criterion.status ?? 200;
        let pass = response.status === expected;

        if (pass && criterion.contains != null) pass = body.includes(String(criterion.contains));
        if (pass && criterion.regex != null) pass = new RegExp(criterion.regex, criterion.flags || '').test(body);

        return result(base, pass ? 'proven' : 'failed', 'HTTP ' + response.status + '\n' + truncate(body, 3000), started);
      } finally {
        clearTimeout(timer);
      }
    }

    return result(base, 'failed', 'Unsupported check type.', started);
  } catch (error) {
    return result(base, 'failed', error?.stack || error?.message || String(error), started);
  }
}
