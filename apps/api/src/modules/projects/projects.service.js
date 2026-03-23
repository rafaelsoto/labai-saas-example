const db = require('../../config/database');
const { generateApiKey } = require('../../utils/generateApiKey');

async function list(userId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const projects = await db('projects')
    .where({ user_id: userId })
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  const projectsWithCount = await Promise.all(
    projects.map(async (project) => {
      const [{ count }] = await db('feedbacks')
        .where({ project_id: project.id })
        .count('id as count');
      return { ...project, feedback_count: parseInt(count, 10) };
    })
  );

  const [{ count: total }] = await db('projects').where({ user_id: userId }).count('id as count');

  return {
    data: projectsWithCount,
    pagination: {
      page,
      limit,
      total: parseInt(total, 10),
      pages: Math.ceil(parseInt(total, 10) / limit),
    },
  };
}

async function getById(projectId, userId) {
  const project = await db('projects')
    .where({ id: projectId, user_id: userId })
    .first();

  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  return project;
}

async function create(userId, data) {
  const api_key = generateApiKey();

  const defaultSettings = {
    widget_color: '#6366f1',
    widget_position: 'bottom-right',
    widget_language: 'pt-BR',
    prompt_text: 'Como foi sua experiência?',
    thank_you_text: 'Obrigado pelo seu feedback!',
  };

  const [project] = await db('projects')
    .insert({
      user_id: userId,
      name: data.name,
      url: data.url || null,
      api_key,
      settings: JSON.stringify(defaultSettings),
    })
    .returning('*');

  return project;
}

async function update(projectId, userId, data) {
  const project = await db('projects').where({ id: projectId, user_id: userId }).first();

  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  const updateData = { updated_at: db.fn.now() };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.url !== undefined) updateData.url = data.url;
  if (data.is_active !== undefined) updateData.is_active = data.is_active;
  if (data.settings !== undefined) {
    const currentSettings = typeof project.settings === 'string'
      ? JSON.parse(project.settings)
      : project.settings;
    updateData.settings = JSON.stringify({ ...currentSettings, ...data.settings });
  }

  const [updated] = await db('projects')
    .where({ id: projectId, user_id: userId })
    .update(updateData)
    .returning('*');

  return updated;
}

async function del(projectId, userId) {
  const project = await db('projects').where({ id: projectId, user_id: userId }).first();

  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  await db('projects').where({ id: projectId }).del();
  return { message: 'Project deleted' };
}

async function regenerateApiKey(projectId, userId) {
  const project = await db('projects').where({ id: projectId, user_id: userId }).first();

  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  const api_key = generateApiKey();

  const [updated] = await db('projects')
    .where({ id: projectId })
    .update({ api_key, updated_at: db.fn.now() })
    .returning('*');

  return updated;
}

module.exports = { list, getById, create, update, del, regenerateApiKey };
