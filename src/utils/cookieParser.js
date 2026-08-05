'use strict';

function parseNetscapeCookies(content) {
  if (!content) return [];

  const lines = content.split('\n');
  const cookies = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const parts = line.split('\t');
    if (parts.length < 7) continue;

    const [domain, , path, secure, expiry, name, value] = parts;
    if (!domain || !name) continue;

    cookies.push({
      name,
      value,
      domain,
      path: path || '/',
      expires: Number(expiry) || -1,
      httpOnly: false,
      secure: String(secure).toUpperCase() === 'TRUE',
      sameSite: 'Lax',
    });
  }

  return cookies;
}

module.exports = { parseNetscapeCookies };
