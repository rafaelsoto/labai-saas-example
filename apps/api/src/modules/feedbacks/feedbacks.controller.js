const feedbacksService = require('./feedbacks.service');

async function list(req, res, next) {
  try {
    const result = await feedbacksService.list(req.userId, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const feedback = await feedbacksService.getById(req.params.id, req.userId);
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const feedback = await feedbacksService.markAsRead(req.params.id, req.userId);
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const { projectId } = req.body;
    const result = await feedbacksService.markAllAsRead(projectId, req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function del(req, res, next) {
  try {
    const result = await feedbacksService.del(req.params.id, req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, markAsRead, markAllAsRead, del };
