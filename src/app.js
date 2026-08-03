'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const env = require('./config/env');
const routes = require('./routes/index.routes');
const requestLogger = require('./middlewares/requestLogger.middleware');
const rateLimiter = require('./middlewares/rateLimiter.middleware');
const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');
const { resolveServiceByName } = require('./services/platform.service');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST'],
  })
);

app.use(rateLimiter);

app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.JSON_BODY_LIMIT }));

app.use(requestLogger);

app.disable('x-powered-by');

app.get('/test-search', async (req, res) => {
  try {
    const platform = req.query.platform || 'youtube';
    const query = req.query.q || 'test';
    const { service } = resolveServiceByName(platform);
    const results = await service.search(query);
    res.json({ ok: true, platform, query, results });
  } catch (err) {
    res.json({ ok: false, message: err.message, stack: err.stack });
  }
});

app.use('/', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
