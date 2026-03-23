const { z } = require('zod');

const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    url: z.string().url().optional().nullable(),
  }),
});

const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    url: z.string().url().optional().nullable(),
    is_active: z.boolean().optional(),
    settings: z.object({
      widget_color: z.string().optional(),
      widget_position: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left']).optional(),
      widget_language: z.enum(['pt-BR', 'en', 'es']).optional(),
      prompt_text: z.string().max(200).optional(),
      thank_you_text: z.string().max(200).optional(),
    }).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }).optional(),
});

module.exports = { createProjectSchema, updateProjectSchema };
