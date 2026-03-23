const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { corsOptions, widgetCorsOptions } = require('./config/cors');
const errorHandler = require('./middlewares/errorHandler');
const { globalLimiter, authLimiter, widgetLimiter } = require('./middlewares/rateLimiter');
const authRoutes = require('./modules/auth/auth.routes');
const projectsRoutes = require('./modules/projects/projects.routes');
const widgetRoutes = require('./modules/widget/widget.routes');
const feedbacksRoutes = require('./modules/feedbacks/feedbacks.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const app = express();

// crossOriginResourcePolicy: cross-origin permite que sites externos carreguem o embed.js
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Widget routes: CORS aberto para qualquer origem + rate limiter no POST de feedbacks
app.use('/api/widget', cors(widgetCorsOptions), widgetRoutes);
app.use('/api/widget/feedbacks', cors(widgetCorsOptions), widgetLimiter);

// Rotas autenticadas: CORS restrito
app.use(cors(corsOptions));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Auth com rate limiter
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/feedbacks', feedbacksRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(errorHandler);

module.exports = app;
