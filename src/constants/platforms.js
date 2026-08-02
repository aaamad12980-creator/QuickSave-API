'use strict';

const PLATFORMS = Object.freeze({
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  UNKNOWN: 'unknown',
});

const PLATFORM_HOSTNAMES = Object.freeze({
  [PLATFORMS.YOUTUBE]: [
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'youtu.be',
    'music.youtube.com',
  ],
  [PLATFORMS.TIKTOK]: ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'],
  [PLATFORMS.INSTAGRAM]: ['instagram.com', 'www.instagram.com'],
  [PLATFORMS.FACEBOOK]: [
    'facebook.com',
    'www.facebook.com',
    'm.facebook.com',
    'fb.watch',
    'web.facebook.com',
  ],
});

const SUPPORTED_PLATFORMS = Object.values(PLATFORMS).filter(
  (p) => p !== PLATFORMS.UNKNOWN
);

module.exports = {
  PLATFORMS,
  PLATFORM_HOSTNAMES,
  SUPPORTED_PLATFORMS,
};
