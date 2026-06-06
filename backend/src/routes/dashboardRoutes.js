const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/', generalLimiter, auth, requirePermission('reports', 'view'), dashboardController.getDashboard);

module.exports = router;
