'use strict';

const os = require('os');
const responseFormatter = require('../utils/responseFormatter');
const httpStatus = require('../constants/httpStatus');
const env = require('../config/env');

async function root(req, res) {
  return responseFormatter.success(res, {
    statusCode: httpStatus.OK,
    message: `${env.APP_NAME} API is running`,
    data: {
      name: env.APP_NAME,
      status: 'online',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
}

async function health(req, res) {
  const uptimeSeconds = process.uptime();

  return responseFormatter.success(res, {
    statusCode: httpStatus.OK,
    message: 'Healthy',
    data: {
      status: 'ok',
      uptimeSeconds: Number(uptimeSeconds.toFixed(2)),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      host: os.hostname(),
      memory: {
        rssMB: Number((process.memoryUsage().rss / 1024 / 1024).toFixed(2)),
      },
    },
  });
}

module.exports = { root, health };
