const db = require('../../config/database');

function periodToInterval(period) {
  const map = { '7d': '7 days', '30d': '30 days', '90d': '90 days' };
  return map[period] || '30 days';
}

async function getUserProjectIds(userId) {
  const projects = await db('projects').where({ user_id: userId }).select('id');
  return projects.map((p) => p.id);
}

async function getOverview(userId, period = '30d') {
  const interval = periodToInterval(period);
  const projectIds = await getUserProjectIds(userId);

  if (projectIds.length === 0) {
    return { totalFeedbacks: 0, avgRating: 0, totalProjects: 0, trend: 0 };
  }

  const [current] = await db('feedbacks')
    .whereIn('project_id', projectIds)
    .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${interval}'`))
    .select(
      db.raw('COUNT(*) as total'),
      db.raw('ROUND(AVG(rating)::numeric, 2) as avg_rating')
    );

  const [previous] = await db('feedbacks')
    .whereIn('project_id', projectIds)
    .where('created_at', '<', db.raw(`NOW() - INTERVAL '${interval}'`))
    .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${interval}' * 2`))
    .select(db.raw('COUNT(*) as total'));

  const currentTotal = parseInt(current.total, 10);
  const previousTotal = parseInt(previous.total, 10);

  let trend = 0;
  if (previousTotal > 0) {
    trend = Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
  } else if (currentTotal > 0) {
    trend = 100;
  }

  return {
    totalFeedbacks: currentTotal,
    avgRating: parseFloat(current.avg_rating) || 0,
    totalProjects: projectIds.length,
    trend,
  };
}

async function getProjectMetrics(projectId, userId, period = '30d') {
  const interval = periodToInterval(period);

  const project = await db('projects').where({ id: projectId, user_id: userId }).first();
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  const [current] = await db('feedbacks')
    .where({ project_id: projectId })
    .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${interval}'`))
    .select(
      db.raw('COUNT(*) as total'),
      db.raw('ROUND(AVG(rating)::numeric, 2) as avg_rating')
    );

  const [previous] = await db('feedbacks')
    .where({ project_id: projectId })
    .where('created_at', '<', db.raw(`NOW() - INTERVAL '${interval}'`))
    .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${interval}' * 2`))
    .select(db.raw('COUNT(*) as total'));

  const ratingDistribution = await db('feedbacks')
    .where({ project_id: projectId })
    .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${interval}'`))
    .select('rating', db.raw('COUNT(*) as count'))
    .groupBy('rating')
    .orderBy('rating');

  const distribution = [1, 2, 3, 4, 5].map((r) => {
    const found = ratingDistribution.find((d) => d.rating === r);
    return { rating: r, count: found ? parseInt(found.count, 10) : 0 };
  });

  const currentTotal = parseInt(current.total, 10);
  const previousTotal = parseInt(previous.total, 10);
  let trend = 0;
  if (previousTotal > 0) {
    trend = Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
  } else if (currentTotal > 0) {
    trend = 100;
  }

  return {
    totalFeedbacks: currentTotal,
    avgRating: parseFloat(current.avg_rating) || 0,
    ratingDistribution: distribution,
    trend,
  };
}

async function getRatingsOverTime(projectId, userId, period = '30d', group = 'day') {
  const interval = periodToInterval(period);

  const project = await db('projects').where({ id: projectId, user_id: userId }).first();
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  const truncUnit = group === 'week' ? 'week' : 'day';

  const rows = await db('feedbacks')
    .where({ project_id: projectId })
    .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${interval}'`))
    .select(
      db.raw(`date_trunc('${truncUnit}', created_at) as date`),
      db.raw('ROUND(AVG(rating)::numeric, 2) as avg_rating'),
      db.raw('COUNT(*) as count')
    )
    .groupByRaw(`date_trunc('${truncUnit}', created_at)`)
    .orderBy('date');

  return rows.map((r) => ({
    date: r.date,
    avgRating: parseFloat(r.avg_rating),
    count: parseInt(r.count, 10),
  }));
}

async function getFeedbacksPerDay(projectId, userId, period = '30d') {
  const interval = periodToInterval(period);

  const project = await db('projects').where({ id: projectId, user_id: userId }).first();
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  const rows = await db('feedbacks')
    .where({ project_id: projectId })
    .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${interval}'`))
    .select(
      db.raw(`date_trunc('day', created_at) as date`),
      db.raw('COUNT(*) as count')
    )
    .groupByRaw(`date_trunc('day', created_at)`)
    .orderBy('date');

  return rows.map((r) => ({
    date: r.date,
    count: parseInt(r.count, 10),
  }));
}

async function getTopPages(projectId, userId, limit = 10) {
  const project = await db('projects').where({ id: projectId, user_id: userId }).first();
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  const rows = await db('feedbacks')
    .where({ project_id: projectId })
    .whereNotNull('page_url')
    .select(
      'page_url as url',
      db.raw('COUNT(*) as count'),
      db.raw('ROUND(AVG(rating)::numeric, 2) as avg_rating')
    )
    .groupBy('page_url')
    .orderBy('count', 'desc')
    .limit(limit);

  return rows.map((r) => ({
    url: r.url,
    count: parseInt(r.count, 10),
    avgRating: parseFloat(r.avg_rating),
  }));
}

module.exports = {
  getOverview,
  getProjectMetrics,
  getRatingsOverTime,
  getFeedbacksPerDay,
  getTopPages,
};
