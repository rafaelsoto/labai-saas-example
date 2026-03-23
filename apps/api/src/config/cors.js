const env = require('./env');

const allowedOrigins = [env.DASHBOARD_URL, env.LANDING_URL].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

const widgetCorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
};

module.exports = { corsOptions, widgetCorsOptions };
