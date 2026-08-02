'use strict';

const responseFormatter = require('../utils/responseFormatter');
const httpStatus = require('../constants/httpStatus');
const logger = require('../utils/logger');
const { resolveServiceForUrl } = require('../services/platform.service');

async function download(req, res) {
  const { url } = req.body;

  const { platform, service } = resolveServiceForUrl(url);

  logger.info('Download requested', { url, platform });

  const result = await service.download(url);

  return responseFormatter.success(res, {
    statusCode: httpStatus.OK,
    message: 'Available qualities fetched successfully',
    data: {
      platform,
      url,
      title: result.title,
      thumbnail: result.thumbnail,
      duration: result.duration,
      qualities: result.qualities,
    },
  });
}

module.exports = { download };
