const analyticsService = require('./analytics.service');

async function overview(req, res, next) {
  try {
    const { period = '30d' } = req.query;
    const data = await analyticsService.getOverview(req.userId, period);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function projectMetrics(req, res, next) {
  try {
    const { period = '30d' } = req.query;
    const data = await analyticsService.getProjectMetrics(req.params.projectId, req.userId, period);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function ratingsOverTime(req, res, next) {
  try {
    const { projectId, period = '30d', group = 'day' } = req.query;
    const data = await analyticsService.getRatingsOverTime(projectId, req.userId, period, group);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function feedbacksPerDay(req, res, next) {
  try {
    const { projectId, period = '30d' } = req.query;
    const data = await analyticsService.getFeedbacksPerDay(projectId, req.userId, period);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function topPages(req, res, next) {
  try {
    const { projectId, limit = '10' } = req.query;
    const data = await analyticsService.getTopPages(projectId, req.userId, parseInt(limit, 10));
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { overview, projectMetrics, ratingsOverTime, feedbacksPerDay, topPages };
