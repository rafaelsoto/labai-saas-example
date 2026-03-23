const { Router } = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validate');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('./auth.validation');

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.me);
router.put('/me', authMiddleware, validate(updateProfileSchema), authController.updateProfile);
router.put('/change-password', authMiddleware, validate(changePasswordSchema), authController.changePassword);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
