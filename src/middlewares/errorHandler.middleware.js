'use strict';

const env = require('../config/env');
const logger = require('../utils/logger');
const AppError = require('../errors/AppError');
const errorCodes = require('../errors/errorCodes');
const httpStatus = require('../constants/httpStatus');

/**
 * Centralized Express error-handling middleware. Every error in the
 * application (thrown synchronously, forwarded via next(err), or
 * surfaced through asyncHandler) ends up here.
 *
 * Must be registered LAST, after all routes/middlewares.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isAppError = err instanceof AppError;

  const statusCode = isAppError ? err.statusCode : httpStatus.INTERNAL_SERVER_ERROR;
  const code = isAppError ? err.code : errorCodes.INTERNAL_ERROR;
  const message = isAppError ? err.message : 'An unexpected error occurred';

  const logPayload = {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code,
    stack: err.stack,
  };

  if (statusCode >= 500) {
    logger.error(err.message, logPayload);
  } else {
    logger.warn(err.message, logPayload);
  }

  const responseBody = {
    success: false,
    message,
    code,
  };

  if (isAppError && err.details) {
    responseBody.details = err.details;
  }

  if (!env.isProduction() && !isAppError) {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
}

module.exports = errorHandler;
