const { z } = require('zod');

const trendsQuerySchema = z.object({
  interval: z.enum(['week', 'month']).default('month')
});

const recentQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5)
});

module.exports = {
  trendsQuerySchema,
  recentQuerySchema
};
