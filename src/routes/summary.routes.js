const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const { authorizePermission } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { trendsQuerySchema, recentQuerySchema } = require('../validators/summaryValidator');
const { getOverview, getCategoryBreakdown, getRecentActivity, getTrends, getDashboardData } = require('../services/summary.service');

const router = express.Router();

router.use(authenticate, authorizePermission('summary:read'));

router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const data = await getDashboardData();
    res.status(200).json({ success: true, data });
  })
);

router.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const data = await getOverview();
    res.status(200).json({ success: true, data });
  })
);

router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const data = await getCategoryBreakdown();
    res.status(200).json({ success: true, data });
  })
);

router.get(
  '/recent',
  validate(recentQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const data = await getRecentActivity(req.query.limit);
    res.status(200).json({ success: true, data });
  })
);

router.get(
  '/trends',
  validate(trendsQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const data = await getTrends(req.query.interval);
    res.status(200).json({ success: true, data });
  })
);

module.exports = router;
