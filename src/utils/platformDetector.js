'use strict';

const { PLATFORMS, PLATFORM_HOSTNAMES } = require('../constants/platforms');
const { extractHostname } = require('./urlValidator');

/**
 * Detects which supported platform a given URL belongs to, based on
 * hostname matching.
 *
 * @param {string} url
 * @returns {string} One of PLATFORMS.* (defaults to PLATFORMS.UNKNOWN)
 */
function detectPlatform(url) {
  const hostname = extractHostname(url);

  if (!hostname) {
    return PLATFORMS.UNKNOWN;
  }

  for (const [platform, hostnames] of Object.entries(PLATFORM_HOSTNAMES)) {
    if (hostnames.includes(hostname)) {
      return platform;
    }
  }

  return PLATFORMS.UNKNOWN;
}

/**
 * @param {string} url
 * @returns {boolean}
 */
function isSupportedPlatform(url) {
  return detectPlatform(url) !== PLATFORMS.UNKNOWN;
}

module.exports = { detectPlatform, isSupportedPlatform };
