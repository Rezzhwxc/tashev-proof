import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function exec(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    timeout: options.timeout ?? 30000,
    shell: options.shell ?? false,
    env: { ...process.env, ...(options.env || {}) },
    stdio: 'pipe',
  });
  return {
    ok: result.status === 0,
    status: result.status,
    signal: result.signal,
    stdout: String(result.stdout || '').trim(),
    stderr: String(result.stderr || '').trim(),
    error: result.error?.message || null,
  };
}

export function shell(command, cwd, timeout = 30000) {
  const shellBin = process.platform === 'win32' ? process.env.COMSPEC || 'cmd.exe' : process.env.SHELL || '/bin/sh';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', command] : ['-lc', command];
  return exec(shellBin, args, { cwd, timeout });
}

export function ensureDir(path) { mkdirSync(path, { recursive: true }); }
export function exists(path) { return existsSync(path); }
export function readText(path, fallback = '') {
  try { return readFileSync(path, 'utf8'); } catch { return fallback; }
}
export function readJson(path, fallback = null) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return fallback; }
}
export function writeJson(path, value) {
  ensureDir(dirname(path));
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n', 'utf8');
}
export function writeText(path, value) {
  ensureDir(dirname(path));
  writeFileSync(path, value, 'utf8');
}
export function nowIso() { return new Date().toISOString(); }
export function idFromNow() { return nowIso().replace(/[:.]/g, '-'); }
export function truncate(text, max = 6000) {
  const s = String(text || '');
  return s.length <= max ? s : s.slice(0, max) + '\n…[truncated]';
}
export function escapeMd(text) {
  return String(text || '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}
