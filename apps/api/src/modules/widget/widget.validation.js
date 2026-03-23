const { z } = require('zod');

const submitFeedbackSchema = z.object({
  body: z.object({
    apiKey: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    message: z.string().max(2000).optional().nullable(),
    page_url: z.string().max(1000).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

module.exports = { submitFeedbackSchema };
