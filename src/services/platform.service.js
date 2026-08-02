'use strict';

const { PLATFORMS } = require('../constants/platforms');
const { detectPlatform } = require('../utils/platformDetector');
const AppError = require('../errors/AppError');
const errorCodes = require('../errors/errorCodes');

const youtubeService = require('./youtube.service');
const tiktokService = require('./tiktok.service');
const instagramService = require('./instagram.service');
const facebookService = require('./facebook.service');

const serviceRegistry = {
  [PLATFORMS.YOUTUBE]: youtubeService,
  [PLATFORMS.TIKTOK]: tiktokService,
  [PLATFORMS.INSTAGRAM]: instagramService,
  [PLATFORMS.FACEBOOK]: facebookService,
};

function resolveServiceForUrl(url) {
  const platform = detectPlatform(url);
  const service = serviceRegistry[platform];

  if (!service) {
    throw AppError.badRequest(
      'The provided URL does not belong to a supported platform (YouTube, TikTok, Instagram, Facebook)',
      errorCodes.UNSUPPORTED_PLATFORM
    );
  }

  return { platform, service };
}

function resolveServiceByName(platformName) {
  const service = serviceRegistry[platformName];

  if (!service) {
    throw AppError.badRequest(
      'Unsupported platform name',
      errorCodes.UNSUPPORTED_PLATFORM
    );
  }

  return { platform: platformName, service };
}

module.exports = { resolveServiceForUrl, resolveServiceByName, serviceRegistry };
