const express = require('express');
const { loginUser } = require('../services/auth.service');
const { validate } = require('../middleware/validate');
const { loginSchema } = require('../validators/authValidator');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await loginUser(req.body);
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result
    });
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: req.user
    });
  })
);

module.exports = router;
