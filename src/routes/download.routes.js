'use strict';

const { Router } = require('express');
const asyncHandler = require('../helpers/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { downloadSchema } = require('../validators/download.validator');
const downloadController = require('../controllers/download.controller');

const router = Router();

router.post('/download', validate(downloadSchema), asyncHandler(downloadController.download));

module.exports = router;
