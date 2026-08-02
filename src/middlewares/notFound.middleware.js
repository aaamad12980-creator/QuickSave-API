'use strict';

const AppError = require('../errors/AppError');
const errorCodes = require('../errors/errorCodes');

/**
 * Catches any request that didn't match a defined route and forwards
 * a standardized 404 error to the centralized error handler.
 */
function notFound(req, res, next) {
  next(
    AppError.notFound(
      `Route ${req.method} ${req.originalUrl} not found`,
      errorCodes.ROUTE_NOT_FOUND
    )
  );
}

module.exports = notFound;
