'use strict';

const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const httpStatus = require('../constants/httpStatus');
const errorCodes = require('../errors/errorCodes');

/**
 * Global API rate limiter. Values are configurable via environment
 * variables so they can be tuned per-deployment without code changes.
 */
const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(httpStatus.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many requests, please try again later.',
      code: errorCodes.RATE_LIMITED,
    });
  },
});

module.exports = rateLimiter;
