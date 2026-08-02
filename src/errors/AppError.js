'use strict';

const httpStatus = require('../constants/httpStatus');
const errorCodes = require('./errorCodes');

/**
 * Base operational error class used across the application.
 * All intentionally-thrown errors should extend or instantiate this class
 * so the centralized error handler can format them consistently.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human readable error message.
   * @param {number} statusCode - HTTP status code.
   * @param {string} code - Machine readable error code (see errorCodes.js).
   * @param {object|null} details - Optional extra details (e.g. validation issues).
   */
  constructor(
    message,
    statusCode = httpStatus.INTERNAL_SERVER_ERROR,
    code = errorCodes.INTERNAL_ERROR,
    details = null
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, code = errorCodes.VALIDATION_ERROR, details = null) {
    return new AppError(message, httpStatus.BAD_REQUEST, code, details);
  }

  static notFound(message = 'Resource not found', code = errorCodes.NOT_FOUND) {
    return new AppError(message, httpStatus.NOT_FOUND, code);
  }

  static notImplemented(message = 'Not implemented yet', code = errorCodes.NOT_IMPLEMENTED) {
    return new AppError(message, httpStatus.NOT_IMPLEMENTED, code);
  }

  static tooManyRequests(message = 'Too many requests', code = errorCodes.RATE_LIMITED) {
    return new AppError(message, httpStatus.TOO_MANY_REQUESTS, code);
  }

  static internal(message = 'Internal server error', code = errorCodes.INTERNAL_ERROR) {
    return new AppError(message, httpStatus.INTERNAL_SERVER_ERROR, code);
  }
}

module.exports = AppError;
