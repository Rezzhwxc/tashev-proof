const PATTERNS = [
  /\b(password|passwd|secret|token|api[_-]?key)\s*[=:]\s*[^\s]+/gi,
  /\b(Bearer)\s+[A-Za-z0-9._~+/=-]{12,}/gi,
  /\b(sk-[A-Za-z0-9_-]{16,})\b/g,
  /\b(gh[pousr]_[A-Za-z0-9_]{20,})\b/g,
];

export function redact(text) {
  let out = String(text || '');
  for (const pattern of PATTERNS) {
    out = out.replace(pattern, (m, key) => key ? key + '=[REDACTED]' : '[REDACTED]');
  }
  return out;
}
