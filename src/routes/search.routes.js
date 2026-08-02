'use strict';

const { Router } = require('express');
const asyncHandler = require('../helpers/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { searchSchema } = require('../validators/search.validator');
const searchController = require('../controllers/search.controller');

const router = Router();

router.post('/search', validate(searchSchema), asyncHandler(searchController.search));

module.exports = router;
