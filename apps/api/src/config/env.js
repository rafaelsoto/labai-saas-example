require('dotenv').config();

const env = {
  PORT: process.env.PORT || 3333,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),
  DB_NAME: process.env.DB_NAME || 'feedbackflow',
  DB_USER: process.env.DB_USER || 'feedbackflow',
  DB_PASSWORD: process.env.DB_PASSWORD || 'secret',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DASHBOARD_URL: process.env.DASHBOARD_URL || 'http://localhost:3001',
  LANDING_URL: process.env.LANDING_URL || 'http://localhost:3000',
};

module.exports = env;
