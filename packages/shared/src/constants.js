const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
};

const PLAN_LIMITS = {
  [PLANS.FREE]: {
    projects: 1,
    feedbacksPerMonth: 100,
    analyticsRetentionDays: 30,
  },
  [PLANS.PRO]: {
    projects: 10,
    feedbacksPerMonth: 10000,
    analyticsRetentionDays: 365,
  },
  [PLANS.ENTERPRISE]: {
    projects: Infinity,
    feedbacksPerMonth: Infinity,
    analyticsRetentionDays: Infinity,
  },
};

module.exports = { PLANS, PLAN_LIMITS };
