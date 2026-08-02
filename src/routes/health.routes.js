'use strict';

const { Router } = require('express');
const asyncHandler = require('../helpers/asyncHandler');
const healthController = require('../controllers/health.controller');

const router = Router();

router.get('/', asyncHandler(healthController.root));
router.get('/health', asyncHandler(healthController.health));

module.exports = router;
