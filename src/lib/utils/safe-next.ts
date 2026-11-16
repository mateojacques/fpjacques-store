/**
 * The page to go to after login or sign-up. Only a path on this site is
 * accepted: it must start with a single `/` and contain no `\` and no control
 * characters (browsers drop tabs and newlines, so `/\t/evil.example` would
 * become `//evil.example`). Anything else, such as `//evil.example`,
 * `/\evil.example` or `https://evil.example`, falls back to the home page.
 */
export function safeNext(raw: string | null | undefined): string {
  if (!raw || !/^\/(?!\/)/.test(raw) || raw.includes('\\')) return '/';
  if (/[\u0000-\u001f\u007f]/.test(raw)) return '/';
  return raw;
}
