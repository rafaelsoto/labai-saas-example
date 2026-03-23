const { z } = require('zod');

const listFeedbacksSchema = z.object({
  query: z.object({
    projectId: z.string().uuid().optional(),
    rating: z.union([z.string(), z.array(z.string())]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

module.exports = { listFeedbacksSchema };
