function stripSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

export function withBase(path: string, base = '/'): string {
  const trailingSlash = path.endsWith('/');
  const parts = [stripSlashes(base), stripSlashes(path)].filter(Boolean);
  const joined = `/${parts.join('/')}`.replace(/\/{2,}/g, '/');

  return trailingSlash && joined !== '/' ? `${joined}/` : joined || '/';
}

export function absoluteSiteUrl(
  path: string,
  site = 'https://example.invalid',
  base = '/',
): string {
  const origin = site.endsWith('/') ? site : `${site}/`;
  return new URL(withBase(path, base), origin).toString();
}
