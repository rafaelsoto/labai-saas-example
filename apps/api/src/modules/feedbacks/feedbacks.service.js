const db = require('../../config/database');

async function list(userId, filters = {}) {
  const {
    projectId,
    rating,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 20,
  } = filters;

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const userProjects = await db('projects').where({ user_id: userId }).select('id');
  const projectIds = userProjects.map((p) => p.id);

  if (projectIds.length === 0) {
    return { data: [], pagination: { page: 1, limit: parseInt(limit, 10), total: 0, pages: 0 } };
  }

  let query = db('feedbacks')
    .join('projects', 'feedbacks.project_id', 'projects.id')
    .whereIn('feedbacks.project_id', projectIds)
    .select(
      'feedbacks.*',
      'projects.name as project_name'
    )
    .orderBy('feedbacks.created_at', 'desc');

  if (projectId) query = query.where('feedbacks.project_id', projectId);

  if (rating) {
    const ratings = Array.isArray(rating) ? rating : [rating];
    const numericRatings = ratings.map(Number).filter((r) => r >= 1 && r <= 5);
    if (numericRatings.length > 0) query = query.whereIn('feedbacks.rating', numericRatings);
  }

  if (startDate) query = query.where('feedbacks.created_at', '>=', new Date(startDate));
  if (endDate) query = query.where('feedbacks.created_at', '<=', new Date(endDate));
  if (search) query = query.where('feedbacks.message', 'ilike', `%${search}%`);

  const countQuery = query.clone().clearSelect().clearOrder().count('feedbacks.id as count');
  const [{ count: total }] = await countQuery;

  const data = await query.limit(parseInt(limit, 10)).offset(offset);

  return {
    data,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total: parseInt(total, 10),
      pages: Math.ceil(parseInt(total, 10) / parseInt(limit, 10)),
    },
  };
}

async function getById(feedbackId, userId) {
  const userProjects = await db('projects').where({ user_id: userId }).select('id');
  const projectIds = userProjects.map((p) => p.id);

  const feedback = await db('feedbacks')
    .whereIn('project_id', projectIds)
    .where({ id: feedbackId })
    .first();

  if (!feedback) {
    const err = new Error('Feedback not found');
    err.status = 404;
    throw err;
  }

  return feedback;
}

async function markAsRead(feedbackId, userId) {
  const feedback = await getById(feedbackId, userId);
  const [updated] = await db('feedbacks')
    .where({ id: feedback.id })
    .update({ is_read: true })
    .returning('*');
  return updated;
}

async function markAllAsRead(projectId, userId) {
  const project = await db('projects').where({ id: projectId, user_id: userId }).first();
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  const count = await db('feedbacks')
    .where({ project_id: projectId, is_read: false })
    .update({ is_read: true });

  return { count, message: `${count} feedbacks marked as read` };
}

async function del(feedbackId, userId) {
  const feedback = await getById(feedbackId, userId);
  await db('feedbacks').where({ id: feedback.id }).del();
  return { message: 'Feedback deleted' };
}

module.exports = { list, getById, markAsRead, markAllAsRead, del };
