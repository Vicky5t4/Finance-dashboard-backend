const express = require('express');
const { getState } = require('../store/database');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const state = await getState();
    res.status(200).json({
      success: true,
      message: 'Finance dashboard backend is healthy.',
      data: {
        uptimeInSeconds: process.uptime(),
        storageMode: state.meta.storageMode,
        userCount: state.users.length,
        recordCount: state.records.filter((entry) => !entry.isDeleted).length
      }
    });
  })
);

module.exports = router;
