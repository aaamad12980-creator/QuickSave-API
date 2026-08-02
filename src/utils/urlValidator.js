'use strict';

/**
 * Validates whether a given string is a well-formed, absolute HTTP(S) URL.
 *
 * @param {string} value
 * @returns {boolean}
 */
function isValidUrl(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return false;
  }

  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

/**
 * Normalizes a URL string (trims whitespace, ensures no trailing slash
 * inconsistencies for hostname comparisons).
 *
 * @param {string} value
 * @returns {string}
 */
function normalizeUrl(value) {
  return typeof value === 'string' ? value.trim() : value;
}

/**
 * Extracts the hostname (lowercased) from a URL string. Returns null if
 * the URL is invalid.
 *
 * @param {string} value
 * @returns {string|null}
 */
function extractHostname(value) {
  if (!isValidUrl(value)) return null;
  try {
    return new URL(normalizeUrl(value)).hostname.toLowerCase();
  } catch (err) {
    return null;
  }
}

module.exports = { isValidUrl, normalizeUrl, extractHostname };
