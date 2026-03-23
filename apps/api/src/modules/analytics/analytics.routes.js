const { Router } = require('express');
const analyticsController = require('./analytics.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = Router();

router.use(authMiddleware);

router.get('/overview', analyticsController.overview);
router.get('/project/:projectId', analyticsController.projectMetrics);
router.get('/ratings-over-time', analyticsController.ratingsOverTime);
router.get('/feedbacks-per-day', analyticsController.feedbacksPerDay);
router.get('/top-pages', analyticsController.topPages);

module.exports = router;
