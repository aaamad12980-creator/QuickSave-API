'use strict';

/**
 * Standardized API response envelope helpers.
 * Keeping response shape consistent across every endpoint makes the API
 * predictable for any client consuming it.
 */

/**
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode=200]
 * @param {string} [options.message='Success']
 * @param {*} [options.data=null]
 * @param {object|null} [options.meta=null]
 */
function success(res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) {
  const payload = {
    success: true,
    message,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
}

/**
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode=500]
 * @param {string} [options.message='Something went wrong']
 * @param {string} [options.code='INTERNAL_ERROR']
 * @param {*} [options.details=null]
 */
function error(
  res,
  { statusCode = 500, message = 'Something went wrong', code = 'INTERNAL_ERROR', details = null } = {}
) {
  const payload = {
    success: false,
    message,
    code,
  };

  if (details) {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
}

module.exports = { success, error };
