'use strict';

const { ZodError } = require('zod');
const AppError = require('../errors/AppError');
const errorCodes = require('../errors/errorCodes');

/**
 * Generic request validation middleware factory, powered by Zod.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} [source='body']
 * @returns {import('express').RequestHandler}
 */
function validate(schema, source = 'body') {
  return function validationMiddleware(req, res, next) {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((issue) => ({
          field: issue.path.join('.') || source,
          message: issue.message,
        }));

        return next(
          AppError.badRequest('Request validation failed', errorCodes.VALIDATION_ERROR, details)
        );
      }

      return next(err);
    }
  };
}

module.exports = validate;
