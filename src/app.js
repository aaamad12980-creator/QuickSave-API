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

const app = express();

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

app.use('/', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
