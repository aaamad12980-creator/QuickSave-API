'use strict';

const responseFormatter = require('../utils/responseFormatter');
const httpStatus = require('../constants/httpStatus');
const logger = require('../utils/logger');
const { resolveServiceForUrl, resolveServiceByName } = require('../services/platform.service');

async function search(req, res) {
  const { url, query, platform } = req.body;

  if (url) {
    const { platform: detectedPlatform, service } = resolveServiceForUrl(url);
    logger.info('Link search requested', { url, platform: detectedPlatform });

    const metadata = await service.fetchMetadata(url);

    return responseFormatter.success(res, {
      statusCode: httpStatus.OK,
      message: 'Metadata fetched successfully',
      data: { mode: 'link', platform: detectedPlatform, url, metadata },
    });
  }

  const { platform: resolvedPlatform, service } = resolveServiceByName(platform);
  logger.info('Keyword search requested', { query, platform: resolvedPlatform });

  const results = await service.search(query);

  return responseFormatter.success(res, {
    statusCode: httpStatus.OK,
    message: 'Search completed successfully',
    data: { mode: 'search', platform: resolvedPlatform, query, results },
  });
}

module.exports = { search };
