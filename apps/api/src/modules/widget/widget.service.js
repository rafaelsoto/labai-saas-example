const db = require('../../config/database');

async function getConfig(apiKey) {
  const project = await db('projects').where({ api_key: apiKey }).first();
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  const settings = typeof project.settings === 'string'
    ? JSON.parse(project.settings)
    : project.settings;

  await db('api_keys_log').insert({
    project_id: project.id,
    api_key: apiKey,
    action: 'widget_loaded',
    ip_address: null,
  }).catch(() => {});

  return {
    project_name: project.name,
    settings,
  };
}

async function createFeedback(projectId, data, req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || null;

  const userAgent = req.headers['user-agent'] || null;
  const apiKey = req.project?.api_key;

  let message = data.message || null;
  if (message) {
    message = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .substring(0, 2000);
  }

  const pageUrl = (data.page_url || '').substring(0, 1000);

  const [feedback] = await db('feedbacks').insert({
    project_id: projectId,
    rating: data.rating,
    message,
    page_url: pageUrl,
    user_agent: userAgent ? userAgent.substring(0, 500) : null,
    ip_address: ip,
    metadata: JSON.stringify(data.metadata || {}),
  }).returning('*');

  if (apiKey) {
    await db('api_keys_log').insert({
      project_id: projectId,
      api_key: apiKey,
      action: 'feedback_created',
      ip_address: ip,
    }).catch(() => {});
  }

  return feedback;
}

module.exports = { getConfig, createFeedback };
