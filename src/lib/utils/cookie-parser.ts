// src/lib/utils/cookie-parser.ts

export function parseCookieHeader(cookieHeader: string | null): { [key: string]: string } {
  const cookies: { [key: string]: string } = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      const name = parts.shift()?.trim();
      if (name) {
        const value = parts.join('=').trim();
        cookies[name] = value;
      }
    });
  }
  return cookies;
}