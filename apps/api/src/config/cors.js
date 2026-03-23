const env = require('./env');

const allowedOrigins = [env.DASHBOARD_URL, env.LANDING_URL].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Sem origin = requisição server-side ou curl — permite
    if (!origin) return callback(null, true);
    // Lista vazia = nenhuma variável configurada — permite tudo (fallback seguro)
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
};

const widgetCorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
};

module.exports = { corsOptions, widgetCorsOptions };
