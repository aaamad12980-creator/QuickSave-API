'use strict';

const { Router } = require('express');

const healthRoutes = require('./health.routes');
const searchRoutes = require('./search.routes');
const downloadRoutes = require('./download.routes');

const router = Router();

router.use('/', healthRoutes);
router.use('/', searchRoutes);
router.use('/', downloadRoutes);

module.exports = router;
