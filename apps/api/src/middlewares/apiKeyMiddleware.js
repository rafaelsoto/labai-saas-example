const db = require('../config/database');

async function apiKeyMiddleware(req, res, next) {
  const apiKey = req.body?.apiKey || req.query?.apiKey || req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const project = await db('projects').where({ api_key: apiKey }).first();

  if (!project) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  if (!project.is_active) {
    return res.status(403).json({ error: 'Project is inactive' });
  }

  req.project = project;
  next();
}

module.exports = apiKeyMiddleware;
