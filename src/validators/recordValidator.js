const { z } = require('zod');

const validDate = (value) => !Number.isNaN(new Date(value).getTime());

const createRecordSchema = z.object({
  amount: z.number({ invalid_type_error: 'Amount must be a number.' }).positive('Amount must be greater than 0.'),
  type: z.enum(['income', 'expense']),
  category: z.string().trim().min(2, 'Category must be at least 2 characters.').max(50),
  date: z.string().refine(validDate, 'A valid date is required.'),
  notes: z.string().trim().max(250).optional().default('')
});

const updateRecordSchema = z.object({
  amount: z.number({ invalid_type_error: 'Amount must be a number.' }).positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().trim().min(2).max(50).optional(),
  date: z.string().refine(validDate, 'A valid date is required.').optional(),
  notes: z.string().trim().max(250).optional()
}).refine((payload) => Object.keys(payload).length > 0, {
  message: 'At least one field is required for update.'
});

const listRecordsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.enum(['amount', 'date', 'category', 'createdAt', 'updatedAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
}).superRefine((payload, ctx) => {
  if (payload.fromDate && !validDate(payload.fromDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['fromDate'],
      message: 'fromDate must be a valid date.'
    });
  }

  if (payload.toDate && !validDate(payload.toDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['toDate'],
      message: 'toDate must be a valid date.'
    });
  }
});

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  listRecordsQuerySchema
};
