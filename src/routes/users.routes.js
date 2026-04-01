const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const { authorizePermission } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { createUserSchema, updateUserSchema } = require('../validators/userValidator');
const { listUsers, createUser, updateUser, deleteUser, getUserById, sanitizeUser } = require('../services/user.service');
const { AppError } = require('../utils/httpError');

const router = express.Router();

router.use(authenticate, authorizePermission('users:manage'));

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const users = await listUsers();
    res.status(200).json({ success: true, data: users });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);

    if (!user) {
      throw new AppError(404, 'User not found.');
    }

    res.status(200).json({ success: true, data: sanitizeUser(user) });
  })
);

router.post(
  '/',
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const user = await createUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: user
    });
  })
);

router.patch(
  '/:id',
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const user = await updateUser(req.params.id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: user
    });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await deleteUser(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
      data: result
    });
  })
);

module.exports = router;
