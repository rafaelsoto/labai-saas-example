const { Router } = require('express');
const widgetController = require('./widget.controller');
const apiKeyMiddleware = require('../../middlewares/apiKeyMiddleware');
const validate = require('../../middlewares/validate');
const { submitFeedbackSchema } = require('./widget.validation');

const router = Router();

router.get('/embed.js', widgetController.serveEmbed);
router.get('/config', apiKeyMiddleware, widgetController.getConfig);
router.post('/feedbacks', apiKeyMiddleware, validate(submitFeedbackSchema), widgetController.createFeedback);

module.exports = router;
