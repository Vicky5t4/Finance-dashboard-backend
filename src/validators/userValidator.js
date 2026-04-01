const { z } = require('zod');
const { ROLES, USER_STATUS } = require('../constants/roles');

const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80),
  email: z.string().trim().email('A valid email is required.').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  role: z.enum([ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN]),
  status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE]).optional().default(USER_STATUS.ACTIVE)
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  password: z.string().min(6).optional(),
  role: z.enum([ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN]).optional(),
  status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE]).optional()
}).refine((payload) => Object.keys(payload).length > 0, {
  message: 'At least one field is required for update.'
});

module.exports = {
  createUserSchema,
  updateUserSchema
};
