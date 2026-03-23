const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(255),
    email: z.string().email(),
    password: z.string().min(6).max(100),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    newPassword: z.string().min(6).max(100),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(255).optional(),
    avatar_url: z.string().url().optional().nullable(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6).max(100),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
};
