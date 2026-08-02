'use strict';

const logger = require('../utils/logger');

/**
 * Logs basic metadata for every incoming HTTP request and its response
 * status/duration. Intentionally lightweight (no external dependency like
 * morgan) so behavior stays fully under our control.
 */
function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

    logger.info('HTTP request', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: req.ip,
    });
  });

  next();
}

module.exports = requestLogger;
