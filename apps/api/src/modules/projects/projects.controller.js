const projectsService = require('./projects.service');

async function list(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await projectsService.list(req.userId, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const project = await projectsService.getById(req.params.id, req.userId);
    res.json({ project });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const project = await projectsService.create(req.userId, req.body);
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const project = await projectsService.update(req.params.id, req.userId, req.body);
    res.json({ project });
  } catch (err) {
    next(err);
  }
}

async function del(req, res, next) {
  try {
    const result = await projectsService.del(req.params.id, req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function regenerateApiKey(req, res, next) {
  try {
    const project = await projectsService.regenerateApiKey(req.params.id, req.userId);
    res.json({ project });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, del, regenerateApiKey };
