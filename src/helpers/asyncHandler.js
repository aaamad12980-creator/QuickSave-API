'use strict';

/**
 * Wraps an async Express route/controller function so that any rejected
 * promise (thrown error) is automatically forwarded to the centralized
 * error-handling middleware via next(err).
 *
 * Usage:
 *   router.post('/search', asyncHandler(searchController.search));
 *
 * @param {Function} fn - async (req, res, next) => {}
 * @returns {Function} Express-compatible middleware
 */
function asyncHandler(fn) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
